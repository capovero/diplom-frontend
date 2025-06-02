// src/pages/ProjectPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Alert,
  Row,
  Col,
  Badge,
  ProgressBar,
  Button,
  Card,
  Carousel,
  Modal,
  Tab,
  Nav,
  Table,
  Form,
  Spinner
} from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { Star, ChevronLeft, Trash2, Edit } from 'lucide-react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  projectsApi,
  reviewsApi,
  donationsApi,
  updatesApi
} from '../services/api';
import { DonationModal } from '../components/DonationModal';
import { SocialShareButtons } from '../components/SocialShareButtons';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ===== 1) Интерфейсы DTO, возвращающиеся с бэкенда =====

interface Project {
  id: number;
  title: string;
  description: string;
  mediaFiles: string[];
  goalAmount: number;
  collectedAmount: number;
  creator: {
    id: string;
    userName: string;
  };
  categoryName: string | null;
  status: string;       // "0" | "1" | "2" | "3" | "4"
  createdAt: string;
  averageRating: number | null;
}

interface ProjectUpdate {
  id: number;
  content: string;
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
}

interface DonationRecord {
  userName: string;
  amount: number;
  donateAt: string;
}

// ===== 2) Схемы валидации =====

const updateSchema = Yup.object().shape({
  content: Yup.string()
      .min(10, 'Обновление должно содержать не менее 10 символов')
      .required('Требуется текст'),
});

const reviewSchema = Yup.object().shape({
  rating: Yup.number()
      .min(1, 'Рейтинг должен быть не менее 1')
      .max(5, 'Рейтинг не может быть больше 5')
      .required('Требуется рейтинг'),
  comment: Yup.string()
      .min(10, 'Отзыв должен содержать не менее 10 символов')
      .required('Требуется текст отзыва'),
});

// ===== 3) Функция перевода кода статуса в понятную строку =====

function getStatusLabel(code: string): string {
  switch (Number(code)) {
    case 0: return 'Ожидается';
    case 1: return 'Одобрено';
    case 2: return 'Отклонено';
    case 3: return 'Активно';
    case 4: return 'Завершено';
    default: return 'Неизвестно';
  }
}

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [project, setProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [donations, setDonations] = useState<DonationRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 },
  });

  // Проверяем, является ли текущий пользователь владельцем проекта:
  const isProjectCreator = project?.creator.id === user?.id;
  const canManageUpdates = user?.role === 'ADMIN' || isProjectCreator;
  const canManageReviews = user?.role === 'ADMIN';
  const hasUserReviewed = reviews.some(r => r.userName === user?.userName);

  useEffect(() => {
    const loadProjectData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      // 1. Загрузка основной информации о проекте
      try {
        const resp = await projectsApi.getById(Number(id));
        const p = resp.data;
        setProject({
          id: p.id,
          title: p.title,
          description: p.description,
          mediaFiles: p.mediaFiles,
          goalAmount: p.goalAmount,
          collectedAmount: p.collectedAmount,
          creator: {
            id: p.creator.id,
            userName: p.creator.userName
          },
          categoryName: p.categoryName, // может быть null
          status: p.status,
          createdAt: p.createdAt,
          averageRating: p.averageRating
        });
      } catch (err) {
        console.error('Проект не найден или ошибка сети:', err);
        setError('Проект не найден или ошибка сети');
        setLoading(false);
        return;
      }

      // 2. Загрузка отзывов
      try {
        const reviewsResp = await reviewsApi.getByProject(Number(id));
        setReviews(
            reviewsResp.data.map(r => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              userName: r.userName
            }))
        );
      } catch (err) {
        if ((err as any).response?.status === 404) {
          setReviews([]);
        } else {
          console.error('Ошибка загрузки отзывов:', err);
          setError('Не удалось загрузить отзывы');
        }
      }

      // 3. Загрузка обновлений
      try {
        const updatesResp = await updatesApi.getByProject(Number(id));
        setUpdates(
            updatesResp.data.map(u => ({
              id: u.id,
              content: u.content,
              createdAt: u.createdAt
            }))
        );
      } catch (err) {
        if ((err as any).response?.status === 404) {
          setUpdates([]);
        } else {
          console.error('Ошибка загрузки обновлений:', err);
          setError('Не удалось загрузить обновления');
        }
      }

      // 4. Загрузка пожертвований (если админ или создатель)
      try {
        if (user?.role === 'ADMIN') {
          const donateResp = await donationsApi.adminGetForProject(Number(id));
          setDonations(
              donateResp.data.map(d => ({
                userName: d.userName,
                amount: d.amount,
                donateAt: d.donateAt
              }))
          );
        } else if (isProjectCreator) {
          const donateResp = await donationsApi.getForCreatorProject(Number(id));
          setDonations(
              donateResp.data.map(d => ({
                userName: d.userName,
                amount: d.amount,
                donateAt: d.donateAt
              }))
          );
        }
      } catch (err) {
        const status = (err as any).response?.status;
        if (status === 404 || status === 403) {
          // 404 → нет пожертвований, 403 → нет доступа (но мы — не админ → можем игнорировать)
          setDonations([]);
        } else {
          console.error('Ошибка загрузки пожертвований:', err);
          setError('Не удалось загрузить пожертвования');
        }
      }

      setLoading(false);
    };

    loadProjectData();
  }, [id, user, isProjectCreator]);

  // ===== Функция «Пожертвовать» =====
  const handleDonate = async (amount: number) => {
    if (!id) return;
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      await donationsApi.create(Number(id), amount);

      setProject(prev => prev
          ? { ...prev, collectedAmount: prev.collectedAmount + amount }
          : null
      );

      // Обновляем список пожертвований:
      if (user.role === 'ADMIN') {
        const resp = await donationsApi.adminGetForProject(Number(id));
        setDonations(resp.data.map(d => ({
          userName: d.userName,
          amount: d.amount,
          donateAt: d.donateAt
        })));
      } else if (isProjectCreator) {
        const resp = await donationsApi.getForCreatorProject(Number(id));
        setDonations(resp.data.map(d => ({
          userName: d.userName,
          amount: d.amount,
          donateAt: d.donateAt
        })));
      }

      setShowDonateModal(false);
    } catch (err) {
      console.error('Ошибка при пожертвовании:', err);
      setError('Не удалось выполнить пожертвование');
    }
  };

  // ===== Создание / Редактирование обновления =====
  const handleUpdateSubmit = async (
      values: { content: string },
      helpers: FormikHelpers<{ content: string }>
  ) => {
    if (!id) return;
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      // Если редактируем существующее
      if (editingUpdate) {
        await updatesApi.update(editingUpdate.id, {
          content: values.content,
          projectId: Number(id)
        });
        setUpdates(prev =>
            prev.map(u => u.id === editingUpdate.id
                ? { ...u, content: values.content }
                : u
            )
        );
      } else {
        // Иначе создаём новое
        const resp = await updatesApi.create({
          content: values.content,
          projectId: Number(id)
        });
        const newU: ProjectUpdate = {
          id: resp.data.id,
          content: values.content,
          createdAt: new Date().toISOString()
        };
        setUpdates(prev => [newU, ...prev]);
      }

      setShowUpdateModal(false);
      setEditingUpdate(null);
      helpers.resetForm();
    } catch (err) {
      console.error('Ошибка при сохранении обновления:', err);
      setError('Не удалось сохранить обновление');
    }
  };

  // ===== Создание / Редактирование отзыва =====
  const handleReviewSubmit = async (
      values: { rating: number; comment: string },
      helpers: FormikHelpers<{ rating: number; comment: string }>
  ) => {
    if (!id) return;
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      if (editingReview) {
        await reviewsApi.update(editingReview.id, {
          rating: values.rating,
          comment: values.comment
        });
        setReviews(prev =>
            prev.map(r =>
                r.id === editingReview.id
                    ? { ...r, rating: values.rating, comment: values.comment }
                    : r
            )
        );
      } else {
        const resp = await reviewsApi.create({
          projectId: Number(id),
          rating: values.rating,
          comment: values.comment
        });
        const newR: Review = {
          id: resp.data.id,
          rating: values.rating,
          comment: values.comment,
          userName: user.userName || 'Пользователь'
        };
        setReviews(prev => [newR, ...prev]);
      }
      // Пересчитаем средний рейтинг на клиенте
      if (project) {
        const sumRatings =
            reviews.reduce((sum, r) => sum + r.rating, 0)
            + (editingReview ? values.rating - editingReview.rating : values.rating);
        const count = editingReview ? reviews.length : reviews.length + 1;
        const newAvg = count > 0 ? sumRatings / count : 0;
        setProject(prev => prev
            ? { ...prev, averageRating: newAvg }
            : null
        );
      }
      setShowReviewModal(false);
      setEditingReview(null);
      helpers.resetForm();
    } catch (err) {
      console.error('Ошибка при сохранении отзыва:', err);
      setError('Не удалось сохранить отзыв');
    }
  };

  // ===== Удаление обновления =====
  const handleDeleteUpdate = async (updateId: number) => {
    if (!id) return;
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      if (window.confirm('Уверены, что хотите удалить это обновление?')) {
        await updatesApi.delete(updateId);
        setUpdates(prev => prev.filter(u => u.id !== updateId));
      }
    } catch (err) {
      console.error('Ошибка при удалении обновления:', err);
      setError('Не удалось удалить обновление');
    }
  };

  // ===== Удаление отзыва =====
  const handleDeleteReview = async (reviewId: number) => {
    if (!id) return;
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      if (window.confirm('Уверены, что хотите удалить этот отзыв?')) {
        await reviewsApi.delete(reviewId);
        const rToDelete = reviews.find(r => r.id === reviewId);
        if (rToDelete && project) {
          const sumAll = reviews.reduce((sum, r) => sum + r.rating, 0);
          const newCount = reviews.length - 1;
          const newSum = sumAll - (rToDelete.rating);
          const newAvg = newCount > 0 ? newSum / newCount : 0;
          setProject(prev => prev
              ? { ...prev, averageRating: newAvg }
              : null
          );
        }
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    } catch (err) {
      console.error('Ошибка при удалении отзыва:', err);
      setError('Не удалось удалить отзыв');
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

  if (!project) {
    return (
        <Container className="py-5">
          <div className="text-center">
            <h3>Проект не найден</h3>
            <Button onClick={() => navigate('/')} variant="primary">
              Вернуться на главную
            </Button>
          </div>
        </Container>
    );
  }

  const progress = (project.collectedAmount / project.goalAmount) * 100;
  const totalReviews = reviews.length;

  return (
      <div className="d-flex flex-column min-vh-100">
        <animated.div style={fadeIn} className="flex-grow-1">
          <Container className="py-4">
            {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
            )}

            {/* Назад + основная информация */}
            <div className="mb-4">
              <Button
                  variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                  onClick={() => navigate('/')}
                  className="mb-3"
              >
                <ChevronLeft size={20} className="me-1" />
                Назад к проектам
              </Button>
              <h1 className={theme === 'dark' ? 'text-light' : ''}>
                {project.title}
              </h1>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Badge bg="primary">
                  {project.categoryName || 'Без категории'}
                </Badge>
                <Badge bg="success">{getStatusLabel(project.status)}</Badge>
                <div className="ms-2 d-flex align-items-center">
                  <Star className="text-warning" size={18} />
                  <span className="ms-1">
                  {(project.averageRating ?? 0).toFixed(1)}
                </span>
                  <span className="ms-1 text-muted">({totalReviews} отзывов)</span>
                </div>
                <div className="ms-2">
                  by{' '}
                  <Link
                      to={`/profile/${project.creator.id}`}
                      className={`text-decoration-none ${
                          theme === 'dark' ? 'text-light' : 'text-primary'
                      }`}
                  >
                    {project.creator.userName}
                  </Link>
                </div>
              </div>
            </div>

            <Row className="g-4">
              {/* ===== Слева: Карусель и описание ===== */}
              <Col lg={8}>
                <Card
                    className={`project-carousel mb-4 ${
                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                    }`}
                >
                  <Card.Body className="p-0">
                    <Carousel
                        activeIndex={currentImageIndex}
                        onSelect={setCurrentImageIndex}
                        interval={null}
                        indicators={false}
                    >
                      {project.mediaFiles.map((image, idx) => (
                          <Carousel.Item key={idx}>
                            <div className="project-image-container">
                              <img
                                  src={image}
                                  alt={`Project ${idx + 1}`}
                                  className="project-image"
                              />
                            </div>
                          </Carousel.Item>
                      ))}
                    </Carousel>
                    <div className="image-thumbnails px-3 pb-3">
                      {project.mediaFiles.map((image, idx) => (
                          <img
                              key={idx}
                              src={image}
                              alt={`Thumbnail ${idx + 1}`}
                              className={`thumbnail-image ${
                                  idx === currentImageIndex ? 'active' : ''
                              }`}
                              onClick={() => setCurrentImageIndex(idx)}
                          />
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                <Card
                    className={`mb-4 ${
                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                    }`}
                >
                  <Card.Body>
                    <h4 className="mb-3">О проекте</h4>
                    <p>{project.description}</p>
                  </Card.Body>
                </Card>
              </Col>

              {/* ===== Справа: Инфо о сборе и Donate ===== */}
              <Col lg={4}>
                <Card
                    className={`mb-4 ${
                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                    }`}
                >
                  <Card.Body>
                    <h4 className="mb-3">
                      $ {(project.collectedAmount).toLocaleString()}
                    </h4>
                    <p
                        className={`mb-1 ${
                            theme === 'dark' ? 'text-light-50' : 'text-muted'
                        }`}
                    >
                      собрано из $ {(project.goalAmount).toLocaleString()}
                    </p>
                    <ProgressBar now={progress} className="mb-4" />

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-100 mb-3"
                        onClick={() => setShowDonateModal(true)}
                    >
                      Поддержите этот проект
                    </Button>

                    <SocialShareButtons
                        projectId={project.id}
                        projectTitle={project.title}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ===== Вкладки: Отзывы / Обновления / Пожертвования ===== */}
            <Tab.Container defaultActiveKey="reviews">
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link
                      eventKey="reviews"
                      className={theme === 'dark' ? 'text-light' : ''}
                  >
                    Отзывы
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                      eventKey="updates"
                      className={theme === 'dark' ? 'text-light' : ''}
                  >
                    Обновления
                  </Nav.Link>
                </Nav.Item>
                {(user?.role === 'ADMIN' || isProjectCreator) && (
                    <Nav.Item>
                      <Nav.Link
                          eventKey="donations"
                          className={theme === 'dark' ? 'text-light' : ''}
                      >
                        Пожертвования
                      </Nav.Link>
                    </Nav.Item>
                )}
              </Nav>

              <Tab.Content>
                {/* ===== Вкладка «Отзывы» ===== */}
                <Tab.Pane eventKey="reviews">
                  <Card
                      className={
                        theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                      }
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h5 className="mb-2">Отзывы проекта</h5>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star
                                      key={idx}
                                      size={20}
                                      className={
                                        idx < Math.round(project.averageRating ?? 0)
                                            ? 'text-warning'
                                            : 'text-muted'
                                      }
                                      fill={
                                        idx < Math.round(project.averageRating ?? 0)
                                            ? 'currentColor'
                                            : 'none'
                                      }
                                  />
                              ))}
                            </div>
                            <span className="fs-5 fw-bold me-2">
                            {(project.averageRating ?? 0).toFixed(1)}
                          </span>
                            <span className="text-muted">({totalReviews} отзывов)</span>
                          </div>
                        </div>

                        {user && !hasUserReviewed && !isProjectCreator && (
                            <Button
                                variant={
                                  theme === 'dark' ? 'outline-light' : 'outline-primary'
                                }
                                onClick={() => {
                                  setEditingReview(null);
                                  setShowReviewModal(true);
                                }}
                            >
                              Написать отзыв
                            </Button>
                        )}
                      </div>

                      {reviews.map(r => (
                          <Card
                              key={r.id}
                              className={`mb-3 ${
                                  theme === 'dark'
                                      ? 'bg-secondary-dark border-secondary'
                                      : 'bg-light'
                              }`}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between mb-2">
                                <div>
                                  <div className="d-flex align-items-center mb-1">
                                    <div className="me-2">
                                      {Array.from({ length: 5 }).map((_v, idx2) => (
                                          <Star
                                              key={idx2}
                                              size={16}
                                              className={
                                                idx2 < r.rating ? 'text-warning' : 'text-muted'
                                              }
                                              fill={
                                                idx2 < r.rating ? 'currentColor' : 'none'
                                              }
                                          />
                                      ))}
                                    </div>
                                    <small
                                        className={
                                          theme === 'dark' ? 'text-light-50' : 'text-muted'
                                        }
                                    >
                                      от {r.userName}
                                    </small>
                                  </div>
                                </div>

                                {(canManageReviews || r.userName === user?.userName) && (
                                    <div>
                                      {r.userName === user?.userName && (
                                          <Button
                                              variant="link"
                                              className="p-0 me-3"
                                              onClick={() => {
                                                setEditingReview(r);
                                                setShowReviewModal(true);
                                              }}
                                          >
                                            <Edit size={16} />
                                          </Button>
                                      )}
                                      <Button
                                          variant="link"
                                          className="p-0 text-danger"
                                          onClick={() => handleDeleteReview(r.id)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                )}
                              </div>
                              <p className="mb-0">{r.comment}</p>
                            </Card.Body>
                          </Card>
                      ))}

                      {reviews.length === 0 && (
                          <p
                              className={`text-center ${
                                  theme === 'dark' ? 'text-light-50' : 'text-muted'
                              }`}
                          >
                            Отзывов пока нет
                          </p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* ===== Вкладка «Обновления» ===== */}
                <Tab.Pane eventKey="updates">
                  <Card
                      className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0">Обновления проекта</h5>
                        {canManageUpdates && (
                            <Button
                                variant={
                                  theme === 'dark' ? 'outline-light' : 'outline-primary'
                                }
                                onClick={() => {
                                  setEditingUpdate(null);
                                  setShowUpdateModal(true);
                                }}
                            >
                              Добавить обновление
                            </Button>
                        )}
                      </div>

                      {updates.map(u => (
                          <Card
                              key={u.id}
                              className={`mb-3 ${
                                  theme === 'dark'
                                      ? 'bg-secondary-dark border-secondary'
                                      : 'bg-light'
                              }`}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between mb-2">
                                <div>
                                  <small
                                      className={theme === 'dark' ? 'text-light-50' : 'text-muted'}
                                  >
                                    {new Date(u.createdAt).toLocaleDateString()}
                                  </small>
                                </div>
                                {canManageUpdates && (
                                    <div>
                                      <Button
                                          variant="link"
                                          className="p-0 me-3"
                                          onClick={() => {
                                            setEditingUpdate(u);
                                            setShowUpdateModal(true);
                                          }}
                                      >
                                        <Edit size={16} />
                                      </Button>
                                      <Button
                                          variant="link"
                                          className="p-0 text-danger"
                                          onClick={() => handleDeleteUpdate(u.id)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                )}
                              </div>
                              <p className="mb-0">{u.content}</p>
                            </Card.Body>
                          </Card>
                      ))}

                      {updates.length === 0 && (
                          <p
                              className={`text-center ${
                                  theme === 'dark' ? 'text-light-50' : 'text-muted'
                              }`}
                          >
                            Обновлений пока нет
                          </p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* ===== Вкладка «Пожертвования» (для владельца/админа) ===== */}
                {(user?.role === 'ADMIN' || isProjectCreator) && (
                    <Tab.Pane eventKey="donations">
                      <Card
                          className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                      >
                        <Card.Body>
                          <h5 className="mb-4">Пожертвования проекта</h5>
                          <Table
                              responsive
                              className={theme === 'dark' ? 'table-dark' : ''}
                          >
                            <thead>
                            <tr>
                              <th>Донатёр</th>
                              <th>Сумма</th>
                              <th>Дата</th>
                            </tr>
                            </thead>
                            <tbody>
                            {donations.map((d, idx) => (
                                <tr key={idx}>
                                  <td>{d.userName}</td>
                                  <td>${d.amount}</td>
                                  <td>
                                    {new Date(d.donateAt).toLocaleDateString()}
                                  </td>
                                </tr>
                            ))}
                            {donations.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="text-center">
                                    Пожертвования не найдены
                                  </td>
                                </tr>
                            )}
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Tab.Pane>
                )}
              </Tab.Content>
            </Tab.Container>
          </Container>
        </animated.div>

        <Footer />

        {/* ===== DonationModal ===== */}
        {project && (
            <DonationModal
                show={showDonateModal}
                onHide={() => setShowDonateModal(false)}
                projectTitle={project.title}
                onDonate={handleDonate}
            />
        )}

        {/* ===== Модалка «Добавить/Редактировать обновление» ===== */}
        <Modal
            show={showUpdateModal}
            onHide={() => {
              setShowUpdateModal(false);
              setEditingUpdate(null);
            }}
            centered
        >
          <Modal.Header
              closeButton
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
          >
            <Modal.Title>
              {editingUpdate ? 'Редактировать обновление' : 'Добавить обновление'}
            </Modal.Title>
          </Modal.Header>
          <Formik
              initialValues={{ content: editingUpdate?.content || '' }}
              validationSchema={updateSchema}
              onSubmit={handleUpdateSubmit}
          >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                    <Form.Group>
                      <Form.Label>Текст обновления</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows={4}
                          name="content"
                          value={values.content}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.content && !!errors.content}
                          className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.content}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                    <Button
                        variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                        onClick={() => {
                          setShowUpdateModal(false);
                          setEditingUpdate(null);
                        }}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Сохранение...' : editingUpdate ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </Modal.Footer>
                </Form>
            )}
          </Formik>
        </Modal>

        {/* ===== Модалка «Добавить/Редактировать отзыв» ===== */}
        <Modal
            show={showReviewModal}
            onHide={() => {
              setShowReviewModal(false);
              setEditingReview(null);
            }}
            centered
        >
          <Modal.Header
              closeButton
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
          >
            <Modal.Title>
              {editingReview ? 'Изменить отзыв' : 'Написать отзыв'}
            </Modal.Title>
          </Modal.Header>
          <Formik
              initialValues={{
                rating: editingReview?.rating || 5,
                comment: editingReview?.comment || '',
              }}
              validationSchema={reviewSchema}
              onSubmit={handleReviewSubmit}
          >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                    <Form.Group className="mb-3">
                      <Form.Label>Рейтинг</Form.Label>
                      <div className="d-flex gap-2">
                        {Array.from({ length: 5 }).map((_v, idx) => (
                            <Button
                                key={idx}
                                variant="link"
                                className="p-0"
                                onClick={() => setFieldValue('rating', idx + 1)}
                            >
                              <Star
                                  size={24}
                                  className={idx < values.rating ? 'text-warning' : 'text-muted'}
                                  fill={idx < values.rating ? 'currentColor' : 'none'}
                              />
                            </Button>
                        ))}
                      </div>
                      {touched.rating && errors.rating && (
                          <div className="text-danger">{errors.rating}</div>
                      )}
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Комментарий</Form.Label>
                      <Form.Control
                          as="textarea"
                          rows={4}
                          name="comment"
                          value={values.comment}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.comment && !!errors.comment}
                          className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.comment}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                    <Button
                        variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                        onClick={() => {
                          setShowReviewModal(false);
                          setEditingReview(null);
                        }}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Сохранение...' : editingReview ? 'Сохранить' : 'Отправить'}
                    </Button>
                  </Modal.Footer>
                </Form>
            )}
          </Formik>
        </Modal>
      </div>
  );
};
