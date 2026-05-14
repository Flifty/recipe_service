import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFavorites } from '../api/favorites';
import { getRecipeById } from '../api/recipes';
import { getCategories } from '../api/categories';
import { getCuisines } from '../api/cuisines';
import type { NamedEntity } from '../types/common';
import type {
    RecipeCardItem,
    RecipeDetails,
    RecipeSortField,
    SortDirection,
} from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';

const PAGE_SIZE = 5;

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

export function FavoritesPage() {
    const navigate = useNavigate();

    const [recipes, setRecipes] = useState<RecipeCardItem[]>([]);
    const [categories, setCategories] = useState<NamedEntity[]>([]);
    const [cuisines, setCuisines] = useState<NamedEntity[]>([]);

    const [nameInput, setNameInput] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [cuisineId, setCuisineId] = useState<number | ''>('');
    const [cookingTimeFrom, setCookingTimeFrom] = useState<number | ''>('');
    const [cookingTimeTo, setCookingTimeTo] = useState<number | ''>('');
    const [servingsFrom, setServingsFrom] = useState<number | ''>('');
    const [servingsTo, setServingsTo] = useState<number | ''>('');
    const [sortField, setSortField] = useState<RecipeSortField>('CREATED_AT');
    const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');
    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAuthenticated = Boolean(localStorage.getItem('token'));

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError('');

            const [categoriesData, cuisinesData, favoritesData] = await Promise.all([
                getCategories(),
                getCuisines(),
                getMyFavorites(),
            ]);

            setCategories(categoriesData.payload);
            setCuisines(cuisinesData.payload);

            if (!favoritesData.success || !favoritesData.payload) {
                setError(favoritesData.message || 'Не удалось загрузить избранное');
                return;
            }

            const loadedRecipes = await Promise.all(
                favoritesData.payload.map(async (favorite) => {
                    const recipeData = await getRecipeById(favorite.recipeId);
                    return convertRecipeDetailsToCard(recipeData.payload);
                })
            );

            setRecipes(loadedRecipes);
        } catch (e) {
            setError('Не удалось загрузить избранные блюда');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        loadFavorites();

        const handleAuthChanged = () => {
            if (localStorage.getItem('token')) {
                loadFavorites();
            } else {
                setRecipes([]);
            }
        };

        window.addEventListener('auth-state-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-state-changed', handleAuthChanged);
        };
    }, [isAuthenticated]);

    const filteredRecipes = useMemo(() => {
        let result = [...recipes];

        const search = nameInput.trim().toLowerCase();

        if (search) {
            result = result.filter((recipe) =>
                recipe.name.toLowerCase().includes(search)
            );
        }

        if (categoryId !== '') {
            const categoryName = categories.find((category) => category.id === categoryId)?.name;
            result = result.filter((recipe) => recipe.categoryName === categoryName);
        }

        if (cuisineId !== '') {
            const cuisineName = cuisines.find((cuisine) => cuisine.id === cuisineId)?.name;
            result = result.filter((recipe) => recipe.cuisineName === cuisineName);
        }

        if (cookingTimeFrom !== '') {
            result = result.filter((recipe) => recipe.cookingTimeMinutes >= Number(cookingTimeFrom));
        }

        if (cookingTimeTo !== '') {
            result = result.filter((recipe) => recipe.cookingTimeMinutes <= Number(cookingTimeTo));
        }

        if (servingsFrom !== '') {
            result = result.filter((recipe) => recipe.servings >= Number(servingsFrom));
        }

        if (servingsTo !== '') {
            result = result.filter((recipe) => recipe.servings <= Number(servingsTo));
        }

        result.sort((a, b) => {
            let firstValue: string | number = 0;
            let secondValue: string | number = 0;

            if (sortField === 'NAME') {
                firstValue = a.name.toLowerCase();
                secondValue = b.name.toLowerCase();
            }

            if (sortField === 'COOKING_TIME') {
                firstValue = a.cookingTimeMinutes;
                secondValue = b.cookingTimeMinutes;
            }

            if (sortField === 'AVERAGE_RATING') {
                firstValue = a.averageRating;
                secondValue = b.averageRating;
            }

            if (sortField === 'RATINGS_COUNT') {
                firstValue = a.ratingsCount;
                secondValue = b.ratingsCount;
            }

            if (sortField === 'REVIEWS_COUNT') {
                firstValue = a.reviewsCount;
                secondValue = b.reviewsCount;
            }

            if (sortField === 'CREATED_AT') {
                firstValue = a.id;
                secondValue = b.id;
            }

            if (typeof firstValue === 'string' && typeof secondValue === 'string') {
                return sortDirection === 'ASC'
                    ? firstValue.localeCompare(secondValue)
                    : secondValue.localeCompare(firstValue);
            }

            return sortDirection === 'ASC'
                ? Number(firstValue) - Number(secondValue)
                : Number(secondValue) - Number(firstValue);
        });

        return result;
    }, [
        recipes,
        categories,
        cuisines,
        nameInput,
        categoryId,
        cuisineId,
        cookingTimeFrom,
        cookingTimeTo,
        servingsFrom,
        servingsTo,
        sortField,
        sortDirection,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / PAGE_SIZE));
    const currentRecipes = filteredRecipes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    useEffect(() => {
        setPage(0);
    }, [
        nameInput,
        categoryId,
        cuisineId,
        cookingTimeFrom,
        cookingTimeTo,
        servingsFrom,
        servingsTo,
        sortField,
        sortDirection,
    ]);

    useEffect(() => {
        if (page > totalPages - 1) {
            setPage(0);
        }
    }, [page, totalPages]);

    const goToPage = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const buildPageItems = (currentPage: number, total: number): (number | 'dots')[] => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, index) => index + 1);
        }

        const items: (number | 'dots')[] = [];
        const current = currentPage + 1;

        items.push(1);

        const start = Math.max(2, current - 2);
        const end = Math.min(total - 1, current + 2);

        if (start > 2) {
            items.push('dots');
        }

        for (let i = start; i <= end; i++) {
            items.push(i);
        }

        if (end < total - 1) {
            items.push('dots');
        }

        items.push(total);

        return items;
    };

    const pageItems = buildPageItems(page, totalPages);

    const handleFavoriteChange = (recipeId: number, isFavorite: boolean) => {
        if (!isFavorite) {
            setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
        }
    };

    const resetFilters = () => {
        setNameInput('');
        setCategoryId('');
        setCuisineId('');
        setCookingTimeFrom('');
        setCookingTimeTo('');
        setServingsFrom('');
        setServingsTo('');
        setSortField('CREATED_AT');
        setSortDirection('DESC');
    };

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '32px 40px' }}>
                <h1 style={{ marginTop: 0, fontSize: '48px', textAlign: 'left' }}>Избранное</h1>

                <div className="app-surface" style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '18px', marginTop: 0 }}>
                        Чтобы посмотреть избранные блюда, нужно войти в аккаунт.
                    </p>
                </div>
            </div>
        );
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
                Избранное
            </h1>

            <div className="app-surface" style={{ marginBottom: '18px' }}>
                <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder='Поиск по избранному. Например, "борщ"'
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid #d9c2a7',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            <div
                className="app-surface"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1.15fr 1.15fr 1fr 86px 140px',
                    gap: '12px',
                    marginBottom: '24px',
                    alignItems: 'end',
                }}
            >
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Категория</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="">Все</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Кухня</label>
                    <select
                        value={cuisineId}
                        onChange={(e) => setCuisineId(e.target.value ? Number(e.target.value) : '')}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="">Все</option>
                        {cuisines.map((cuisine) => (
                            <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Время (мин)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                            type="number"
                            value={cookingTimeFrom}
                            onChange={(e) => setCookingTimeFrom(e.target.value ? Number(e.target.value) : '')}
                            placeholder="от 10"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                        <input
                            type="number"
                            value={cookingTimeTo}
                            onChange={(e) => setCookingTimeTo(e.target.value ? Number(e.target.value) : '')}
                            placeholder="до 180"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Порции</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                            type="number"
                            value={servingsFrom}
                            onChange={(e) => setServingsFrom(e.target.value ? Number(e.target.value) : '')}
                            placeholder="от 1"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                        <input
                            type="number"
                            value={servingsTo}
                            onChange={(e) => setServingsTo(e.target.value ? Number(e.target.value) : '')}
                            placeholder="до 12"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Сортировать</label>
                    <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value as RecipeSortField)}
                        style={{ width: '103%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="CREATED_AT">По дате создания</option>
                        <option value="NAME">По названию</option>
                        <option value="COOKING_TIME">По времени</option>
                        <option value="AVERAGE_RATING">По средней оценке</option>
                        <option value="RATINGS_COUNT">По количеству оценок</option>
                        <option value="REVIEWS_COUNT">По количеству отзывов</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Порядок</label>
                    <div style={{ height: '38px', display: 'flex', gap: '6px', alignItems: 'stretch' }}>
                        <button
                            type="button"
                            onClick={() => setSortDirection('DESC')}
                            className={`app-filter-arrow-button ${sortDirection === 'DESC' ? 'app-filter-arrow-button--active' : 'app-filter-arrow-button--inactive'}`}
                        >
                            ↓
                        </button>

                        <button
                            type="button"
                            onClick={() => setSortDirection('ASC')}
                            className={`app-filter-arrow-button ${sortDirection === 'ASC' ? 'app-filter-arrow-button--active' : 'app-filter-arrow-button--inactive'}`}
                        >
                            ↑
                        </button>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Сброс</label>
                    <button
                        onClick={resetFilters}
                        className="app-filter-button"
                        style={{ width: '140px' }}
                    >
                        Сбросить
                    </button>
                </div>
            </div>

            {loading ? (
                <div>Загрузка избранных блюд...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : recipes.length === 0 ? (
                <div className="app-surface">
                    <p style={{ marginTop: 0, fontSize: '18px' }}>У вас пока нет избранных блюд.</p>

                    <button
                        onClick={() => navigate('/')}
                        className="app-primary-button"
                    >
                        Перейти к рецептам
                    </button>
                </div>
            ) : filteredRecipes.length === 0 ? (
                <p>По выбранным фильтрам избранные блюда не найдены.</p>
            ) : (
                <>
                    {currentRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ))}

                    {filteredRecipes.length > PAGE_SIZE && (
                        <div className="app-pagination">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 0}
                                className="app-pagination-button"
                            >
                                ←
                            </button>

                            {pageItems.map((item, index) =>
                                item === 'dots' ? (
                                    <span
                                        key={`dots-${index}`}
                                        style={{
                                            minWidth: '28px',
                                            textAlign: 'center',
                                            fontSize: '20px',
                                            color: '#7a6653',
                                        }}
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => goToPage(item - 1)}
                                        className={`app-pagination-button ${page + 1 === item ? 'app-pagination-button--active' : ''}`}
                                    >
                                        {item}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                className="app-pagination-button"
                            >
                                →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}