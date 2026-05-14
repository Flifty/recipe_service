import { useEffect, useMemo, useState } from 'react';
import type { RecipeCardItem } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';

const RECENTLY_VIEWED_RECIPES_KEY_PREFIX = 'recently-viewed-recipes';
const PAGE_SIZE = 5;

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

function loadRecentlyViewedRecipes(): RecipeCardItem[] {
    const storageKey = getRecentlyViewedRecipesKey();
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
        return [];
    }

    try {
        return JSON.parse(raw) as RecipeCardItem[];
    } catch {
        return [];
    }
}

function saveRecentlyViewedRecipes(recipes: RecipeCardItem[]) {
    const storageKey = getRecentlyViewedRecipesKey();
    localStorage.setItem(storageKey, JSON.stringify(recipes));
}

export function RecentlyViewedPage() {
    const [recipes, setRecipes] = useState<RecipeCardItem[]>(loadRecentlyViewedRecipes());
    const [page, setPage] = useState(0);

    const totalPages = Math.max(1, Math.ceil(recipes.length / PAGE_SIZE));
    const currentRecipes = recipes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const pageItems = useMemo(() => {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }, [totalPages]);

    useEffect(() => {
        const handleAuthChanged = () => {
            setRecipes(loadRecentlyViewedRecipes());
            setPage(0);
        };

        window.addEventListener('auth-state-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-state-changed', handleAuthChanged);
        };
    }, []);

    useEffect(() => {
        setRecipes(loadRecentlyViewedRecipes());
        setPage(0);
    }, []);

    useEffect(() => {
        if (page > totalPages - 1) {
            setPage(0);
        }
    }, [page, totalPages]);

    const goToPage = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFavoriteChange = (recipeId: number, isFavorite: boolean) => {
        setRecipes((prev) => {
            const updatedRecipes = prev.map((recipe) =>
                recipe.id === recipeId
                    ? {
                        ...recipe,
                        isFavorite,
                    }
                    : recipe
            );

            saveRecentlyViewedRecipes(updatedRecipes);

            return updatedRecipes;
        });
    };

    const clearHistory = () => {
        const storageKey = getRecentlyViewedRecipesKey();

        localStorage.removeItem(storageKey);
        setRecipes([]);
        setPage(0);
    };

    return (
        <div style={{ padding: '32px 40px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px',
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: '48px',
                        textAlign: 'left',
                    }}
                >
                    Недавно просмотренные
                </h1>

                {recipes.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="app-secondary-danger-button"
                    >
                        Очистить историю
                    </button>
                )}
            </div>

            {recipes.length === 0 ? (
                <div
                    className="app-surface"
                    style={{
                        textAlign: 'left',
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>История просмотров пустая</h2>

                    <p
                        style={{
                            marginBottom: 0,
                            fontSize: '18px',
                            color: '#5d4b3b',
                        }}
                    >
                        Откройте любое блюдо, и оно появится в этом разделе.
                    </p>
                </div>
            ) : (
                <>
                    <div
                        style={{
                            marginBottom: '16px',
                            color: '#5d4b3b',
                            textAlign: 'left',
                            fontSize: '16px',
                        }}
                    >
                        Показаны последние просмотренные блюда текущего пользователя.
                    </div>

                    {currentRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ))}

                    {recipes.length > PAGE_SIZE && (
                        <div className="app-pagination">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 0}
                                className="app-pagination-button"
                            >
                                ←
                            </button>

                            {pageItems.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => goToPage(item - 1)}
                                    className={`app-pagination-button ${page + 1 === item ? 'app-pagination-button--active' : ''}`}
                                >
                                    {item}
                                </button>
                            ))}

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