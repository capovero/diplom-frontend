import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Badge, Button, Form } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  status: string;
  creator: {
    id: string;
    name: string;
  };
}

interface Donation {
  id: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  date: string;
}

const profileSchema = Yup.object().shape({
  name: Yup.string()
      .min(2, 'Имя должно состоять не менее чем из 2 символов')
      .required('Имя обязательно'),
  email: Yup.string()
      .email('Неверный адрес электронной почты')
      .required('Почта обязательна'),
});

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockProfile = {
      id: userId || '',
      name: 'John Doe',
      email: 'john@example.com'
    };

    const mockProjects = [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'A modern e-commerce solution',
        image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 75,
        category: 'Web Development',
        status: 'Active',
        creator: {
          id: userId || '',
          name: mockProfile.name
        }
      },
      {
        id: '2',
        title: 'Mobile App',
        description: 'A revolutionary mobile application',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        progress: 30,
        category: 'Mobile Apps',
        status: 'Pending',
        creator: {
          id: userId || '',
          name: mockProfile.name
        }
      }
    ];

    const mockDonations = [
      {
        id: 'd1',
        projectId: '3',
        projectTitle: 'Fitness Tracking App',
        amount: 50,
        date: '2024-03-15T14:30:00Z'
      },
      {
        id: 'd2',
        projectId: '4',
        projectTitle: 'Smart Home Dashboard',
        amount: 100,
        date: '2024-03-10T09:15:00Z'
      }
    ];

    setProfile(mockProfile);
    setProjects(mockProjects.filter(project =>
        isOwnProfile || project.status === 'Active'
    ));
    setDonations(mockDonations);
    setLoading(false);
  }, [userId, isOwnProfile]);

  if (loading) {
    return (
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
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
            <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
              <Card.Body>
                {isEditing ? (
                    <Formik
                        initialValues={{
                          name: profile.name,
                          email: profile.email
                        }}
                        validationSchema={profileSchema}
                        onSubmit={async (values, { setSubmitting }) => {
                          try {
                            // TODO: Replace with actual API call
                            setProfile(prev => prev ? { ...prev, ...values } : null);
                            setIsEditing(false);
                          } catch (error) {
                            console.error('Не удалось обновить профиль:', error);
                          } finally {
                            setSubmitting(false);
                          }
                        }}
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
                            <Form.Group className="mb-3">
                              <Form.Label>Имя</Form.Label>
                              <Form.Control
                                  type="text"
                                  name="name"
                                  value={values.name}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.name && !!errors.name}
                                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.name}
                              </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>Почта</Form.Label>
                              <Form.Control
                                  type="email"
                                  name="email"
                                  value={values.email}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.email && !!errors.email}
                                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
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
                        <h2 className="mb-1">{profile.name}</h2>
                        {isOwnProfile && (
                            <p className={`mb-2 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>{profile.email}</p>
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
                    <Tab.Pane eventKey="projects">
                      <Row xs={1} md={2} lg={3} className="g-4">
                        {projects.map(project => (
                            <Col key={project.id}>
                              <ProjectCard {...project} />
                            </Col>
                        ))}
                      </Row>

                      {projects.length === 0 && (
                          <Card className={`text-center py-5 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                            <Card.Body>
                              <p className={theme === 'dark' ? 'text-light-50 mb-3' : 'text-muted mb-3'}>Вы еще не создали ни одного проекта</p>
                              <Button
                                  variant="primary"
                                  onClick={() => navigate('/create-project')}
                              >
                                Создайте свой первый проект
                              </Button>
                            </Card.Body>
                          </Card>
                      )}
                    </Tab.Pane>

                    <Tab.Pane eventKey="donations">
                      {donations.length > 0 ? (
                          <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                            <Card.Body>
                              <h5 className="mb-4">Ваши пожертвования</h5>
                              {donations.map(donation => (
                                  <div key={donation.id} className={`p-3 mb-3 rounded ${theme === 'dark' ? 'bg-secondary-dark' : 'bg-light'}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <h6 className="mb-1">
                                          <Link to={`/project/${donation.projectId}`} className={theme === 'dark' ? 'text-light' : ''}>
                                            {donation.projectTitle}
                                          </Link>
                                        </h6>
                                        <div className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
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
                          <Card className={`text-center py-5 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                            <Card.Body>
                              <p className={theme === 'dark' ? 'text-light-50 mb-3' : 'text-muted mb-3'}>Вы еще не сделали ни одного пожертвования</p>
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
                <>
                  <h3 className={`mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Активные проекты</h3>

                  <Row xs={1} md={2} lg={3} className="g-4">
                    {projects.map(project => (
                        <Col key={project.id}>
                          <ProjectCard {...project} />
                        </Col>
                    ))}
                  </Row>

                  {projects.length === 0 && (
                      <Card className={`text-center py-5 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                        <Card.Body>
                          <p className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Активные проекты не найдены</p>
                        </Card.Body>
                      </Card>
                  )}
                </>
            )}
          </Container>
        </main>
        <Footer />
      </div>
  );
};