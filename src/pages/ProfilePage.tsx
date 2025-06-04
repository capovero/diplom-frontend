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
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

//
// ======= Типы и интерфейсы =======
//

// Статусы проекта (точно повторяем имена enum-а на сервере)
type Status = 'Pending' | 'Active' | 'Completed' | 'Rejected';

// DTO, который возвращает бэкенд: профиль + список проектов
interface UserProfileResponse {
  id: string;
  userName: string;
  email: string;
  role: string;           // "USER" или "ADMIN"
  projects: ProjectResponseDto[];
}

// DTO проекта (как пришёл с сервера)
interface ProjectResponseDto {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  collectedAmount: number;
  createdAt: string;
  categoryName?: string;
  status: Status;
  mediaFiles: string[];
  averageRating: number | null;
  // (creator не нужен в этой странице)
}

// Локальная модель для отображения карточки
interface Project {
  id: number;
  title: string;
  description: string;
  progress: number;    // (collectedAmount / goalAmount) * 100
  category: string;
  image: string;
  goalAmount: number;
  collectedAmount: number;
  status: Status;
}

// DTO «личных пожертвований»
interface Donation {
  projectTitle: string;
  amount: number;
  date: string;
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

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // true, если мы зашли на «свой» профиль
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfileAndProjects = async () => {
      try {
        let profileData: UserProfileResponse;

        // 1) Загрузка «пользовательской» информации
        if (isOwnProfile) {
          // Для «своего» профиля всегда вызываем /api/users/me (он возвращает AdminProfileDto под капотом)
          const resp = await axios.get<UserProfileResponse>('/api/users/me');
          profileData = resp.data;
        } else {
          // Для чужого: /api/users/{userId}
          const resp = await axios.get<UserProfileResponse>(
              `/api/users/${userId}`
          );
          profileData = resp.data;
        }

        setProfile(profileData);

        // 2) В ответе уже есть profileData.projects (AdminProfileDto или UserProfileDto),
        //    в зависимости от того, кто запрашивал и чей профиль.
        const rawProjects = profileData.projects || [];

        // 3) Преобразуем ProjectResponseDto[] → локальный Project[]
        const processed: Project[] = rawProjects.map((proj) => ({
          id: proj.id,
          title: proj.title,
          description: proj.description,
          progress:
              proj.goalAmount > 0
                  ? (proj.collectedAmount / proj.goalAmount) * 100
                  : 0,
          category: proj.categoryName || 'Без категории',
          image: proj.mediaFiles[0] || '/placeholder-image.jpg',
          goalAmount: proj.goalAmount,
          collectedAmount: proj.collectedAmount,
          status: proj.status,
        }));
        setProjects(processed);

        // 4) Если это «свой» профиль, загружаем ещё «Мои пожертвования»
        if (isOwnProfile) {
          try {
            const donateResp = await axios.get<
                { amount: number; donateAt: string; projectTitle: string }[]
            >('/api/donation/personal-donations');
            setDonations(
                donateResp.data.map((d) => ({
                  projectTitle: d.projectTitle,
                  amount: d.amount,
                  date: d.donateAt,
                }))
            );
          } catch (donError) {
            if (
                axios.isAxiosError(donError) &&
                donError.response?.status === 404
            ) {
              setDonations([]);
            } else {
              console.error('Ошибка загрузки донатов:', donError);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        const msg =
            axios.isAxiosError(err)
                ? err.response?.data?.message || 'Не удалось загрузить данные'
                : 'Неизвестная ошибка';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfileAndProjects().catch((err) => {
        console.error('Unhandled error:', err);
        setError('Произошла непредвиденная ошибка');
        setLoading(false);
      });
    }
  }, [userId, isOwnProfile, authLoading, user]);

  // Обновление своего профиля
  const handleUpdateProfile = async (values: {
    userName: string;
    email: string;
  }) => {
    try {
      const resp = await axios.put<UserProfileResponse>('/api/users', values);
      setProfile((prev) => ({
        ...prev!,
        userName: resp.data.userName,
        email: resp.data.email,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError('Не удалось обновить профиль');
    }
  };

  // Удаление своего проекта
  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Уверены, что хотите удалить проект?')) return;
    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
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
            {/* ====== Карточка профиля / режим редактирования ====== */}
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
                              {profile.role === 'ADMIN' && (
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
                                variant={
                                  theme === 'dark'
                                      ? 'outline-light'
                                      : 'outline-primary'
                                }
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

            {/* ====== Вкладки ====== */}
            {isOwnProfile ? (
                // ─────────── «Свой» профиль ───────────
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
                    {/* ───── Вкладка «Мои проекты» ───── */}
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
                                    onEdit={() =>
                                        navigate(`/edit-project/${project.id}`)
                                    }
                                />
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

                    {/* ───── Вкладка «Мои пожертвования» ───── */}
                    <Tab.Pane eventKey="donations">
                      {donations.length > 0 ? (
                          <Card
                              className={`${
                                  theme === 'dark'
                                      ? 'bg-dark text-light border-secondary'
                                      : ''
                              }`}
                          >
                            <Card.Body>
                              <h5 className="mb-4">Ваши пожертвования</h5>
                              {donations.map((don, idx) => (
                                  <div
                                      key={idx}
                                      className={`p-3 mb-3 rounded ${
                                          theme === 'dark' ? 'bg-secondary-dark' : 'bg-light'
                                      }`}
                                  >
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <h6 className="mb-1">{don.projectTitle}</h6>
                                        <div
                                            className={
                                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                                            }
                                        >
                                          {new Date(don.date).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <Badge bg="success" className="fs-6">
                                        ${don.amount}
                                      </Badge>
                                    </div>
                                  </div>
                              ))}
                            </Card.Body>
                          </Card>
                      ) : (
                          <Card
                              className={`text-center py-5 ${
                                  theme === 'dark'
                                      ? 'bg-dark text-light border-secondary'
                                      : ''
                              }`}
                          >
                            <Card.Body>
                              <p
                                  className={
                                    theme === 'dark'
                                        ? 'text-light-50 mb-3'
                                        : 'text-muted mb-3'
                                  }
                              >
                                Вы ещё не сделали ни одного пожертвования
                              </p>
                              <Button
                                  variant="primary"
                                  onClick={() => navigate('/')}
                              >
                                Изучить проекты
                              </Button>
                            </Card.Body>
                          </Card>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
            ) : (
                // ─────────── «Чужой» профиль ───────────
                <>
                  <h3 className={`mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>
                    {/* Если просматриваем чужого пользователя-админа, он уже попал в ToAdminProfileDto → все его проекты;
                    иначе, ToUserProfileDto вернул только Active } */}
                    {profile.role === 'ADMIN'
                        ? 'Все проекты пользователя'
                        : 'Активные проекты'}
                  </h3>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {projects.map((proj) => (
                        <Col key={proj.id}>
                          <ProjectCard
                              id={proj.id}
                              title={proj.title}
                              description={proj.description}
                              progress={proj.progress}
                              category={proj.category}
                              status={proj.status}
                              image={proj.image}
                              goalAmount={proj.goalAmount}
                              collectedAmount={proj.collectedAmount}
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
