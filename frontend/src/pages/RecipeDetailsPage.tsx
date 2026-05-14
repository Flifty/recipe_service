import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipeById } from '../api/recipes';
import { createReview, deleteReview, getReviewsByRecipeId, updateReview } from '../api/reviews';
import { createOrUpdateRating } from '../api/ratings';
import type { RecipeCardItem, RecipeDetails, ReviewItem } from '../types/recipe';
import { useToast } from '../components/ToastProvider';

const RECENTLY_VIEWED_RECIPES_KEY_PREFIX = 'recently-viewed-recipes';
const RECENTLY_VIEWED_LIMIT = 10;

interface CurrentUser {
    id?: number;
    username: string;
    email: string;
}

function getRecentlyViewedRecipesKey() {
    const rawUser = localStorage.getItem('currentUser');

    if (!rawUser) {
        return `${RECENTLY_VIEWED_RECIPES_KEY_PREFIX}-guest`;
    }

    try {
        const user = JSON.parse(rawUser) as CurrentUser;

        if (user.id) {
            return `${RECENTLY_VIEWED_RECIPES_KEY_PREFIX}-user-${user.id}`;
        }

        return `${RECENTLY_VIEWED_RECIPES_KEY_PREFIX}-user-${user.email}`;
    } catch {
        return `${RECENTLY_VIEWED_RECIPES_KEY_PREFIX}-guest`;
    }
}

function convertRecipeDetailsToCard(recipe: RecipeDetails): RecipeCardItem {
    return {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        cookingTimeMinutes: recipe.cookingTimeMinutes,
        servings: recipe.servings,
        imageUrl: recipe.imageUrl,
        categoryName: recipe.categoryName ?? 'Не указана',
        cuisineName: recipe.cuisineName ?? 'Не указана',
        deleted: false,
        createdAt: '',
        averageRating: recipe.averageRating,
        ratingsCount: recipe.ratingsCount,
        reviewsCount: recipe.reviewsCount,
        myRating: recipe.myRating,
        isFavorite: recipe.isFavorite,
    };
}

function saveRecentlyViewedRecipe(recipe: RecipeDetails) {
    const cardRecipe = convertRecipeDetailsToCard(recipe);

    const storageKey = getRecentlyViewedRecipesKey();
    const raw = localStorage.getItem(storageKey);

    let currentRecipes: RecipeCardItem[] = [];

    if (raw) {
        try {
            currentRecipes = JSON.parse(raw) as RecipeCardItem[];
        } catch {
            currentRecipes = [];
        }
    }

    const withoutCurrentRecipe = currentRecipes.filter((item) => item.id !== cardRecipe.id);

    const updatedRecipes = [
        cardRecipe,
        ...withoutCurrentRecipe,
    ].slice(0, RECENTLY_VIEWED_LIMIT);

    localStorage.setItem(storageKey, JSON.stringify(updatedRecipes));
}

interface CurrentUser {
    id?: number;
    username: string;
    email: string;
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

export function RecipeDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const currentUser = useMemo(() => getCurrentUser(), []);

    const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [newReviewText, setNewReviewText] = useState('');

    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editingReviewText, setEditingReviewText] = useState('');
    const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [ratingLoading, setRatingLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState('');

    const isAuthenticated = Boolean(localStorage.getItem('token'));

    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);

    const loadReviews = async (recipeId: number) => {
        try {
            setReviewsLoading(true);

            const reviewsData = await getReviewsByRecipeId(recipeId);

            if (reviewsData.success && reviewsData.payload) {
                setReviews(
                    [...reviewsData.payload].sort((a, b) =>
                        new Date(b.created).getTime() - new Date(a.created).getTime()
                    )
                );
            }
        } catch (e) {
            console.error('Не удалось загрузить комментарии');
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadRecipe = async () => {
        if (!id) {
            setError('Не найден id рецепта');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const data = await getRecipeById(id);

            if (!data.success || !data.payload) {
                setError(data.message || 'Рецепт не найден');
                return;
            }

            setRecipe(data.payload);
            saveRecentlyViewedRecipe(data.payload);
            await loadReviews(data.payload.id);
        } catch (e) {
            setError('Не удалось загрузить рецепт');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecipe();
    }, [id]);

    const handleRateRecipe = async (value: number) => {
        if (!recipe) {
            return;
        }

        if (!isAuthenticated) {
            showToast('Чтобы поставить оценку, нужно войти в аккаунт.', 'error');
            return;
        }

        try {
            setRatingLoading(true);

            const data = await createOrUpdateRating(recipe.id, value);

            if (!data.success || !data.payload) {
                showToast(data.message || 'Не удалось поставить оценку.', 'error');
                return;
            }

            const updatedRecipe = await getRecipeById(recipe.id);

            if (updatedRecipe.success && updatedRecipe.payload) {
                setRecipe(updatedRecipe.payload);
            }

            showToast('Оценка сохранена.', 'success');
        } catch (e) {
            showToast('Не удалось поставить оценку.', 'error');
        } finally {
            setRatingLoading(false);
        }
    };

    const handleCreateReview = async () => {
        if (!recipe) {
            return;
        }

        if (!isAuthenticated) {
            showToast('Чтобы оставить комментарий, нужно войти в аккаунт.', 'error');
            return;
        }

        if (!newReviewText.trim()) {
            showToast('Введите текст комментария.', 'error');
            return;
        }

        try {
            const data = await createReview(recipe.id, newReviewText.trim());

            if (!data.success || !data.payload) {
                showToast(data.message || 'Не удалось добавить комментарий.', 'error');
                return;
            }

            setReviews((prev) => [data.payload, ...prev]);
            setNewReviewText('');
            showToast('Комментарий добавлен.', 'success');
        } catch (e) {
            showToast('Не удалось добавить комментарий.', 'error');
        }
    };

    const startEditReview = (review: ReviewItem) => {
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
            const data = await updateReview(reviewId, editingReviewText.trim());

            if (!data.success || !data.payload) {
                showToast(data.message || 'Не удалось изменить комментарий.', 'error');
                return;
            }

            setReviews((prev) =>
                prev.map((review) =>
                    review.id === reviewId
                        ? {
                            ...review,
                            text: data.payload.text,
                        }
                        : review
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
            setReviews((prev) => prev.filter((review) => review.id !== reviewId));
            setDeletingReviewId(null);
            showToast('Комментарий удалён.', 'success');
        } catch (e) {
            showToast('Не удалось удалить комментарий.', 'error');
        }
    };

    if (loading) {
        return <div style={{ padding: '40px' }}>Загрузка рецепта...</div>;
    }

    if (error) {
        return <div style={{ padding: '40px', color: 'red' }}>{error}</div>;
    }

    if (!recipe) {
        return <div style={{ padding: '40px' }}>Рецепт не найден.</div>;
    }

    const displayedRating = hoverRating ?? recipe.myRating ?? 0;

    return (
        <div style={{ padding: '32px 40px' }}>
            <div className="app-surface">
                <h1
                    style={{
                        marginTop: 0,
                        marginBottom: '20px',
                        textAlign: 'left',
                        fontSize: '42px',
                        lineHeight: 1.2,
                    }}
                >
                    {recipe.name}
                </h1>

                <img
                    src={recipe.imageUrl || 'https://placehold.co/900x500?text=No+Image'}
                    alt={recipe.name}
                    style={{
                        width: '100%',
                        maxHeight: '420px',
                        objectFit: 'cover',
                        borderRadius: '18px',
                        marginBottom: '24px',
                    }}
                />

                <p
                    style={{
                        fontSize: '20px',
                        color: '#4f4034',
                        lineHeight: 1.5,
                        textAlign: 'left',
                        marginTop: 0,
                        marginBottom: '24px',
                    }}
                >
                    {recipe.description}
                </p>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))',
                        gap: '12px 32px',
                        marginTop: '8px',
                        marginBottom: '28px',
                        textAlign: 'left',
                    }}
                >
                    <p><strong>Категория:</strong> {recipe.categoryName}</p>
                    <p><strong>Кухня:</strong> {recipe.cuisineName}</p>
                    <p><strong>Автор:</strong> {recipe.authorUsername ?? 'Не указан'}</p>
                    <p><strong>Время приготовления:</strong> {recipe.cookingTimeMinutes} мин</p>
                    <p><strong>Порции:</strong> {recipe.servings}</p>
                    <p><strong>Средняя оценка:</strong> ⭐ {recipe.averageRating}</p>
                    <p><strong>Количество оценок:</strong> {recipe.ratingsCount}</p>
                    <p><strong>Количество отзывов:</strong> {reviews.length}</p>
                    <p><strong>Моя оценка:</strong> {recipe.myRating ?? 'Пока не поставлена'}</p>
                    <p><strong>В избранном:</strong> {recipe.isFavorite ? 'Да' : 'Нет'}</p>
                </div>

                <div
                    style={{
                        textAlign: 'left',
                        border: '1px solid #ead9c4',
                        backgroundColor: '#fffaf4',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '28px',
                    }}
                >
                    <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Оценить блюдо</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            onMouseLeave={() => setHoverRating(null)}
                            style={{ display: 'flex', gap: '4px' }}
                        >
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    disabled={ratingLoading}
                                    onClick={() => handleRateRecipe(value)}
                                    onMouseEnter={() => setHoverRating(value)}
                                    title={`Поставить ${value}`}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: ratingLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '34px',
                                        lineHeight: 1,
                                        color: value <= displayedRating ? '#f2a51a' : '#d8c8b4',
                                        padding: '0 2px',
                                    }}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <span style={{ color: '#6f5b49' }}>
                            {recipe.myRating
                                ? `Ваша оценка: ${recipe.myRating}`
                                : 'Вы ещё не оценивали это блюдо'}
                        </span>
                    </div>
                </div>

                <h2 style={{ textAlign: 'left', marginBottom: '16px' }}>Ингредиенты</h2>

                {recipe.ingredients.length === 0 ? (
                    <p style={{ textAlign: 'left' }}>Ингредиенты не указаны.</p>
                ) : (
                    <ul
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))',
                            gap: '10px 32px',
                            lineHeight: 1.8,
                            textAlign: 'left',
                            paddingLeft: '22px',
                            marginBottom: '28px',
                        }}
                    >
                        {recipe.ingredients.map((item) => (
                            <li key={`${item.ingredientId}-${item.amount}-${item.unit ?? ''}`}>
                                {item.ingredientName} — {item.amount}
                                {item.unit ? ` ${item.unit}` : ''}
                            </li>
                        ))}
                    </ul>
                )}

                <h2 style={{ marginTop: '8px', textAlign: 'left' }}>Способ приготовления</h2>

                <p
                    style={{
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line',
                        textAlign: 'left',
                        marginBottom: 0,
                    }}
                >
                    {recipe.instructions}
                </p>
            </div>

            <section
                className="app-surface"
                style={{
                    marginTop: '24px',
                    textAlign: 'left',
                }}
            >
                <h2 style={{ marginTop: 0, marginBottom: '18px' }}>Комментарии</h2>

                {isAuthenticated && (
                    <div
                        style={{
                            marginBottom: '22px',
                            border: '1px solid #ead9c4',
                            backgroundColor: '#fffaf4',
                            borderRadius: '14px',
                            padding: '14px',
                        }}
                    >
                        <textarea
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            placeholder="Напишите комментарий..."
                            rows={3}
                            style={{
                                width: '100%',
                                resize: 'vertical',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #d9c2a7',
                                boxSizing: 'border-box',
                                marginBottom: '10px',
                            }}
                        />

                        <button
                            onClick={handleCreateReview}
                            className="app-primary-button"
                        >
                            Добавить комментарий
                        </button>
                    </div>
                )}

                {reviewsLoading ? (
                    <p>Загрузка комментариев...</p>
                ) : reviews.length === 0 ? (
                    <p>Комментариев пока нет.</p>
                ) : (
                    <>
                        {visibleReviews.map((review) => {
                            const isMyReview = currentUser?.id === review.userId;
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
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <strong>{review.username}</strong>
                                        <span style={{ color: '#8a725d', fontSize: '14px' }}>
                                            {new Date(review.created).toLocaleString('ru-RU')}
                                        </span>
                                    </div>

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
                                        <p style={{ lineHeight: 1.5, marginTop: 0 }}>{review.text}</p>
                                    )}

                                    {isMyReview && !isEditing && (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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

                        {reviews.length > 2 && (
                            <button
                                onClick={() => setShowAllReviews((prev) => !prev)}
                                className="app-secondary-button"
                            >
                                {showAllReviews ? 'Скрыть комментарии' : '... Показать все комментарии'}
                            </button>
                        )}
                    </>
                )}
            </section>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="app-secondary-button"
                >
                    Назад
                </button>
            </div>
        </div>
    );
}