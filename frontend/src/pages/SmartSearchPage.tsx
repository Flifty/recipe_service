import { useEffect, useMemo, useState } from 'react';
import { getCategories } from '../api/categories';
import { getCuisines } from '../api/cuisines';
import { getIngredients } from '../api/ingredients';
import { getRecipeById, searchRecipes } from '../api/recipes';
import type { NamedEntity } from '../types/common';
import type { RecipeCardItem, RecipeDetails } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';

const PAGE_SIZE = 5;
const SMART_SEARCH_STATE_KEY = 'smart-search-page-state';

interface SmartSearchPageState {
    nameInput: string;
    categoryId: number | '';
    cuisineId: number | '';
    cookingTimeFrom: number | '';
    cookingTimeTo: number | '';
    servingsFrom: number | '';
    servingsTo: number | '';
    selectedIngredientId: number | '';
    selectedIngredients: NamedEntity[];
}

interface SmartRecipeResult {
    recipe: RecipeCardItem;
    details: RecipeDetails;
    matchedIngredientsCount: number;
    missingIngredientsCount: number;
    missingIngredientNames: string[];
}

const defaultSmartSearchState: SmartSearchPageState = {
    nameInput: '',
    categoryId: '',
    cuisineId: '',
    cookingTimeFrom: '',
    cookingTimeTo: '',
    servingsFrom: '',
    servingsTo: '',
    selectedIngredientId: '',
    selectedIngredients: [],
};

function getInitialSmartSearchState(): SmartSearchPageState {
    const raw = sessionStorage.getItem(SMART_SEARCH_STATE_KEY);

    if (!raw) {
        return defaultSmartSearchState;
    }

    try {
        return {
            ...defaultSmartSearchState,
            ...JSON.parse(raw),
        } as SmartSearchPageState;
    } catch {
        return defaultSmartSearchState;
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

export function SmartSearchPage() {
    const initialState = useMemo(() => getInitialSmartSearchState(), []);

    const [categories, setCategories] = useState<NamedEntity[]>([]);
    const [cuisines, setCuisines] = useState<NamedEntity[]>([]);
    const [ingredients, setIngredients] = useState<NamedEntity[]>([]);

    const [allRecipeDetails, setAllRecipeDetails] = useState<RecipeDetails[]>([]);

    const [selectedIngredientId, setSelectedIngredientId] = useState<number | ''>(
        initialState.selectedIngredientId
    );
    const [selectedIngredients, setSelectedIngredients] = useState<NamedEntity[]>(
        initialState.selectedIngredients
    );

    const [nameInput, setNameInput] = useState(initialState.nameInput);
    const [categoryId, setCategoryId] = useState<number | ''>(initialState.categoryId);
    const [cuisineId, setCuisineId] = useState<number | ''>(initialState.cuisineId);
    const [cookingTimeFrom, setCookingTimeFrom] = useState<number | ''>(initialState.cookingTimeFrom);
    const [cookingTimeTo, setCookingTimeTo] = useState<number | ''>(initialState.cookingTimeTo);
    const [servingsFrom, setServingsFrom] = useState<number | ''>(initialState.servingsFrom);
    const [servingsTo, setServingsTo] = useState<number | ''>(initialState.servingsTo);

    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        sessionStorage.setItem(
            SMART_SEARCH_STATE_KEY,
            JSON.stringify({
                nameInput,
                categoryId,
                cuisineId,
                cookingTimeFrom,
                cookingTimeTo,
                servingsFrom,
                servingsTo,
                selectedIngredientId,
                selectedIngredients,
            } satisfies SmartSearchPageState)
        );
    }, [
        nameInput,
        categoryId,
        cuisineId,
        cookingTimeFrom,
        cookingTimeTo,
        servingsFrom,
        servingsTo,
        selectedIngredientId,
        selectedIngredients,
    ]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const [categoriesData, cuisinesData, ingredientsData, recipesData] = await Promise.all([
                getCategories(),
                getCuisines(),
                getIngredients(),
                searchRecipes({
                    page: 0,
                    limit: 1000,
                    sortField: 'CREATED_AT',
                    sortDirection: 'DESC',
                }),
            ]);

            setCategories(categoriesData.payload);
            setCuisines(cuisinesData.payload);
            setIngredients(ingredientsData.payload);

            const recipes = recipesData.payload?.content ?? [];

            const details = await Promise.all(
                recipes.map(async (recipe) => {
                    const detailsData = await getRecipeById(recipe.id);
                    return detailsData.payload;
                })
            );

            setAllRecipeDetails(details);
        } catch (e) {
            setError('Не удалось загрузить данные для умного поиска');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        const handleAuthChanged = () => {
            loadData();
        };

        window.addEventListener('auth-state-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-state-changed', handleAuthChanged);
        };
    }, []);

    const addIngredient = () => {
        if (selectedIngredientId === '') {
            return;
        }

        const ingredient = ingredients.find((item) => item.id === selectedIngredientId);

        if (!ingredient) {
            return;
        }

        const alreadyAdded = selectedIngredients.some((item) => item.id === ingredient.id);

        if (alreadyAdded) {
            setSelectedIngredientId('');
            return;
        }

        setSelectedIngredients((prev) => [...prev, ingredient]);
        setSelectedIngredientId('');
    };

    const removeIngredient = (ingredientId: number) => {
        setSelectedIngredients((prev) => prev.filter((item) => item.id !== ingredientId));
    };

    const resetFilters = () => {
        setNameInput('');
        setCategoryId('');
        setCuisineId('');
        setCookingTimeFrom('');
        setCookingTimeTo('');
        setServingsFrom('');
        setServingsTo('');
    };

    const resetAll = () => {
        resetFilters();
        setSelectedIngredientId('');
        setSelectedIngredients([]);
        sessionStorage.removeItem(SMART_SEARCH_STATE_KEY);
    };

    const smartResults = useMemo<SmartRecipeResult[]>(() => {
        const selectedIds = selectedIngredients.map((item) => item.id);

        let result = allRecipeDetails.map((recipe) => {
            const recipeIngredients = recipe.ingredients;

            const matchedIngredientsCount = recipeIngredients.filter((ingredient) =>
                selectedIds.includes(ingredient.ingredientId)
            ).length;

            const missingIngredientNames = recipeIngredients
                .filter((ingredient) => !selectedIds.includes(ingredient.ingredientId))
                .map((ingredient) => ingredient.ingredientName);

            return {
                recipe: convertRecipeDetailsToCard(recipe),
                details: recipe,
                matchedIngredientsCount,
                missingIngredientsCount: missingIngredientNames.length,
                missingIngredientNames,
            };
        });

        const search = nameInput.trim().toLowerCase();

        if (search) {
            result = result.filter((item) =>
                item.recipe.name.toLowerCase().includes(search)
            );
        }

        if (categoryId !== '') {
            result = result.filter((item) => item.details.categoryId === categoryId);
        }

        if (cuisineId !== '') {
            result = result.filter((item) => item.details.cuisineId === cuisineId);
        }

        if (cookingTimeFrom !== '') {
            result = result.filter((item) => item.recipe.cookingTimeMinutes >= Number(cookingTimeFrom));
        }

        if (cookingTimeTo !== '') {
            result = result.filter((item) => item.recipe.cookingTimeMinutes <= Number(cookingTimeTo));
        }

        if (servingsFrom !== '') {
            result = result.filter((item) => item.recipe.servings >= Number(servingsFrom));
        }

        if (servingsTo !== '') {
            result = result.filter((item) => item.recipe.servings <= Number(servingsTo));
        }

        if (selectedIds.length > 0) {
            result = result.filter((item) => item.details.ingredients.length > 0);
        }

        result.sort((a, b) => {
            const aHasMatches = a.matchedIngredientsCount > 0;
            const bHasMatches = b.matchedIngredientsCount > 0;

            if (aHasMatches !== bHasMatches) {
                return aHasMatches ? -1 : 1;
            }

            if (a.missingIngredientsCount !== b.missingIngredientsCount) {
                return a.missingIngredientsCount - b.missingIngredientsCount;
            }

            if (a.matchedIngredientsCount !== b.matchedIngredientsCount) {
                return b.matchedIngredientsCount - a.matchedIngredientsCount;
            }

            return b.recipe.averageRating - a.recipe.averageRating;
        });

        return result;
    }, [
        allRecipeDetails,
        selectedIngredients,
        nameInput,
        categoryId,
        cuisineId,
        cookingTimeFrom,
        cookingTimeTo,
        servingsFrom,
        servingsTo,
    ]);

    const totalPages = Math.max(1, Math.ceil(smartResults.length / PAGE_SIZE));
    const currentResults = smartResults.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    useEffect(() => {
        setPage(0);
    }, [
        selectedIngredients,
        nameInput,
        categoryId,
        cuisineId,
        cookingTimeFrom,
        cookingTimeTo,
        servingsFrom,
        servingsTo,
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
                Умный поиск
            </h1>

            <div className="app-surface" style={{ marginBottom: '18px', textAlign: 'left' }}>
                <h2 style={{ marginTop: 0, marginBottom: '14px' }}>
                    Какие ингредиенты у вас есть?
                </h2>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 160px',
                        gap: '12px',
                        marginBottom: '14px',
                    }}
                >
                    <select
                        value={selectedIngredientId}
                        onChange={(e) => setSelectedIngredientId(e.target.value ? Number(e.target.value) : '')}
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: '1px solid #d9c2a7',
                            boxSizing: 'border-box',
                        }}
                    >
                        <option value="">Выберите ингредиент</option>
                        {ingredients.map((ingredient) => (
                            <option key={ingredient.id} value={ingredient.id}>
                                {ingredient.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={addIngredient}
                        className="app-primary-button"
                    >
                        Добавить
                    </button>
                </div>

                {selectedIngredients.length === 0 ? (
                    <p style={{ margin: 0, color: '#7c6652' }}>
                        Добавьте ингредиенты, и приложение покажет, какие блюда можно приготовить и чего не хватает для остальных.
                    </p>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                        }}
                    >
                        {selectedIngredients.map((ingredient) => (
                            <button
                                key={ingredient.id}
                                type="button"
                                onClick={() => removeIngredient(ingredient.id)}
                                title="Убрать ингредиент"
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid #d9c2a7',
                                    backgroundColor: '#fff7ec',
                                    cursor: 'pointer',
                                    color: '#4a3322',
                                    fontWeight: 600,
                                }}
                            >
                                {ingredient.name} ×
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="app-surface" style={{ marginBottom: '18px' }}>
                <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder='Поиск по названию. Например, "суп"'
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
                    gridTemplateColumns: '1fr 1fr 1.15fr 1.15fr 140px 140px',
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
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
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
                            <option key={cuisine.id} value={cuisine.id}>
                                {cuisine.name}
                            </option>
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
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Фильтры</label>
                    <button
                        onClick={resetFilters}
                        className="app-filter-button"
                        style={{ width: '140px' }}
                    >
                        Сбросить
                    </button>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Всё</label>
                    <button
                        onClick={resetAll}
                        className="app-filter-button"
                        style={{ width: '140px' }}
                    >
                        Очистить
                    </button>
                </div>
            </div>

            {loading ? (
                <div>Загрузка умного поиска...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : selectedIngredients.length === 0 ? (
                <div className="app-surface" style={{ textAlign: 'left' }}>
                    Выберите хотя бы один ингредиент, чтобы получить подборку блюд.
                </div>
            ) : smartResults.length === 0 ? (
                <p>Подходящие блюда не найдены.</p>
            ) : (
                <>
                    <div
                        style={{
                            marginBottom: '16px',
                            color: '#5d4b3b',
                            textAlign: 'left',
                        }}
                    >
                        Найдено блюд: {smartResults.length}. Сначала показаны рецепты, для которых не хватает меньше всего ингредиентов.
                    </div>

                    {currentResults.map((item) => (
                        <div key={item.recipe.id}>
                            <div
                                style={{
                                    marginBottom: '8px',
                                    padding: '12px 14px',
                                    backgroundColor: '#fffaf4',
                                    borderRadius: '12px',
                                    border: '1px solid #ead9c4',
                                    textAlign: 'left',
                                    fontSize: '15px',
                                }}
                            >
                                {item.missingIngredientsCount === 0 ? (
                                    <strong>Подходит полностью: есть все ингредиенты для блюда.</strong>
                                ) : (
                                    <>
                                        <strong>Не хватает ингредиентов: {item.missingIngredientsCount}</strong>
                                        <span> — {item.missingIngredientNames.join(', ')}</span>
                                    </>
                                )}
                            </div>

                            <RecipeCard recipe={item.recipe} />
                        </div>
                    ))}

                    {smartResults.length > PAGE_SIZE && (
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