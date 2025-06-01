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
import { Star, ChevronLeft, ChevronRight, Share2, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { projectsApi, reviewsApi, donationsApi, updatesApi } from '../services/api.ts';
import { DonationModal } from '../components/DonationModal';
import { SocialShareButtons } from '../components/SocialShareButtons';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

interface Project {
  id: number;
  title: string;
  description: string;
  mediaFiles: string[];
  goalAmount: number;
  collectedAmount: number;
  creator: {
    id: string;
    name: string;
  };
  categoryName: string;
  status: string;
  createdAt: string;
  averageRating: number;
}

interface ProjectUpdate {
  id: number;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface Donation {
  id: number;
  amount: number;
  userId: string;
  userName: string;
  createdAt: string;
}

const updateSchema = Yup.object().shape({
  content: Yup.string()
      .min(10, 'Обновление должно содержать не менее 10 символов')
      .required('Требуется обновить текст'),
});

const reviewSchema = Yup.object().shape({
  rating: Yup.number()
      .min(1, 'Рейтинг должен быть не менее 1')
      .max(5, 'Оценка не может быть больше 5')
      .required('Требуется рейтинг'),
  comment: Yup.string()
      .min(10, 'Отзыв должен содержать не менее 10 символов')
      .required('Требуется текст отзыва'),
});

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
  const [donations, setDonations] = useState<Donation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });

  // Загрузка данных проекта
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Загрузка основной информации о проекте
        const projectResponse = await projectsApi.getById(Number(id));
        const projectData = projectResponse.data;

        // Преобразование данных проекта
        const transformedProject: Project = {
          id: projectData.id,
          title: projectData.title,
          description: projectData.description,
          mediaFiles: projectData.mediaFiles,
          goalAmount: projectData.goalAmount,
          collectedAmount: projectData.collectedAmount,
          creator: {
            id: projectData.creator.id,
            name: projectData.creator.name
          },
          categoryName: projectData.categoryName || 'Без категории',
          status: projectData.status,
          createdAt: projectData.createdAt,
          averageRating: projectData.averageRating || 0
        };

        setProject(transformedProject);

        // Загрузка отзывов
        const reviewsResponse = await reviewsApi.getByProject(Number(id));
        setReviews(reviewsResponse.data);

        // Загрузка обновлений
        const updatesResponse = await updatesApi.getByProject(Number(id));
        setUpdates(updatesResponse.data);

        // Загрузка пожертвований (если пользователь админ или создатель)
        if (user?.role === 'ADMIN' || user?.id === projectData.creator.id) {
          const donationsResponse = await donationsApi.adminGetForProject(Number(id));
          setDonations(donationsResponse.data);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных проекта:', err);
        setError('Не удалось загрузить данные проекта');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProjectData();
    }
  }, [id, user]);

  const handleDonate = async (amount: number) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await donationsApi.create(Number(id), amount);

      // Обновляем сумму собранных средств
      setProject(prev => prev ? {
        ...prev,
        collectedAmount: prev.collectedAmount + amount
      } : null);

      // Обновляем список пожертвований
      if (user.role === 'ADMIN' || user.id === project?.creator.id) {
        const donationsResponse = await donationsApi.adminGetForProject(Number(id));
        setDonations(donationsResponse.data);
      }

      setShowDonateModal(false);
    } catch (error) {
      console.error('Пожертвование не удалось:', error);
      setError('Не удалось обработать пожертвование');
    }
  };

  const handleUpdateSubmit = async (values: { content: string }, { resetForm }: any) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      if (editingUpdate) {
        // Редактирование существующего обновления
        await updatesApi.update(editingUpdate.id, {
          content: values.content,
          projectId: Number(id)
        });

        setUpdates(prev => prev.map(update =>
            update.id === editingUpdate.id ? { ...update, content: values.content } : update
        ));
      } else {
        // Создание нового обновления
        const response = await updatesApi.create({
          content: values.content,
          projectId: Number(id)
        });

        const newUpdate: ProjectUpdate = {
          id: response.data.id,
          content: values.content,
          createdAt: new Date().toISOString(),
          createdBy: {
            id: user.id,
            name: user.name || 'Пользователь',
            role: user.role as 'USER' | 'ADMIN'
          }
        };

        setUpdates(prev => [newUpdate, ...prev]);
      }

      setShowUpdateModal(false);
      setEditingUpdate(null);
      resetForm();
    } catch (error) {
      console.error('Не удалось отправить обновление:', error);
      setError('Не удалось сохранить обновление');
    }
  };

  const handleReviewSubmit = async (values: { rating: number; comment: string }, { resetForm }: any) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      if (editingReview) {
        // Редактирование существующего отзыва
        await reviewsApi.update(editingReview.id, {
          rating: values.rating,
          comment: values.comment
        });

        setReviews(prev => prev.map(review =>
            review.id === editingReview.id ? {
              ...review,
              rating: values.rating,
              comment: values.comment
            } : review
        ));
      } else {
        // Создание нового отзыва
        const response = await reviewsApi.create({
          projectId: Number(id),
          rating: values.rating,
          comment: values.comment
        });

        const newReview: Review = {
          id: response.data.id,
          rating: values.rating,
          comment: values.comment,
          userId: user.id,
          userName: user.name || 'Пользователь',
          createdAt: new Date().toISOString()
        };

        setReviews(prev => [newReview, ...prev]);
      }

      // Пересчитываем средний рейтинг
      if (project) {
        const totalRating = reviews.reduce((sum, review) => {
          if (review.id === editingReview?.id) {
            return sum - editingReview.rating + values.rating;
          }
          return sum + review.rating;
        }, 0);

        const totalReviews = editingReview ? reviews.length : reviews.length + 1;
        const newAverageRating = totalRating / totalReviews;

        setProject(prev => prev ? {
          ...prev,
          averageRating: newAverageRating
        } : null);
      }

      setShowReviewModal(false);
      setEditingReview(null);
      resetForm();
    } catch (error) {
      console.error('Не удалось отправить отзыв:', error);
      setError('Не удалось сохранить отзыв');
    }
  };

  const handleDeleteUpdate = async (updateId: number) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      if (window.confirm('Вы уверены, что хотите удалить это обновление?')) {
        await updatesApi.delete(updateId);
        setUpdates(prev => prev.filter(update => update.id !== updateId));
      }
    } catch (error) {
      console.error('Не удалось удалить обновление:', error);
      setError('Не удалось удалить обновление');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        await reviewsApi.delete(reviewId);

        const reviewToDelete = reviews.find(r => r.id === reviewId);
        if (reviewToDelete && project) {
          const newTotalReviews = reviews.length - 1;
          const newAverageRating = newTotalReviews > 0
              ? (project.averageRating * reviews.length - reviewToDelete.rating) / newTotalReviews
              : 0;

          setProject(prev => prev ? {
            ...prev,
            averageRating: newAverageRating
          } : null);
        }

        setReviews(prev => prev.filter(review => review.id !== reviewId));
      }
    } catch (error) {
      console.error('Не удалось удалить отзыв:', error);
      setError('Не удалось удалить отзыв');
    }
  };

  const canManageUpdates = user?.role === 'ADMIN' || project?.creator.id === user?.id;
  const canManageReviews = user?.role === 'ADMIN';
  const hasUserReviewed = reviews.some(review => review.userId === user?.id);
  const isProjectCreator = project?.creator.id === user?.id;

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
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            <div className="mb-4">
              <Button
                  variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                  onClick={() => navigate('/')}
                  className="mb-3"
              >
                <ChevronLeft size={20} className="me-1" />
                Назад к проектам
              </Button>
              <h1 className={theme === 'dark' ? 'text-light' : ''}>{project.title}</h1>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Badge bg="primary">{project.categoryName}</Badge>
                <Badge bg="success">{project.status}</Badge>
                <div className="ms-2 d-flex align-items-center">
                  <Star className="text-warning" size={18} />
                  <span className="ms-1">{project.averageRating.toFixed(1)}</span>
                  <span className="ms-1 text-muted">({totalReviews} reviews)</span>
                </div>
                <div className="ms-2">
                  by <Link to={`/profile/${project.creator.id}`} className={`text-decoration-none ${theme === 'dark' ? 'text-light' : 'text-primary'}`}>
                  {project.creator.name}
                </Link>
                </div>
              </div>
            </div>

            <Row className="g-4">
              <Col lg={8}>
                <Card className={`project-carousel mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                  <Card.Body className="p-0">
                    <Carousel
                        activeIndex={currentImageIndex}
                        onSelect={setCurrentImageIndex}
                        interval={null}
                        indicators={false}
                    >
                      {project.mediaFiles.map((image, index) => (
                          <Carousel.Item key={index}>
                            <div className="project-image-container">
                              <img
                                  src={image}
                                  alt={`Project ${index + 1}`}
                                  className="project-image"
                              />
                            </div>
                          </Carousel.Item>
                      ))}
                    </Carousel>

                    <div className="image-thumbnails px-3 pb-3">
                      {project.mediaFiles.map((image, index) => (
                          <img
                              key={index}
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className={`thumbnail-image ${index === currentImageIndex ? 'active' : ''}`}
                              onClick={() => setCurrentImageIndex(index)}
                          />
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                  <Card.Body>
                    <h4 className="mb-3">О проекте</h4>
                    <p>{project.description}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                  <Card.Body>
                    <h4 className="mb-3">${project.collectedAmount.toLocaleString()}</h4>
                    <p className={`mb-1 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                      собрано из ${project.goalAmount.toLocaleString()}
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

            <Tab.Container defaultActiveKey="reviews">
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="reviews" className={theme === 'dark' ? 'text-light' : ''}>
                    Отзывы
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="updates" className={theme === 'dark' ? 'text-light' : ''}>
                    Обновления
                  </Nav.Link>
                </Nav.Item>
                {(user?.role === 'ADMIN' || isProjectCreator) && (
                    <Nav.Item>
                      <Nav.Link eventKey="donations" className={theme === 'dark' ? 'text-light' : ''}>
                        Пожертвования
                      </Nav.Link>
                    </Nav.Item>
                )}
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="reviews">
                  <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h5 className="mb-2">Отзывы проекта</h5>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                      key={index}
                                      size={20}
                                      className={index < Math.round(project.averageRating) ? 'text-warning' : 'text-muted'}
                                      fill={index < Math.round(project.averageRating) ? 'currentColor' : 'none'}
                                  />
                              ))}
                            </div>
                            <span className="fs-5 fw-bold me-2">{project.averageRating.toFixed(1)}</span>
                            <span className="text-muted">({totalReviews} отзывов)</span>
                          </div>
                        </div>
                        {user && !hasUserReviewed && !isProjectCreator && (
                            <Button
                                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                                onClick={() => {
                                  setEditingReview(null);
                                  setShowReviewModal(true);
                                }}
                            >
                              Написать отзыв
                            </Button>
                        )}
                      </div>

                      {reviews.map(review => (
                          <Card
                              key={review.id}
                              className={`mb-3 ${theme === 'dark' ? 'bg-secondary-dark border-secondary' : 'bg-light'}`}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between mb-2">
                                <div>
                                  <div className="d-flex align-items-center mb-1">
                                    <div className="me-2">
                                      {Array.from({ length: 5 }).map((_, index) => (
                                          <Star
                                              key={index}
                                              size={16}
                                              className={index < review.rating ? 'text-warning' : 'text-muted'}
                                              fill={index < review.rating ? 'currentColor' : 'none'}
                                          />
                                      ))}
                                    </div>
                                    <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                      от <Link to={`/profile/${review.userId}`} className={theme === 'dark' ? 'text-light' : 'text-primary'}>
                                      {review.userName}
                                    </Link>
                                    </small>
                                  </div>
                                </div>
                                {(canManageReviews || review.userId === user?.id) && (
                                    <div>
                                      {review.userId === user?.id && (
                                          <Button
                                              variant="link"
                                              className="p-0 me-3"
                                              onClick={() => {
                                                setEditingReview(review);
                                                setShowReviewModal(true);
                                              }}
                                          >
                                            <Edit size={16} />
                                          </Button>
                                      )}
                                      <Button
                                          variant="link"
                                          className="p-0 text-danger"
                                          onClick={() => handleDeleteReview(review.id)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                )}
                              </div>
                              <p className="mb-0">{review.comment}</p>
                            </Card.Body>
                          </Card>
                      ))}

                      {reviews.length === 0 && (
                          <p className={`text-center ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                            Отзывов пока нет
                          </p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                <Tab.Pane eventKey="updates">
                  <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0">Обновления проекта</h5>
                        {canManageUpdates && (
                            <Button
                                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                                onClick={() => {
                                  setEditingUpdate(null);
                                  setShowUpdateModal(true);
                                }}
                            >
                              Добавить обновление
                            </Button>
                        )}
                      </div>

                      {updates.map(update => (
                          <Card
                              key={update.id}
                              className={`mb-3 ${theme === 'dark' ? 'bg-secondary-dark border-secondary' : 'bg-light'}`}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between mb-2">
                                <div>
                                  <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                    {new Date(update.createdAt).toLocaleDateString()} от{' '}
                                    <Link to={`/profile/${update.createdBy.id}`} className={theme === 'dark' ? 'text-light' : 'text-primary'}>
                                      {update.createdBy.name}
                                    </Link>
                                    {update.createdBy.role === 'ADMIN' && (
                                        <Badge bg="warning" className="ms-2">Admin</Badge>
                                    )}
                                  </small>
                                </div>
                                {(user?.role === 'ADMIN' || (isProjectCreator && update.createdBy.id === user?.id)) && (
                                    <div>
                                      <Button
                                          variant="link"
                                          className="p-0 me-3"
                                          onClick={() => {
                                            setEditingUpdate(update);
                                            setShowUpdateModal(true);
                                          }}
                                      >
                                        <Edit size={16} />
                                      </Button>
                                      <Button
                                          variant="link"
                                          className="p-0 text-danger"
                                          onClick={() => handleDeleteUpdate(update.id)}
                                      >
                                        <Trash2 size={16} />
                                      </Button>
                                    </div>
                                )}
                              </div>
                              <p className="mb-0">{update.content}</p>
                            </Card.Body>
                          </Card>
                      ))}

                      {updates.length === 0 && (
                          <p className={`text-center ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                            Обновлений пока нет
                          </p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {(user?.role === 'ADMIN' || isProjectCreator) && (
                    <Tab.Pane eventKey="donations">
                      <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                        <Card.Body>
                          <h5 className="mb-4">Пожертвования проекта</h5>
                          <Table responsive className={theme === 'dark' ? 'table-dark' : ''}>
                            <thead>
                            <tr>
                              <th>Донатер</th>
                              <th>Сумма</th>
                              <th>Дата</th>
                            </tr>
                            </thead>
                            <tbody>
                            {donations.map(donation => (
                                <tr key={donation.id}>
                                  <td>
                                    <Link to={`/profile/${donation.userId}`} className={theme === 'dark' ? 'text-light' : 'text-primary'}>
                                      {donation.userName}
                                    </Link>
                                  </td>
                                  <td>${donation.amount}</td>
                                  <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {donations.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="text-center">Пожертвования не найдены</td>
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

        <DonationModal
            show={showDonateModal}
            onHide={() => setShowDonateModal(false)}
            projectTitle={project.title}
            onDonate={handleDonate}
        />

        <Modal
            show={showUpdateModal}
            onHide={() => {
              setShowUpdateModal(false);
              setEditingUpdate(null);
            }}
            centered
        >
          <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
            <Modal.Title>{editingUpdate ? 'Редактировать обновление' : 'Добавить обновление'}</Modal.Title>
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
                isSubmitting
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

        <Modal
            show={showReviewModal}
            onHide={() => {
              setShowReviewModal(false);
              setEditingReview(null);
            }}
            centered
        >
          <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
            <Modal.Title>{editingReview ? 'Изменить отзыв' : 'Написать отзыв'}</Modal.Title>
          </Modal.Header>
          <Formik
              initialValues={{
                rating: editingReview?.rating || 5,
                comment: editingReview?.comment || ''
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
                isSubmitting
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                    <Form.Group className="mb-3">
                      <Form.Label>Рейтинг</Form.Label>
                      <div className="d-flex gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Button
                                key={index}
                                variant="link"
                                className="p-0"
                                onClick={() => setFieldValue('rating', index + 1)}
                            >
                              <Star
                                  size={24}
                                  className={index < values.rating ? 'text-warning' : 'text-muted'}
                                  fill={index < values.rating ? 'currentColor' : 'none'}
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