// src/pages/ProfilePage.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Badge,
  Button,
  Form,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useParams,  useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

// ======= Типы и интерфейсы =======

// “Статус” проекта
type Status = 'Pending' | 'Active' | 'Completed' | 'Rejected';

// Данные пользователя
interface UserProfile {
  id: string;
  userName: string;
  email: string;
  role: string; // “USER” или “ADMIN”
}

// Фронтенд-модель, получаемая из /api/projects/my или /api/projects?userId=
interface ApiProject {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  collectedAmount: number;
  createdAt: string;       // ISO-строка
  categoryName?: string;
  status: Status;
  mediaFiles: string[];    // массив URL/путей
  averageRating: number | null;
}

// Для удобства вычисляем дополнительные поля
interface Project extends ApiProject {
  progress: number;        // процент сбора
  category: string;
  image: string;
}

// DTO «Моих пожертвований»: бэкенд возвращает DonationUserDto:
// { Amount, DonateAt, ProjectTitle }
interface Donation {
  projectTitle: string;
  amount: number;
  date: string;    // сюда попадёт поле donateAt бэкенда
}

// Валидатор для редактирования профиля
const profileSchema = Yup.object().shape({
  userName: Yup.string()
      .min(2, 'Имя должно быть не менее 2 символов')
      .required('Имя обязательно'),
  email: Yup.string()
      .email('Неверный адрес электронной почты')
      .required('Почта обязательна'),
});

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Является ли текущий просмотр – своей страницей
  const isOwnProfile = user?.id === userId;

  // Загрузка профиля, проектов и донатов
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1) Загрузка профиля
        const profileResponse = isOwnProfile
            ? await axios.get<UserProfile>('/api/users/me')
            : await axios.get<UserProfile>(`/api/users/${userId}`);
        setProfile(profileResponse.data);

        // 2) Загрузка проектов пользователя
        const projectsResponse = isOwnProfile
            ? await axios.get<ApiProject[]>('/api/projects/my')
            : await axios.get<ApiProject[]>(`/api/projects?userId=${userId}`);
        const processedProjects = projectsResponse.data.map((project) => ({
          ...project,
          progress: (project.collectedAmount / project.goalAmount) * 100,
          category: project.categoryName || 'Без категории',
          image: project.mediaFiles[0] || '/placeholder-image.jpg',
        }));
        setProjects(processedProjects);

        // 3) Загрузка личных пожертвований (только если свой профиль)
        if (isOwnProfile) {
          try {
            // DTO с бэкенда: { amount, donateAt, projectTitle }
            const donationsResponse = await axios.get<{
              amount: number;
              donateAt: string;
              projectTitle: string;
            }[]>('/api/donation/personal-donations');

            setDonations(
                donationsResponse.data.map((d) => ({
                  projectTitle: d.projectTitle,
                  amount: d.amount,
                  date: d.donateAt, // именно это поле
                }))
            );
          } catch (donationError) {
            if (
                axios.isAxiosError(donationError) &&
                donationError.response?.status === 404
            ) {
              setDonations([]);
            } else {
              console.error('Ошибка загрузки донатов:', donationError);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError(
            axios.isAxiosError(err)
                ? err.response?.data?.message || 'Не удалось загрузить данные'
                : 'Неизвестная ошибка'
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile().catch((error) => {
        console.error('Unhandled error:', error);
        setError('Произошла непредвиденная ошибка');
        setLoading(false);
      });
    }
  }, [userId, isOwnProfile, authLoading]);

  // Обработчик редактирования своего профиля
  const handleUpdateProfile = async (values: {
    userName: string;
    email: string;
  }) => {
    try {
      const response = await axios.put<UserProfile>('/api/users', values);
      setProfile((prev) => ({
        ...prev!,
        ...response.data,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError('Не удалось обновить профиль');
    }
  };

  // Обработчик удаления своего проекта
  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Уверены, что хотите удалить проект?')) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${projectId}`);
      // Убираем проект из списка
      setProjects((prev) =>
          prev.filter((proj) => proj.id !== projectId)
      );
    } catch (err) {
      console.error('Ошибка при удалении проекта:', err);
      setError('Не удалось удалить проект');
    }
  };

  if (authLoading || loading) {
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

  if (!profile) {
    return (
        <Container className="py-5">
          <div className="text-center">Пользователь не найден</div>
        </Container>
    );
  }

  return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <Container className="py-5">
            {/* ====== Карточка профиля / редактирование ====== */}
            <Card
                className={`mb-4 ${
                    theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                }`}
            >
              <Card.Body>
                {isEditing ? (
                    <Formik
                        initialValues={{
                          userName: profile.userName,
                          email: profile.email,
                        }}
                        validationSchema={profileSchema}
                        onSubmit={handleUpdateProfile}
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
                            <Form.Group className="mb-3">
                              <Form.Label>Имя пользователя</Form.Label>
                              <Form.Control
                                  type="text"
                                  name="userName"
                                  value={values.userName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.userName && !!errors.userName}
                                  className={
                                    theme === 'dark'
                                        ? 'bg-dark text-light border-secondary'
                                        : ''
                                  }
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.userName}
                              </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                  type="email"
                                  name="email"
                                  value={values.email}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.email && !!errors.email}
                                  className={
                                    theme === 'dark'
                                        ? 'bg-dark text-light border-secondary'
                                        : ''
                                  }
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.email}
                              </Form.Control.Feedback>
                            </Form.Group>

                            <div className="d-flex gap-2">
                              <Button
                                  variant="secondary"
                                  onClick={() => setIsEditing(false)}
                                  disabled={isSubmitting}
                              >
                                Отмена
                              </Button>
                              <Button
                                  type="submit"
                                  variant="primary"
                                  disabled={isSubmitting}
                              >
                                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                              </Button>
                            </div>
                          </Form>
                      )}
                    </Formik>
                ) : (
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h2 className="mb-1">{profile.userName}</h2>
                        {isOwnProfile && (
                            <>
                              <p
                                  className={`mb-2 ${
                                      theme === 'dark' ? 'text-light-50' : 'text-muted'
                                  }`}
                              >
                                {profile.email}
                              </p>
                              {profile.role === 'Admin' && (
                                  <Badge bg="warning" className="text-dark">
                                    Администратор
                                  </Badge>
                              )}
                            </>
                        )}
                      </div>
                      {isOwnProfile && (
                          <div>
                            <Button
                                variant="primary"
                                className="me-2"
                                onClick={() => navigate('/create-project')}
                            >
                              Создать проект
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                                onClick={() => setIsEditing(true)}
                            >
                              Изменить профиль
                            </Button>
                          </div>
                      )}
                    </div>
                )}
              </Card.Body>
            </Card>

            {/* ====== Вкладки: “Мои проекты” и “Мои пожертвования” ====== */}
            {isOwnProfile ? (
                <Tab.Container id="profile-tabs" defaultActiveKey="projects">
                  <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                      <Nav.Link
                          eventKey="projects"
                          className={theme === 'dark' ? 'text-light' : ''}
                      >
                        Мои проекты
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                          eventKey="donations"
                          className={theme === 'dark' ? 'text-light' : ''}
                      >
                        Мои пожертвования
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {/* ====== Вкладка «Мои проекты» ====== */}
                    <Tab.Pane eventKey="projects">
                      <Row xs={1} md={2} lg={3} className="g-4">
                        {projects.map((project) => (
                            <Col key={project.id}>
                              <div className="position-relative">
                                <ProjectCard
                                    id={project.id}
                                    title={project.title}
                                    description={project.description}
                                    progress={project.progress}
                                    category={project.category}
                                    status={project.status}
                                    image={project.image}
                                    goalAmount={project.goalAmount}
                                    collectedAmount={project.collectedAmount}
                                    // Редактировать (для админа) — оставляем, если нужно
                                    onEdit={
                                      profile.role === 'Admin'
                                          ? () => navigate(`/edit-project/${project.id}`)
                                          : undefined
                                    }
                                />

                                {/* ====== Кнопка «Удалить» (только на своём профиле) ====== */}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    style={{
                                      position: 'absolute',
                                      top: '8px',
                                      right: '8px',
                                      zIndex: 10,
                                    }}
                                    onClick={() => handleDeleteProject(project.id)}
                                >
                                  Удалить
                                </Button>
                              </div>
                            </Col>
                        ))}
                      </Row>
                    </Tab.Pane>

                    {/* ====== Вкладка «Мои пожертвования» ====== */}
                    <Tab.Pane eventKey="donations">
                      {donations.length > 0 ? (
                          <Card
                              className={`${
                                  theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                              }`}
                          >
                            <Card.Body>
                              <h5 className="mb-4">Ваши пожертвования</h5>
                              {donations.map((donation, idx) => (
                                  <div
                                      key={idx}
                                      className={`p-3 mb-3 rounded ${
                                          theme === 'dark' ? 'bg-secondary-dark' : 'bg-light'
                                      }`}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <h6 className="mb-1">{donation.projectTitle}</h6>
                                        <div
                                            className={
                                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                                            }
                                        >
                                          {new Date(donation.date).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <Badge bg="success" className="fs-6">
                                        ${donation.amount}
                                      </Badge>
                                    </div>
                                  </div>
                              ))}
                            </Card.Body>
                          </Card>
                      ) : (
                          <Card
                              className={`text-center py-5 ${
                                  theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                              }`}
                          >
                            <Card.Body>
                              <p
                                  className={
                                    theme === 'dark' ? 'text-light-50 mb-3' : 'text-muted mb-3'
                                  }
                              >
                                Вы ещё не сделали ни одного пожертвования
                              </p>
                              <Button variant="primary" onClick={() => navigate('/')}>
                                Изучить проекты
                              </Button>
                            </Card.Body>
                          </Card>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
            ) : (
                /* Если смотришь чужой профиль, просто список их проектов */
                <>
                  <h3 className={`mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>
                    {profile.role === 'Admin'
                        ? 'Все проекты пользователя'
                        : 'Активные проекты'}
                  </h3>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {projects
                        .filter((project) =>
                            profile.role === 'Admin' || project.status === 'Active'
                        )
                        .map((project) => (
                            <Col key={project.id}>
                              <ProjectCard
                                  id={project.id}
                                  title={project.title}
                                  description={project.description}
                                  progress={project.progress}
                                  category={project.category}
                                  status={project.status}
                                  image={project.image}
                                  goalAmount={project.goalAmount}
                                  collectedAmount={project.collectedAmount}
                              />
                            </Col>
                        ))}
                  </Row>
                </>
            )}
          </Container>
        </main>

        <Footer />
      </div>
  );
};
