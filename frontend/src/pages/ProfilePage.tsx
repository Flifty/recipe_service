import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    deleteRecipe,
    getMyRecipes,
    getRecipeById,
    searchRecipes,
} from '../api/recipes';
import { deleteReview, getReviewsByRecipeId, updateReview } from '../api/reviews';
import { deleteUser, getUserById, updateUser, type UserInfo } from '../api/users';
import { changePassword, loginUser } from '../api/auth';
import type { RecipeCardItem, RecipeDetails, ReviewItem } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeFormModal } from '../components/RecipeFormModal';
import { useToast } from '../components/ToastProvider';

interface CurrentUser {
    id?: number;
    username: string;
    email: string;
}

interface MyReviewWithRecipe extends ReviewItem {
    recipeName: string;
}

function getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem('currentUser');

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as CurrentUser;
    } catch {
        return null;
    }
}

export function ProfilePage() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const currentUser = useMemo(() => getCurrentUser(), []);

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [myRecipes, setMyRecipes] = useState<RecipeCardItem[]>([]);
    const [myReviews, setMyReviews] = useState<MyReviewWithRecipe[]>([]);

    const [showAllRecipes, setShowAllRecipes] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
    const [recipeModalMode, setRecipeModalMode] = useState<'create' | 'edit'>('create');
    const [editingRecipe, setEditingRecipe] = useState<RecipeDetails | null>(null);

    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editingReviewText, setEditingReviewText] = useState('');

    const [deletingRecipeId, setDeletingRecipeId] = useState<number | null>(null);
    const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isProfilePasswordConfirmed, setIsProfilePasswordConfirmed] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [profileUsername, setProfileUsername] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [profilePassword, setProfilePassword] = useState('');
    const [profileConfirmPassword, setProfileConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(true);
    const [showProfilePassword, setShowProfilePassword] = useState(true);
    const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(true);

    const [profileSaving, setProfileSaving] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAuthenticated = Boolean(localStorage.getItem('token'));

    const visibleRecipes = showAllRecipes ? myRecipes : myRecipes.slice(0, 2);
    const visibleReviews = showAllReviews ? myReviews : myReviews.slice(0, 2);

    const renderPasswordField = (
        value: string,
        onChange: (value: string) => void,
        placeholder: string,
        isVisible: boolean,
        onToggleVisibility: () => void
    ) => (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type={isVisible ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '12px 46px 12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #d9c2a7',
                    boxSizing: 'border-box',
                }}
            />

            <button
                type="button"
                onClick={onToggleVisibility}
                aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    width: '28px',
                    height: '28px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '17px',
                    lineHeight: 1,
                }}
            >
                {isVisible ? '🙈' : '👁'}
            </button>
        </div>
    );

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');

        window.dispatchEvent(new Event('auth-state-changed'));
        navigate('/');
    };

    const loadProfile = async () => {
        if (!currentUser?.id) {
            setLoading(false);
            setError('Не удалось определить пользователя. Выйдите из аккаунта и войдите снова.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const [userData, recipesData, allRecipesData] = await Promise.all([
                getUserById(currentUser.id),
                getMyRecipes(),
                searchRecipes({
                    page: 0,
                    limit: 1000,
                    sortField: 'CREATED_AT',
                    sortDirection: 'DESC',
                }),
            ]);

            if (userData.success && userData.payload) {
                setUserInfo(userData.payload);
            }

            if (recipesData.success && recipesData.payload) {
                setMyRecipes(recipesData.payload);
            }

            const allRecipes = allRecipesData.payload?.content ?? [];

            const reviewsByRecipes = await Promise.all(
                allRecipes.map(async (recipe) => {
                    try {
                        const reviewsData = await getReviewsByRecipeId(recipe.id);

                        if (!reviewsData.success || !reviewsData.payload) {
                            return [];
                        }

                        return reviewsData.payload
                            .filter((review) => review.userId === currentUser.id)
                            .map((review) => ({
                                ...review,
                                recipeName: recipe.name,
                            }));
                    } catch {
                        return [];
                    }
                })
            );

            setMyReviews(reviewsByRecipes.flat());
        } catch (e) {
            setError('Не удалось загрузить профиль');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        loadProfile();
    }, [isAuthenticated]);

    const startEditProfile = () => {
        setProfileUsername(userInfo?.username ?? currentUser?.username ?? '');
        setProfileEmail(userInfo?.email ?? currentUser?.email ?? '');
        setCurrentPassword('');
        setProfilePassword('');
        setProfileConfirmPassword('');
        setShowCurrentPassword(true);
        setShowProfilePassword(true);
        setShowProfileConfirmPassword(true);
        setIsProfilePasswordConfirmed(false);
        setIsEditingProfile(true);
    };

    const cancelEditProfile = () => {
        setIsEditingProfile(false);
        setIsProfilePasswordConfirmed(false);
        setCurrentPassword('');
        setProfileUsername('');
        setProfileEmail('');
        setProfilePassword('');
        setProfileConfirmPassword('');
    };

    const verifyCurrentPassword = async () => {
        const emailForCheck = userInfo?.email ?? currentUser?.email;

        if (!emailForCheck) {
            showToast('Не удалось определить почту пользователя.', 'error');
            return;
        }

        if (!currentPassword.trim()) {
            showToast('Введите текущий пароль.', 'error');
            return;
        }

        try {
            setProfileSaving(true);

            const data = await loginUser(emailForCheck, currentPassword);

            if (!data.success || !data.payload) {
                showToast(data.message || 'Неверный пароль.', 'error');
                return;
            }

            setIsProfilePasswordConfirmed(true);
            showToast('Пароль подтверждён. Теперь можно изменить данные.', 'success');
        } catch (e) {
            showToast('Неверный пароль.', 'error');
        } finally {
            setProfileSaving(false);
        }
    };

    const saveProfile = async () => {
        if (!currentUser?.id) {
            showToast('Не удалось определить пользователя.', 'error');
            return;
        }

        if (!profileUsername.trim()) {
            showToast('Введите имя пользователя.', 'error');
            return;
        }

        if (!profileEmail.trim()) {
            showToast('Введите почту пользователя.', 'error');
            return;
        }

        const shouldChangePassword = Boolean(profilePassword || profileConfirmPassword);

        if (shouldChangePassword && !profilePassword) {
            showToast('Введите новый пароль.', 'error');
            return;
        }

        if (shouldChangePassword && !profileConfirmPassword) {
            showToast('Подтвердите новый пароль.', 'error');
            return;
        }

        if (shouldChangePassword && profilePassword !== profileConfirmPassword) {
            showToast('Новый пароль и подтверждение не совпадают.', 'error');
            return;
        }

        try {
            setProfileSaving(true);

            if (shouldChangePassword) {
                const passwordData = await changePassword({
                    password: profilePassword,
                    confirmPassword: profileConfirmPassword,
                });

                if (!passwordData.success) {
                    showToast(passwordData.message || 'Не удалось изменить пароль.', 'error');
                    return;
                }
            }

            const data = await updateUser(currentUser.id, {
                username: profileUsername.trim(),
                email: profileEmail.trim(),
            });

            if (!data.success || !data.payload) {
                showToast(data.message || 'Не удалось обновить профиль.', 'error');
                return;
            }

            const passwordForRelogin = shouldChangePassword ? profilePassword : currentPassword;
            const loginData = await loginUser(data.payload.email, passwordForRelogin);

            if (loginData.success && loginData.payload) {
                localStorage.setItem('token', loginData.payload.token);
                localStorage.setItem('refreshToken', loginData.payload.refreshToken);
            }

            setUserInfo(data.payload);

            localStorage.setItem(
                'currentUser',
                JSON.stringify({
                    id: data.payload.id,
                    username: data.payload.username,
                    email: data.payload.email,
                })
            );

            window.dispatchEvent(new Event('auth-state-changed'));

            setIsEditingProfile(false);
            setIsProfilePasswordConfirmed(false);
            setCurrentPassword('');
            setProfilePassword('');
            setProfileConfirmPassword('');

            showToast(
                shouldChangePassword
                    ? 'Данные профиля и пароль обновлены.'
                    : 'Данные профиля обновлены.',
                'success'
            );
        } catch (e) {
            showToast('Не удалось обновить профиль.', 'error');
        } finally {
            setProfileSaving(false);
        }
    };

    const openCreateRecipeModal = () => {
        setEditingRecipe(null);
        setRecipeModalMode('create');
        setIsRecipeModalOpen(true);
    };

    const openEditRecipeModal = async (recipeId: number) => {
        try {
            const data = await getRecipeById(recipeId);

            if (!data.success || !data.payload) {
                showToast(data.message || 'Не удалось загрузить блюдо.', 'error');
                return;
            }

            setEditingRecipe(data.payload);
            setRecipeModalMode('edit');
            setIsRecipeModalOpen(true);
        } catch (e) {
            showToast('Не удалось загрузить блюдо.', 'error');
        }
    };

    const handleDeleteRecipe = async (recipeId: number) => {
        try {
            await deleteRecipe(recipeId);
            setMyRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
            setDeletingRecipeId(null);
            showToast('Блюдо удалено.', 'success');
        } catch (e) {
            showToast('Не удалось удалить блюдо.', 'error');
        }
    };

    const startEditReview = (review: MyReviewWithRecipe) => {
        setEditingReviewId(review.id);
        setEditingReviewText(review.text);
    };

    const cancelEditReview = () => {
        setEditingReviewId(null);
        setEditingReviewText('');
    };

    const saveEditedReview = async (reviewId: number) => {
        if (!editingReviewText.trim()) {
            showToast('Комментарий не может быть пустым.', 'error');
            return;
        }

        try {
            const updatedData = await updateReview(reviewId, editingReviewText.trim());

            if (!updatedData.success || !updatedData.payload) {
                showToast(updatedData.message || 'Не удалось изменить комментарий.', 'error');
                return;
            }

            setMyReviews((prev) =>
                prev.map((item) =>
                    item.id === reviewId
                        ? {
                            ...item,
                            text: updatedData.payload.text,
                        }
                        : item
                )
            );

            cancelEditReview();
            showToast('Комментарий изменён.', 'success');
        } catch (e) {
            showToast('Не удалось изменить комментарий.', 'error');
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        try {
            await deleteReview(reviewId);
            setMyReviews((prev) => prev.filter((review) => review.id !== reviewId));
            setDeletingReviewId(null);
            showToast('Комментарий удалён.', 'success');
        } catch (e) {
            showToast('Не удалось удалить комментарий.', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        if (!currentUser?.id) {
            showToast('Не удалось определить пользователя.', 'error');
            return;
        }

        try {
            await deleteUser(currentUser.id);

            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');

            window.dispatchEvent(new Event('auth-state-changed'));
            navigate('/');
        } catch (e) {
            showToast('Не удалось удалить аккаунт.', 'error');
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '32px 40px' }}>
                <h1 style={{ marginTop: 0, fontSize: '48px', textAlign: 'left' }}>Профиль</h1>

                <div className="app-surface" style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '18px', marginTop: 0 }}>
                        Чтобы открыть профиль, нужно войти в аккаунт.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div style={{ padding: '32px 40px' }}>Загрузка профиля...</div>;
    }

    if (error) {
        return <div style={{ padding: '32px 40px', color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '32px 40px' }}>
            <h1
                style={{
                    marginTop: 0,
                    marginBottom: '24px',
                    fontSize: '48px',
                    textAlign: 'left',
                }}
            >
                Профиль
            </h1>

            <section
                className="app-surface"
                style={{
                    marginBottom: '24px',
                    textAlign: 'left',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}
                >
                    <h2 style={{ margin: 0 }}>Информация об аккаунте</h2>

                    {!isEditingProfile && (
                        <button
                            onClick={startEditProfile}
                            className="app-secondary-button"
                        >
                            Изменить данные
                        </button>
                    )}
                </div>

                {isEditingProfile ? (
                    !isProfilePasswordConfirmed ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '14px',
                                maxWidth: '520px',
                            }}
                        >
                            <p style={{ marginTop: 0, marginBottom: 0, lineHeight: 1.5 }}>
                                Для изменения данных подтвердите, что это ваш аккаунт.
                            </p>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                                    Текущий пароль
                                </label>

                                {renderPasswordField(
                                    currentPassword,
                                    setCurrentPassword,
                                    'Введите текущий пароль',
                                    showCurrentPassword,
                                    () => setShowCurrentPassword((prev) => !prev)
                                )}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'flex-end',
                                    marginTop: '4px',
                                }}
                            >
                                <button
                                    onClick={cancelEditProfile}
                                    className="app-secondary-button"
                                    disabled={profileSaving}
                                >
                                    Отмена
                                </button>

                                <button
                                    onClick={verifyCurrentPassword}
                                    className="app-primary-button"
                                    disabled={profileSaving}
                                >
                                    {profileSaving ? 'Проверяем...' : 'Продолжить'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '14px',
                            }}
                        >
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                                    Имя пользователя
                                </label>
                                <input
                                    value={profileUsername}
                                    onChange={(e) => setProfileUsername(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid #d9c2a7',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                                    Почта
                                </label>
                                <input
                                    value={profileEmail}
                                    onChange={(e) => setProfileEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid #d9c2a7',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                                    Новый пароль
                                </label>

                                {renderPasswordField(
                                    profilePassword,
                                    setProfilePassword,
                                    'Оставьте пустым, если не меняете',
                                    showProfilePassword,
                                    () => setShowProfilePassword((prev) => !prev)
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                                    Подтверждение пароля
                                </label>

                                {renderPasswordField(
                                    profileConfirmPassword,
                                    setProfileConfirmPassword,
                                    'Повторите новый пароль',
                                    showProfileConfirmPassword,
                                    () => setShowProfileConfirmPassword((prev) => !prev)
                                )}
                            </div>

                            <div
                                style={{
                                    gridColumn: '1 / -1',
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'flex-end',
                                    marginTop: '4px',
                                }}
                            >
                                <button
                                    onClick={cancelEditProfile}
                                    className="app-secondary-button"
                                    disabled={profileSaving}
                                >
                                    Отмена
                                </button>

                                <button
                                    onClick={saveProfile}
                                    className="app-primary-button"
                                    disabled={profileSaving}
                                >
                                    {profileSaving ? 'Сохраняем...' : 'Сохранить'}
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        <p><strong>Имя пользователя:</strong> {userInfo?.username ?? currentUser?.username}</p>
                        <p><strong>Почта:</strong> {userInfo?.email ?? currentUser?.email}</p>
                        <p><strong>Пароль:</strong> ********</p>
                        <p><strong>Мои блюда:</strong> {myRecipes.length}</p>
                        <p><strong>Мои комментарии:</strong> {myReviews.length}</p>
                    </>
                )}
            </section>

            <section
                className="app-surface"
                style={{
                    marginBottom: '24px',
                    textAlign: 'left',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <h2 style={{ margin: 0 }}>Мои блюда</h2>

                    <button
                        onClick={openCreateRecipeModal}
                        className="app-primary-button"
                    >
                        + Добавить новое блюдо
                    </button>
                </div>

                {myRecipes.length === 0 ? (
                    <p>Вы пока не добавляли блюда.</p>
                ) : (
                    <>
                        {visibleRecipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                actionContent={
                                    <>
                                        {deletingRecipeId === recipe.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleDeleteRecipe(recipe.id)}
                                                    className="app-danger-button"
                                                >
                                                    Да, удалить
                                                </button>

                                                <button
                                                    onClick={() => setDeletingRecipeId(null)}
                                                    className="app-secondary-button"
                                                >
                                                    Отмена
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => openEditRecipeModal(recipe.id)}
                                                    className="app-secondary-button"
                                                >
                                                    Изменить
                                                </button>

                                                <button
                                                    onClick={() => setDeletingRecipeId(recipe.id)}
                                                    className="app-secondary-danger-button"
                                                >
                                                    Удалить
                                                </button>
                                            </>
                                        )}
                                    </>
                                }
                            />
                        ))}

                        {myRecipes.length > 2 && (
                            <button
                                onClick={() => setShowAllRecipes((prev) => !prev)}
                                className="app-secondary-button"
                            >
                                {showAllRecipes ? 'Скрыть' : '... Показать все блюда'}
                            </button>
                        )}
                    </>
                )}
            </section>

            <section
                className="app-surface"
                style={{
                    marginBottom: '24px',
                    textAlign: 'left',
                }}
            >
                <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Мои комментарии</h2>

                {myReviews.length === 0 ? (
                    <p>Вы пока не оставляли комментарии.</p>
                ) : (
                    <>
                        {visibleReviews.map((review) => {
                            const isEditing = editingReviewId === review.id;
                            const isDeleting = deletingReviewId === review.id;

                            return (
                                <div
                                    key={review.id}
                                    style={{
                                        border: '1px solid #ead9c4',
                                        borderRadius: '14px',
                                        padding: '16px',
                                        marginBottom: '14px',
                                        backgroundColor: '#fffdf9',
                                    }}
                                >
                                    <h3 style={{ marginTop: 0, marginBottom: '8px' }}>
                                        {review.recipeName}
                                    </h3>

                                    {isEditing ? (
                                        <>
                                            <textarea
                                                value={editingReviewText}
                                                onChange={(e) => setEditingReviewText(e.target.value)}
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    resize: 'vertical',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #d9c2a7',
                                                    boxSizing: 'border-box',
                                                    marginBottom: '10px',
                                                }}
                                            />

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => saveEditedReview(review.id)}
                                                    className="app-primary-button"
                                                >
                                                    Сохранить
                                                </button>

                                                <button
                                                    onClick={cancelEditReview}
                                                    className="app-secondary-button"
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <p style={{ marginTop: 0, lineHeight: 1.5 }}>
                                            {review.text}
                                        </p>
                                    )}

                                    {!isEditing && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => startEditReview(review)}
                                                className="app-secondary-button"
                                            >
                                                Изменить
                                            </button>

                                            {isDeleting ? (
                                                <>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="app-danger-button"
                                                    >
                                                        Да, удалить
                                                    </button>

                                                    <button
                                                        onClick={() => setDeletingReviewId(null)}
                                                        className="app-secondary-button"
                                                    >
                                                        Отмена
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setDeletingReviewId(review.id)}
                                                    className="app-secondary-danger-button"
                                                >
                                                    Удалить
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {myReviews.length > 2 && (
                            <button
                                onClick={() => setShowAllReviews((prev) => !prev)}
                                className="app-secondary-button"
                            >
                                {showAllReviews ? 'Скрыть' : '... Показать все комментарии'}
                            </button>
                        )}
                    </>
                )}
            </section>

            <section
                className="app-surface"
                style={{
                    textAlign: 'left',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <button
                        onClick={handleLogout}
                        className="app-primary-button"
                        style={{ width: '220px' }}
                    >
                        Выйти из аккаунта
                    </button>

                    {isDeletingAccount ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700 }}>Удалить аккаунт?</span>

                            <button
                                onClick={handleDeleteAccount}
                                className="app-danger-button"
                            >
                                Да, удалить
                            </button>

                            <button
                                onClick={() => setIsDeletingAccount(false)}
                                className="app-secondary-button"
                            >
                                Отмена
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsDeletingAccount(true)}
                            className="app-danger-button"
                            style={{ width: '220px' }}
                        >
                            Удалить аккаунт
                        </button>
                    )}
                </div>
            </section>

            <RecipeFormModal
                isOpen={isRecipeModalOpen}
                mode={recipeModalMode}
                initialRecipe={editingRecipe}
                onClose={() => {
                    setIsRecipeModalOpen(false);
                    setEditingRecipe(null);
                }}
                onSuccess={loadProfile}
            />
        </div>
    );
}