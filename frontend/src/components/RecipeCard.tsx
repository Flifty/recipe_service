import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecipeCardItem } from '../types/recipe';
import { addToFavorites, removeFromFavorites } from '../api/favorites';
import { useToast } from './ToastProvider';
import './RecipeCard.css';

interface RecipeCardProps {
    recipe: RecipeCardItem;
    onFavoriteChange?: (recipeId: number, isFavorite: boolean) => void;
    actionContent?: ReactNode;
}

export function RecipeCard({ recipe, onFavoriteChange, actionContent }: RecipeCardProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isFavorite, setIsFavorite] = useState(recipe.isFavorite);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    useEffect(() => {
        setIsFavorite(recipe.isFavorite);
    }, [recipe.isFavorite]);

    useEffect(() => {
        const handleAuthChanged = () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsFavorite(false);
            }
        };

        window.addEventListener('auth-state-changed', handleAuthChanged);

        return () => {
            window.removeEventListener('auth-state-changed', handleAuthChanged);
        };
    }, []);

    const imageUrl =
        recipe.imageUrl && recipe.imageUrl.trim() !== ''
            ? recipe.imageUrl
            : 'https://placehold.co/320x220?text=No+Image';

    const ratingWidth = `${(Math.max(0, Math.min(recipe.averageRating, 5)) / 5) * 100}%`;

    const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        const token = localStorage.getItem('token');

        if (!token) {
            showToast('Чтобы добавлять блюда в избранное, нужно войти в аккаунт.', 'error');
            return;
        }

        if (favoriteLoading) {
            return;
        }

        try {
            setFavoriteLoading(true);

            if (isFavorite) {
                await removeFromFavorites(recipe.id);
                setIsFavorite(false);
                onFavoriteChange?.(recipe.id, false);
                showToast('Блюдо удалено из избранного.', 'success');
            } else {
                await addToFavorites(recipe.id);
                setIsFavorite(true);
                onFavoriteChange?.(recipe.id, true);
                showToast('Блюдо добавлено в избранное.', 'success');
            }
        } catch (e) {
            showToast('Не удалось изменить избранное.', 'error');
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <div
            className="recipe-card"
            onClick={() => navigate(`/recipes/${recipe.id}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className="recipe-card__image-wrapper">
                <img
                    src={imageUrl}
                    alt={recipe.name}
                    className="recipe-card__image"
                />
            </div>

            <div className="recipe-card__content">
                <button
                    className="recipe-card__favorite-button"
                    type="button"
                    title="Добавить или удалить из избранного"
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                >
                    {isFavorite ? '★' : '☆'}
                </button>

                <h2 className="recipe-card__title">{recipe.name}</h2>

                <div className="recipe-card__rating-row">
                    <div className="recipe-card__stars">
                        <div className="recipe-card__stars-base">★★★★★</div>
                        <div
                            className="recipe-card__stars-fill"
                            style={{ width: ratingWidth }}
                        >
                            ★★★★★
                        </div>
                    </div>

                    <span className="recipe-card__rating-value">
                        {recipe.averageRating.toFixed(2)}
                    </span>

                    <span className="recipe-card__rating-count">
                        ({recipe.ratingsCount})
                    </span>
                </div>

                <p className="recipe-card__description">{recipe.description}</p>

                <div className="recipe-card__meta">
                    <div className="recipe-card__meta-item">
                        <span className="recipe-card__meta-label">Категория:</span>
                        <span className="recipe-card__meta-value">{recipe.categoryName}</span>
                    </div>

                    <div className="recipe-card__meta-item">
                        <span className="recipe-card__meta-label">Кухня:</span>
                        <span className="recipe-card__meta-value">{recipe.cuisineName}</span>
                    </div>

                    <div className="recipe-card__meta-item">
                        <span className="recipe-card__meta-label">Время:</span>
                        <span className="recipe-card__meta-value">{recipe.cookingTimeMinutes} мин</span>
                    </div>

                    <div className="recipe-card__meta-item">
                        <span className="recipe-card__meta-label">Порции:</span>
                        <span className="recipe-card__meta-value">{recipe.servings}</span>
                    </div>

                    <div className="recipe-card__meta-item">
                        <span className="recipe-card__meta-label">Отзывы:</span>
                        <span className="recipe-card__meta-value">{recipe.reviewsCount}</span>
                    </div>
                </div>

                {actionContent && (
                    <div
                        className="recipe-card__actions"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {actionContent}
                    </div>
                )}
            </div>
        </div>
    );
}