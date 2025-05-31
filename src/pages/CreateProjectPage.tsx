import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Footer } from '../components/Footer';
import { projectsApi, categoriesApi } from '../services/api.ts'; // Используем алиас

// Типы для значений формы
interface FormValues {
  title: string;
  description: string;
  categoryId: string;
  goalAmount: string;
}

// Схема валидации
const projectSchema = Yup.object().shape({
  title: Yup.string()
      .min(5, 'Название должно содержать не менее 5 символов')
      .max(100, 'Заголовок должен содержать менее 100 символов')
      .required('Название обязательно'),
  description: Yup.string()
      .min(50, 'Описание должно содержать не менее 50 символов')
      .required('Описание обязательно'),
  categoryId: Yup.string(),
  goalAmount: Yup.number()
      .min(100, 'Цель должна составлять не менее $100')
      .required('Требуется цель финансирования'),
});

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.data);
      } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
        setError('Не удалось загрузить категории');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Если пользователь не авторизован - редирект
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      }
    }

    setImageFiles([...imageFiles, ...newFiles]);
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviewUrls = [...imagePreviewUrls];

    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Обработчик отправки формы
  const handleSubmit = async (
      values: FormValues,
      { setSubmitting, setStatus }: FormikHelpers<FormValues>
  ) => {
    setError(null);

    try {
      if (imageFiles.length === 0) {
        throw new Error('Добавьте хотя бы одно изображение');
      }

      // Создаем FormData для отправки
      const formData = new FormData();
      formData.append('Title', values.title);
      formData.append('Description', values.description);
      formData.append('GoalAmount', values.goalAmount);

      // Добавляем категорию (если выбрана)
      if (values.categoryId) {
        formData.append('CategoryId', values.categoryId);
      } else {
        formData.append('CategoryId', '0');
      }

      // Добавляем файлы
      imageFiles.forEach(file => {
        formData.append('MediaFiles', file);
      });

      // Отправка на сервер
      const response = await projectsApi.create(formData);

      // Редирект на страницу созданного проекта
      navigate(`/project/${response.data.id}`);
    } catch (err: any) {
      console.error('Ошибка создания проекта:', err);
      setStatus('Не удалось создать проект. Пожалуйста, попробуйте снова.');
      setError(
          err.response?.data?.errors?.dto?.[0] ||
          err.response?.data?.message ||
          err.message ||
          'Произошла неизвестная ошибка'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
    );
  }

  return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <Container className="py-5">
            <h1 className={`mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Создать новый проект</h1>

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            <Formik
                initialValues={{
                  title: '',
                  description: '',
                  categoryId: '',
                  goalAmount: '',
                }}
                validationSchema={projectSchema}
                onSubmit={handleSubmit}
            >
              {({
                  values,
                  errors,
                  touched,
                  status,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    {status && <Alert variant="danger">{status}</Alert>}

                    <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                      <Card.Body>
                        <h5 className="mb-3">Основная информация</h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Название проекта</Form.Label>
                          <Form.Control
                              type="text"
                              name="title"
                              value={values.title}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.title && !!errors.title}
                              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.title}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Категория</Form.Label>
                          <Form.Select
                              name="categoryId"
                              value={values.categoryId}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                          >
                            <option value="">Выбрать категорию (необязательно)</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Описание проекта</Form.Label>
                          <Form.Control
                              as="textarea"
                              rows={5}
                              name="description"
                              value={values.description}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.description && !!errors.description}
                              placeholder="Опишите ваш проект в деталях..."
                              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.description}
                          </Form.Control.Feedback>
                          <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                            Минимум 50 символов. Подробно расскажите о том, что вы создаете и почему это важно.
                          </Form.Text>
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                      <Card.Body>
                        <h5 className="mb-3">Подробности финансирования</h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Цель финансирования ($)</Form.Label>
                          <Form.Control
                              type="number"
                              name="goalAmount"
                              value={values.goalAmount}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.goalAmount && !!errors.goalAmount}
                              min="100"
                              step="1"
                              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.goalAmount}
                          </Form.Control.Feedback>
                          <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                            Минимум 100 долларов. Установите реалистичную цель, которая покрывает потребности вашего проекта.
                          </Form.Text>
                        </Form.Group>
                      </Card.Body>
                    </Card>

                    <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                      <Card.Body>
                        <h5 className="mb-3">Медиа</h5>

                        <Form.Group className="mb-4">
                          <Form.Label>Фотографии проекта</Form.Label>
                          <Form.Control
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                          />
                          <Form.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                            Загружайте высококачественные изображения, демонстрирующие ваш проект. Вы можете загружать несколько изображений.
                          </Form.Text>
                        </Form.Group>

                        {imagePreviewUrls.length > 0 && (
                            <div className="mb-4">
                              <p className="mb-2">Предварительные просмотры изображений:</p>
                              <Row xs={2} md={3} lg={4} className="g-2">
                                {imagePreviewUrls.map((url, index) => (
                                    <Col key={index}>
                                      <div className="position-relative">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="img-thumbnail"
                                            style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                                        />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-1"
                                            onClick={() => removeImage(index)}
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    </Col>
                                ))}
                              </Row>
                            </div>
                        )}

                      </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-between">
                      <Button
                          variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                          onClick={() => navigate('/')}
                      >
                        Отмена
                      </Button>
                      <Button
                          type="submit"
                          variant="primary"
                          disabled={isSubmitting || imageFiles.length === 0}
                      >
                        {isSubmitting ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Проект создается...
                            </>
                        ) : 'Создать проект'}
                      </Button>
                    </div>
                  </Form>
              )}
            </Formik>
          </Container>
        </main>
        <Footer />
      </div>
  );
};