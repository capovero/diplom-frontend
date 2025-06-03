// src/pages/EditProjectPage.tsx

import React, { useState, useEffect } from 'react';
import {
    Container,
    Form,
    Button,
    Card,
    Alert,
    Spinner,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { projectsApi, categoriesApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import axios, { AxiosError } from 'axios';

// ===== 1) Интерфейсы для данных проекта и категории =====

interface ProjectResponse {
    id: number;
    title: string;
    description: string;
    goalAmount: number;
    collectedAmount: number;
    createdAt: string;        // ISO string
    categoryName?: string;
    status: string;
    mediaFiles: string[];     // urls
    averageRating: number | null;
    creator: {
        id: string;
        userName: string;
        email: string;
    };
}

interface CategoryDto {
    id: number;
    name: string;
}

// ===== 2) Схема валидации =====

const editSchema = Yup.object().shape({
    title: Yup.string()
        .min(2, 'Должно быть не менее 2 символов')
        .required('Название обязательно'),
    description: Yup.string()
        .min(10, 'Должно быть не менее 10 символов')
        .required('Описание обязательно'),
    goalAmount: Yup.number()
        .min(1, 'Цель должна быть > 0')
        .required('Цель обязательна'),
    categoryId: Yup.number().nullable(),
});

export const EditProjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = Number(id);
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [initialValues, setInitialValues] = useState<{
        title: string;
        description: string;
        goalAmount: number;
        categoryId: number | null;
    }>({
        title: '',
        description: '',
        goalAmount: 0,
        categoryId: null,
    });
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ===== Загрузка данных (проект + список категорий) =====
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Получаем проект по ID
                const resp = await projectsApi.getById(projectId);
                const proj = resp.data;

                // Устанавливаем начальные значения формы
                // найдем id категории по имени (если есть)
                let categoryId: number | null = null;
                if (proj.categoryName) {
                    const allCats = (await categoriesApi.getAll()).data;
                    const match = allCats.find((c) => c.name === proj.categoryName);
                    categoryId = match ? match.id : null;
                }

                setInitialValues({
                    title: proj.title,
                    description: proj.description,
                    goalAmount: proj.goalAmount,
                    categoryId,
                });

                // 2. Список категорий
                const catResp = await categoriesApi.getAll();
                setCategories(catResp.data);
            } catch (err: any) {
                console.error('Ошибка загрузки проекта или категорий:', err);
                setError(
                    axios.isAxiosError(err)
                        ? err.response?.data?.message || 'Не удалось загрузить данные'
                        : 'Неизвестная ошибка'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    // ===== Обработчик сабмита =====
    const handleSubmit = async (
        values: {
            title: string;
            description: string;
            goalAmount: number;
            categoryId: number | null;
        },
        helpers: FormikHelpers<{
            title: string;
            description: string;
            goalAmount: number;
            categoryId: number | null;
        }>
    ) => {
        try {
            // Собираем FormData (даже если файлов нет, сервер ожидает [FromForm])
            const formData = new FormData();
            formData.append('Title', values.title);
            formData.append('Description', values.description);
            formData.append('GoalAmount', values.goalAmount.toString());
            // Если категория null или 0, пусть там придёт 0 – бэкенд сбросит на null
            formData.append(
                'CategoryId',
                values.categoryId ? values.categoryId.toString() : '0'
            );

            await projectsApi.update(projectId, formData);

            // После успешного обновления – сразу переходим на страницу этого же проекта,
            // чтобы там заново подтянуть свежие данные:
            navigate(`/project/${projectId}`);
        } catch (err: any) {
            console.error('Ошибка при сохранении изменений:', err);
            setError(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || 'Не удалось сохранить изменения'
                    : 'Неизвестная ошибка'
            );
        } finally {
            helpers.setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Card
                className={`mx-auto p-4 ${
                    theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                }`}
                style={{ maxWidth: 600 }}
            >
                <h2 className="mb-4 text-center">Редактировать проект</h2>

                <Formik
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={editSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          isSubmitting,
                          setFieldValue,
                      }) => (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Название</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={values.title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.title && !!errors.title}
                                    className={
                                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.title}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Описание</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="description"
                                    value={values.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.description && !!errors.description}
                                    className={
                                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Целевая сумма ($)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="goalAmount"
                                    value={values.goalAmount}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.goalAmount && !!errors.goalAmount}
                                    className={
                                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                                    }
                                    min="1"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.goalAmount}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Категория</Form.Label>
                                <Form.Select
                                    name="categoryId"
                                    value={values.categoryId || ''}
                                    onChange={(e) =>
                                        setFieldValue(
                                            'categoryId',
                                            e.target.value ? Number(e.target.value) : null
                                        )
                                    }
                                    onBlur={handleBlur}
                                    className={
                                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                                    }
                                >
                                    <option value="">Без категории</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <div className="d-flex justify-content-between">
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate(-1)}
                                    disabled={isSubmitting}
                                >
                                    Отмена
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </Container>
    );
};
