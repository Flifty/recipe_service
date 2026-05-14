import { useEffect, useMemo, useRef, useState } from 'react';
import { getCategories } from '../api/categories';
import { getCuisines } from '../api/cuisines';
import { searchRecipes } from '../api/recipes';
import type { NamedEntity } from '../types/common';
import type {
    RecipeCardItem,
    RecipeSortField,
    SortDirection,
} from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';

const PAGE_SIZE = 5;
const RECIPES_STATE_KEY = 'recipes-page-state';

interface RecipesPageState {
    page: number;
    sortField: RecipeSortField;
    sortDirection: SortDirection;
    nameInput: string;
    name: string;
    categoryId: number | '';
    cuisineId: number | '';
    cookingTimeFrom: number | '';
    cookingTimeTo: number | '';
    servingsFrom: number | '';
    servingsTo: number | '';
}

function getInitialState(): RecipesPageState {
    const raw = sessionStorage.getItem(RECIPES_STATE_KEY);

    if (!raw) {
        return {
            page: 0,
            sortField: 'CREATED_AT',
            sortDirection: 'DESC',
            nameInput: '',
            name: '',
            categoryId: '',
            cuisineId: '',
            cookingTimeFrom: '',
            cookingTimeTo: '',
            servingsFrom: '',
            servingsTo: '',
        };
    }

    try {
        return JSON.parse(raw) as RecipesPageState;
    } catch {
        return {
            page: 0,
            sortField: 'CREATED_AT',
            sortDirection: 'DESC',
            nameInput: '',
            name: '',
            categoryId: '',
            cuisineId: '',
            cookingTimeFrom: '',
            cookingTimeTo: '',
            servingsFrom: '',
            servingsTo: '',
        };
    }
}

export function RecipesPage() {
    const initialState = getInitialState();
    const isFirstNameEffect = useRef(true);

    const [allRecipes, setAllRecipes] = useState<RecipeCardItem[]>([]);
    const [categories, setCategories] = useState<NamedEntity[]>([]);
    const [cuisines, setCuisines] = useState<NamedEntity[]>([]);
    const [page, setPage] = useState(initialState.page);

    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authVersion, setAuthVersion] = useState(0);

    const [sortField, setSortField] = useState<RecipeSortField>(initialState.sortField);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialState.sortDirection);

    const [nameInput, setNameInput] = useState(initialState.nameInput);
    const [name, setName] = useState(initialState.name);

    const [categoryId, setCategoryId] = useState<number | ''>(initialState.categoryId);
    const [cuisineId, setCuisineId] = useState<number | ''>(initialState.cuisineId);

    const [cookingTimeFrom, setCookingTimeFrom] = useState<number | ''>(initialState.cookingTimeFrom);
    const [cookingTimeTo, setCookingTimeTo] = useState<number | ''>(initialState.cookingTimeTo);

    const [servingsFrom, setServingsFrom] = useState<number | ''>(initialState.servingsFrom);
    const [servingsTo, setServingsTo] = useState<number | ''>(initialState.servingsTo);

    useEffect(() => {
        const handleAuthChanged = () => {
            setAuthVersion((prev) => prev + 1);
        };

        window.addEventListener('auth-state-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-state-changed', handleAuthChanged);
        };
    }, []);

    useEffect(() => {
        const loadDictionaries = async () => {
            try {
                const [categoriesData, cuisinesData] = await Promise.all([
                    getCategories(),
                    getCuisines(),
                ]);

                setCategories(categoriesData.payload);
                setCuisines(cuisinesData.payload);
            } catch (e) {
                console.error('Не удалось загрузить справочники');
            }
        };

        loadDictionaries();
    }, []);

    useEffect(() => {
        if (isFirstNameEffect.current) {
            isFirstNameEffect.current = false;
            return;
        }

        const timer = window.setTimeout(() => {
            const trimmed = nameInput.trim();
            if (trimmed !== name) {
                setName(trimmed);
                setPage(0);
            }
        }, 500);

        return () => window.clearTimeout(timer);
    }, [nameInput, name]);

    useEffect(() => {
        sessionStorage.setItem(
            RECIPES_STATE_KEY,
            JSON.stringify({
                page,
                sortField,
                sortDirection,
                nameInput,
                name,
                categoryId,
                cuisineId,
                cookingTimeFrom,
                cookingTimeTo,
                servingsFrom,
                servingsTo,
            } satisfies RecipesPageState)
        );
    }, [
        page,
        sortField,
        sortDirection,
        nameInput,
        name,
        categoryId,
        cuisineId,
        cookingTimeFrom,
        cookingTimeTo,
        servingsFrom,
        servingsTo,
    ]);

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await searchRecipes({
                    page: 0,
                    limit: 1000,
                    sortField,
                    sortDirection,
                    name,
                    categoryId,
                    cuisineId,
                });

                let content = data.payload.content;

                if (cookingTimeFrom !== '') {
                    content = content.filter((recipe) => recipe.cookingTimeMinutes >= Number(cookingTimeFrom));
                }
                if (cookingTimeTo !== '') {
                    content = content.filter((recipe) => recipe.cookingTimeMinutes <= Number(cookingTimeTo));
                }

                if (servingsFrom !== '') {
                    content = content.filter((recipe) => recipe.servings >= Number(servingsFrom));
                }
                if (servingsTo !== '') {
                    content = content.filter((recipe) => recipe.servings <= Number(servingsTo));
                }

                setAllRecipes(content);
            } catch (e) {
                setError('Не удалось загрузить рецепты');
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        };

        loadRecipes();
    }, [
        sortField,
        sortDirection,
        name,
        categoryId,
        cuisineId,
        cookingTimeFrom,
        cookingTimeTo,
        servingsFrom,
        servingsTo,
        authVersion,
    ]);

    const totalPages = Math.max(1, Math.ceil(allRecipes.length / PAGE_SIZE));
    const currentRecipes = allRecipes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    useEffect(() => {
        if (initialLoading) {
            return;
        }

        if (page > totalPages - 1) {
            setPage(0);
        }
    }, [page, totalPages, initialLoading]);

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

    const resetToFirstPage = () => setPage(0);

    const pageItems = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

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
                Список рецептов
            </h1>

            <div
                style={{
                    marginBottom: '18px',
                    padding: '18px',
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                }}
            >
                <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder='Поиск по рецептам. Например, "борщ"'
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '2px solid #d9c2a7',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            <div
                className="app-surface"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1.15fr 1.15fr 1fr 76px 120px',
                    gap: '12px',
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    alignItems: 'end',
                }}
            >
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Категория</label>
                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value ? Number(e.target.value) : '');
                            resetToFirstPage();
                        }}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="">Все</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Кухня</label>
                    <select
                        value={cuisineId}
                        onChange={(e) => {
                            setCuisineId(e.target.value ? Number(e.target.value) : '');
                            resetToFirstPage();
                        }}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="">Все</option>
                        {cuisines.map((cuisine) => (
                            <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Время (мин)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                            type="number"
                            value={cookingTimeFrom}
                            onChange={(e) => {
                                setCookingTimeFrom(e.target.value ? Number(e.target.value) : '');
                                resetToFirstPage();
                            }}
                            placeholder="от 10"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                        <input
                            type="number"
                            value={cookingTimeTo}
                            onChange={(e) => {
                                setCookingTimeTo(e.target.value ? Number(e.target.value) : '');
                                resetToFirstPage();
                            }}
                            placeholder="до 180"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Порции</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                            type="number"
                            value={servingsFrom}
                            onChange={(e) => {
                                setServingsFrom(e.target.value ? Number(e.target.value) : '');
                                resetToFirstPage();
                            }}
                            placeholder="от 1"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                        <input
                            type="number"
                            value={servingsTo}
                            onChange={(e) => {
                                setServingsTo(e.target.value ? Number(e.target.value) : '');
                                resetToFirstPage();
                            }}
                            placeholder="до 12"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Сортировать</label>
                    <select
                        value={sortField}
                        onChange={(e) => {
                            setSortField(e.target.value as RecipeSortField);
                            resetToFirstPage();
                        }}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', boxSizing: 'border-box' }}
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
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Порядок</label>
                    <div style={{ height: '38px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                            type="button"
                            className={`app-filter-arrow-button ${sortDirection === 'DESC' ? 'app-filter-arrow-button--active' : 'app-filter-arrow-button--inactive'}`}
                            onClick={() => {
                                setSortDirection('DESC');
                                resetToFirstPage();
                            }}
                            style={{
                                width: '30px',
                                height: '38px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                fontSize: '24px',
                                color: sortDirection === 'DESC' ? '#111' : '#b5b5b5',
                                fontWeight: 900,
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ↓
                        </button>

                        <button
                            type="button"
                            className={`app-filter-arrow-button ${sortDirection === 'ASC' ? 'app-filter-arrow-button--active' : 'app-filter-arrow-button--inactive'}`}
                            onClick={() => {
                                setSortDirection('ASC');
                                resetToFirstPage();
                            }}
                            style={{
                                width: '30px',
                                height: '38px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                fontSize: '24px',
                                color: sortDirection === 'ASC' ? '#111' : '#b5b5b5',
                                fontWeight: 900,
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ↑
                        </button>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Сброс</label>
                    <button
                        className="app-filter-button"
                        onClick={() => {
                            setNameInput('');
                            setName('');
                            setCategoryId('');
                            setCuisineId('');
                            setCookingTimeFrom('');
                            setCookingTimeTo('');
                            setServingsFrom('');
                            setServingsTo('');
                            setSortField('CREATED_AT');
                            setSortDirection('DESC');
                            setPage(0);
                        }}
                        style={{
                            width: '120px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        Сбросить
                    </button>
                </div>
            </div>

            {initialLoading ? (
                <div style={{ padding: '20px 0' }}>Загрузка рецептов...</div>
            ) : error ? (
                <div style={{ padding: '20px 0', color: 'red' }}>{error}</div>
            ) : currentRecipes.length === 0 ? (
                <p>Рецепты не найдены.</p>
            ) : (
                <>
                    {loading && (
                        <div style={{ marginBottom: '14px', color: '#666', fontSize: '14px' }}>
                            Обновляем список...
                        </div>
                    )}

                    {currentRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '32px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page === 0}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                backgroundColor: page === 0 ? '#eee' : '#fff',
                                cursor: page === 0 ? 'not-allowed' : 'pointer',
                            }}
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
                                            color: '#777',
                                        }}
                                    >
                  ...
                </span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => goToPage(item - 1)}
                                        style={{
                                            minWidth: '38px',
                                            height: '38px',
                                            borderRadius: '8px',
                                            border: page + 1 === item ? '1px solid #111' : '1px solid #ccc',
                                            backgroundColor: page + 1 === item ? '#111' : '#fff',
                                            color: page + 1 === item ? '#fff' : '#111',
                                            fontWeight: page + 1 === item ? 700 : 500,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {item}
                                    </button>
                                )
                        )}

                        <button
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages - 1}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                backgroundColor: page >= totalPages - 1 ? '#eee' : '#fff',
                                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}