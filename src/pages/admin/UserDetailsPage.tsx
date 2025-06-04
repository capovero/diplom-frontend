// src/pages/admin/UserDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usersApi, donationsApi } from '../../services/api';
import type {
  AdminProfileResponse,
  ProjectResponse,
  DonationUser
} from '../../types/index.ts';

interface UserDetails {
  id: string;
  userName: string;
  email: string;
  projects: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
  }>;
  donations: Array<{
    projectTitle: string;
    amount: number;
    donateAt: string;
  }>;
}

export const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);

      try {
        // 1) Получаем профиль (админ видит все проекты)
        const respUser = await usersApi.getById(userId);
        const data: AdminProfileResponse = respUser.data;

        // data.projects: ProjectResponse[]
        const mappedProjects = data.projects.map((p: ProjectResponse) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          createdAt: p.createdAt
        }));

        // 2) Получаем донаты этого пользователя (админ-эндпоинт)
        let mappedDonations: DonationUser[] = [];
        try {
          const respDon = await donationsApi.adminGetForUser(userId);
          mappedDonations = respDon.data;
        } catch (donErr: any) {
          // Если 404 “Нет донатов” — просто оставляем пустой массив.
          if (donErr.response?.status !== 404) {
            console.error('Ошибка загрузки пожертвований:', donErr);
          }
        }

        setUserDetails({
          id: data.id,
          userName: data.userName,
          email: data.email,
          projects: mappedProjects,
          donations: mappedDonations.map(d => ({
            projectTitle: d.projectTitle,
            amount: d.amount,
            donateAt: d.donateAt
          }))
        });
      } catch (err) {
        console.error('Ошибка загрузки данных пользователя:', err);
        setError('Не удалось загрузить информацию о пользователе');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
        <Container className="py-4">
          <div className="text-center">
            <Spinner animation="border" role="status" />
          </div>
        </Container>
    );
  }

  if (error) {
    return (
        <Container className="py-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
    );
  }

  if (!userDetails) {
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
          <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
            Подробности о пользователе
          </h2>
        </div>

        <Row className="g-4">
          {/* — Левый столбец с основной информацией — */}
          <Col lg={4}>
            <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
              <Card.Body>
                <h5 className="card-title mb-4">Основная информация</h5>
                <dl>
                  <dt>ID Пользователя</dt>
                  <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                    {userDetails.id}
                  </dd>

                  <dt>Имя</dt>
                  <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                    {userDetails.userName}
                  </dd>

                  <dt>Почта</dt>
                  <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                    {userDetails.email}
                  </dd>
                </dl>
              </Card.Body>
            </Card>
          </Col>

          {/* — Правый столбец с таблицами — */}
          <Col lg={8}>
            {/* таблица «Проекты» */}
            <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
              <Card.Body>
                <h5 className="card-title mb-4">Проекты пользователя</h5>
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
                  {userDetails.projects.length > 0 ? (
                      userDetails.projects.map(proj => (
                          <tr key={proj.id}>
                            <td>{proj.id}</td>
                            <td>{proj.title}</td>
                            <td>{proj.status}</td>
                            <td>{new Date(proj.createdAt).toLocaleDateString()}</td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan={4} className="text-center">
                          Нет проектов
                        </td>
                      </tr>
                  )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* таблица «Пожертвования» */}
            <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
              <Card.Body>
                <h5 className="card-title mb-4">Пожертвования пользователя</h5>
                <Table responsive className={theme === 'dark' ? 'table-dark' : ''}>
                  <thead>
                  <tr>
                    <th>Проект</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                  </tr>
                  </thead>
                  <tbody>
                  {userDetails.donations.length > 0 ? (
                      userDetails.donations.map((don, idx) => (
                          <tr key={idx}>
                            <td>{don.projectTitle}</td>
                            <td>${don.amount.toLocaleString()}</td>
                            <td>{new Date(don.donateAt).toLocaleDateString()}</td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan={3} className="text-center">
                          Нет пожертвований
                        </td>
                      </tr>
                  )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
  );
};
