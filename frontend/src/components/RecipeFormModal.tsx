import { useEffect, useState } from 'react';
import { getCategories } from '../api/categories';
import { getCuisines } from '../api/cuisines';
import { getIngredients } from '../api/ingredients';
import { createRecipe, updateRecipe } from '../api/recipes';
import type { NamedEntity } from '../types/common';
import type {
    CreateUpdateRecipePayload,
    RecipeDetails,
    RecipeIngredientPayload,
} from '../types/recipe';

interface RecipeFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialRecipe?: RecipeDetails | null;
    onClose: () => void;
    onSuccess: () => void;
}

const emptyIngredient: RecipeIngredientPayload = {
    ingredientId: 0,
    amount: '',
    unit: '',
};

export function RecipeFormModal({
                                    isOpen,
                                    mode,
                                    initialRecipe,
                                    onClose,
                                    onSuccess,
                                }: RecipeFormModalProps) {
    const [categories, setCategories] = useState<NamedEntity[]>([]);
    const [cuisines, setCuisines] = useState<NamedEntity[]>([]);
    const [ingredientsList, setIngredientsList] = useState<NamedEntity[]>([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [cookingTimeMinutes, setCookingTimeMinutes] = useState<number | ''>('');
    const [servings, setServings] = useState<number | ''>('');
    const [imageUrl, setImageUrl] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [cuisineId, setCuisineId] = useState<number | ''>('');
    const [ingredients, setIngredients] = useState<RecipeIngredientPayload[]>([emptyIngredient]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const loadDictionaries = async () => {
            try {
                const [categoriesData, cuisinesData, ingredientsData] = await Promise.all([
                    getCategories(),
                    getCuisines(),
                    getIngredients(),
                ]);

                setCategories(categoriesData.payload);
                setCuisines(cuisinesData.payload);
                setIngredientsList(ingredientsData.payload);
            } catch (e) {
                setError('Не удалось загрузить справочники');
            }
        };

        loadDictionaries();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && initialRecipe) {
            setName(initialRecipe.name);
            setDescription(initialRecipe.description);
            setInstructions(initialRecipe.instructions);
            setCookingTimeMinutes(initialRecipe.cookingTimeMinutes);
            setServings(initialRecipe.servings);
            setImageUrl(initialRecipe.imageUrl ?? '');
            setCategoryId(initialRecipe.categoryId ?? '');
            setCuisineId(initialRecipe.cuisineId ?? '');
            setIngredients(
                initialRecipe.ingredients.length > 0
                    ? initialRecipe.ingredients.map((item) => ({
                        ingredientId: item.ingredientId,
                        amount: item.amount,
                        unit: item.unit ?? '',
                    }))
                    : [emptyIngredient]
            );
        } else {
            setName('');
            setDescription('');
            setInstructions('');
            setCookingTimeMinutes('');
            setServings('');
            setImageUrl('');
            setCategoryId('');
            setCuisineId('');
            setIngredients([emptyIngredient]);
        }

        setError('');
    }, [isOpen, mode, initialRecipe]);

    if (!isOpen) {
        return null;
    }

    const updateIngredient = (
        index: number,
        field: keyof RecipeIngredientPayload,
        value: string | number | null
    ) => {
        setIngredients((prev) =>
            prev.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    };

    const addIngredientRow = () => {
        setIngredients((prev) => [...prev, { ...emptyIngredient }]);
    };

    const removeIngredientRow = (index: number) => {
        setIngredients((prev) => {
            if (prev.length === 1) {
                return prev;
            }

            return prev.filter((_, itemIndex) => itemIndex !== index);
        });
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Введите название блюда');
            return;
        }

        if (!description.trim()) {
            setError('Введите описание блюда');
            return;
        }

        if (!instructions.trim()) {
            setError('Введите способ приготовления');
            return;
        }

        if (cookingTimeMinutes === '' || Number(cookingTimeMinutes) <= 0) {
            setError('Введите корректное время приготовления');
            return;
        }

        if (servings === '' || Number(servings) <= 0) {
            setError('Введите корректное количество порций');
            return;
        }

        if (categoryId === '') {
            setError('Выберите категорию');
            return;
        }

        if (cuisineId === '') {
            setError('Выберите кухню');
            return;
        }

        const preparedIngredients = ingredients
            .filter((item) => item.ingredientId && item.amount.trim())
            .map((item) => ({
                ingredientId: Number(item.ingredientId),
                amount: item.amount.trim(),
                unit: item.unit && item.unit.trim() ? item.unit.trim() : null,
            }));

        if (preparedIngredients.length === 0) {
            setError('Добавьте хотя бы один ингредиент');
            return;
        }

        const payload: CreateUpdateRecipePayload = {
            name: name.trim(),
            description: description.trim(),
            instructions: instructions.trim(),
            cookingTimeMinutes: Number(cookingTimeMinutes),
            servings: Number(servings),
            imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
            categoryId: Number(categoryId),
            cuisineId: Number(cuisineId),
            ingredients: preparedIngredients,
        };

        try {
            setLoading(true);
            setError('');

            if (mode === 'edit' && initialRecipe) {
                await updateRecipe(initialRecipe.id, payload);
            } else {
                await createRecipe(payload);
            }

            onSuccess();
            onClose();
        } catch (e) {
            setError(mode === 'edit' ? 'Не удалось изменить блюдо' : 'Не удалось добавить блюдо');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                boxSizing: 'border-box',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    padding: '26px',
                    boxSizing: 'border-box',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)',
                    textAlign: 'left',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '22px',
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '32px' }}>
                        {mode === 'edit' ? 'Изменить блюдо' : 'Добавить новое блюдо'}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '28px',
                            cursor: 'pointer',
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div
                        style={{
                            marginBottom: '16px',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: '#fff2f2',
                            color: '#b00020',
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                            Название
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                            Ссылка на изображение
                        </label>
                        <input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Можно оставить пустым"
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                            Категория
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                            Кухня
                        </label>
                        <select
                            value={cuisineId}
                            onChange={(e) => setCuisineId(e.target.value ? Number(e.target.value) : '')}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">Выберите кухню</option>
                            {cuisines.map((cuisine) => (
                                <option key={cuisine.id} value={cuisine.id}>
                                    {cuisine.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                            Время приготовления, мин
                        </label>
                        <input
                            type="number"
                            value={cookingTimeMinutes}
                            onChange={(e) => setCookingTimeMinutes(e.target.value ? Number(e.target.value) : '')}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                            Порции
                        </label>
                        <input
                            type="number"
                            value={servings}
                            onChange={(e) => setServings(e.target.value ? Number(e.target.value) : '')}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                        Описание
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '11px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                        }}
                    />
                </div>

                <div style={{ marginTop: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                        Способ приготовления
                    </label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '11px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                        }}
                    />
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ marginTop: 0 }}>Ингредиенты</h3>

                    {ingredients.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1fr 1fr 90px',
                                gap: '10px',
                                marginBottom: '10px',
                            }}
                        >
                            <select
                                value={item.ingredientId}
                                onChange={(e) =>
                                    updateIngredient(index, 'ingredientId', e.target.value ? Number(e.target.value) : 0)
                                }
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                }}
                            >
                                <option value={0}>Ингредиент</option>
                                {ingredientsList.map((ingredient) => (
                                    <option key={ingredient.id} value={ingredient.id}>
                                        {ingredient.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                value={item.amount}
                                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                placeholder="Количество"
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                }}
                            />

                            <input
                                value={item.unit ?? ''}
                                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                placeholder="Ед. изм."
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => removeIngredientRow(index)}
                                disabled={ingredients.length === 1}
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#fff',
                                    cursor: ingredients.length === 1 ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Удалить
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addIngredientRow}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        + Добавить ингредиент
                    </button>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        marginTop: '24px',
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '12px 18px',
                            borderRadius: '10px',
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        Отмена
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: '12px 18px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#111',
                            color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? 'Сохраняем...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
}