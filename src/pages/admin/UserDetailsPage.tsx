import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  projects: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  donations: Array<{
    id: string;
    amount: number;
    projectTitle: string;
    createdAt: string;
  }>;
}

export const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // GET /api/admin/users/${userId}
    const mockUser: UserDetails = {
      id: userId || '',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      projects: [
        {
          id: 'project-1',
          title: 'Project 1',
          status: 'Active',
          createdAt: '2024-02-01T00:00:00Z'
        },
        {
          id: 'project-2',
          title: 'Project 2',
          status: 'Completed',
          createdAt: '2024-02-15T00:00:00Z'
        }
      ],
      donations: [
        {
          id: 'donation-1',
          amount: 100,
          projectTitle: 'Project 3',
          createdAt: '2024-02-10T00:00:00Z'
        },
        {
          id: 'donation-2',
          amount: 50,
          projectTitle: 'Project 4',
          createdAt: '2024-02-20T00:00:00Z'
        }
      ]
    };

    setUser(mockUser);
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-4">
        <div className="text-center">Пользователь не найден</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button
          variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
          className="me-3"
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>Подробности о пользователе</h2>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
            <Card.Body>
              <h5 className="card-title mb-4">Основная информация</h5>
              <dl>
                <dt>ID Пользователя</dt>
                <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>{user.id}</dd>
                
                <dt>Имя</dt>
                <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>{user.name}</dd>
                
                <dt>Почта</dt>
                <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>{user.email}</dd>
                
                <dt>Joined</dt> //убрать
                <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
            <Card.Body>
              <h5 className="card-title mb-4">Проекты</h5>
              <Table responsive className={theme === 'dark' ? 'table-dark' : ''}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Статус</th>
                    <th>Создан</th>
                  </tr>
                </thead>
                <tbody>
                  {user.projects.map(project => (
                    <tr key={project.id}>
                      <td>{project.id}</td>
                      <td>{project.title}</td>
                      <td>{project.status}</td>
                      <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
            <Card.Body>
              <h5 className="card-title mb-4">Пожертвования</h5>
              <Table responsive className={theme === 'dark' ? 'table-dark' : ''}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.donations.map(donation => (
                    <tr key={donation.id}>
                      <td>{donation.id}</td>
                      <td>{donation.projectTitle}</td>
                      <td>${donation.amount}</td>
                      <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};