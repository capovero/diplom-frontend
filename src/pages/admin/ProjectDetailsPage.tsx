// src/pages/admin/ProjectDetailsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Modal, Form,
  Tab, Nav, Table, Spinner, Alert
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { projectsApi, donationsApi } from '../../services/api';
import type { ProjectResponse, AdminDonationResponse } from '../../types/index.ts';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed';
  category: string;
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Donation {
  amount: number;
  userName: string;
  donateAt: string;
}

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [project, setProject] = useState<Project | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Project['status']>('Pending');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Маппинг строкового названия статуса в его числовой код, как в enum Status на бэкенде:
  const statusToNumber: Record<Project['status'], number> = {
    Pending:   0,
    Approved:  1,
    Rejected:  2,
    Active:    3,
    Completed: 4
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      // 1) GET /api/projects/{id} — админ видит всё
      try {
        const resp = await projectsApi.getById(Number(id));
        const p: ProjectResponse = resp.data;
        const proc: Project = {
          id: p.id.toString(),
          title: p.title,
          description: p.description,
          images: p.mediaFiles.length > 0
              ? p.mediaFiles
              : ['/placeholder-image.jpg'],
          status: p.status as Project['status'],
          category: p.categoryName || 'Без категории',
          creator: {
            id: p.creator.id,
            name: p.creator.userName,
          },
          createdAt: p.createdAt,
          updatedAt: p.createdAt, // или p.updatedAt, если есть
        };
        setProject(proc);
        setNewStatus(proc.status);
      } catch (err) {
        console.error('Ошибка загрузки деталей проекта:', err);
        setError('Не удалось загрузить детали проекта');
        setLoading(false);
        return;
      }

      // 2) GET /api/donation/admin-get-project-donations?projectId={id}
      try {
        const donResp = await donationsApi.adminGetForProject(Number(id));
        const mapped: Donation[] = donResp.data.map(
            (d: AdminDonationResponse) => ({
              amount: d.amount,
              userName: d.userName,
              donateAt: d.donateAt,
            })
        );
        setDonations(mapped);
      } catch (err) {
        const axiosErr = err as any;
        if (axiosErr.response?.status === 404) {
          setDonations([]); // 404 = «нет донатов»
        } else {
          console.error('Ошибка загрузки пожертвований:', err);
          setDonations([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id) return;
    try {
      // ОТЛАДКА: убедимся, что newStatus есть в statusToNumber
      const numericStatus = statusToNumber[newStatus];
      await projectsApi.updateStatus(
          Number(id),
          { status: numericStatus } // отправляем число, а не строку
      );

      // Локально обновляем статус в UI
      setProject(prev => (prev ? { ...prev, status: newStatus } : null));
      setShowStatusModal(false);
    } catch (err) {
      console.error('Не удалось обновить статус проекта:', err);
      setError('Не удалось обновить статус проекта');
    }
  };

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

  if (!project) {
    return (
        <Container className="py-4">
          <div className="text-center">Проект не найден</div>
        </Container>
    );
  }

  return (
      <Container fluid className="py-4">
        <div className="d-flex align-items-center mb-4">
          <Button
              variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
              className="me-3"
              onClick={() => navigate('/admin/projects')}
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
            Детали проекта
          </h2>
          <Button
              variant="outline-secondary"
              className="ms-auto"
              onClick={() => navigate(`/edit-project/${project.id}`)}
          >
            <Edit size={16} className="me-1" />
            Редактировать проект
          </Button>
        </div>

        <Tab.Container defaultActiveKey="details">
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link
                  eventKey="details"
                  className={theme === 'dark' ? 'text-light' : ''}
              >
                Детали
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                  eventKey="donations"
                  className={theme === 'dark' ? 'text-light' : ''}
              >
                Пожертвования
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* ===== «Детали» вкладка ===== */}
            <Tab.Pane eventKey="details">
              <Row className="g-4">
                <Col lg={8}>
                  <Card
                      className={
                        theme === 'dark'
                            ? 'bg-dark text-light border-secondary'
                            : ''
                      }
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                          <h3 className="mb-2">{project.title}</h3>
                          <p
                              className={
                                theme === 'dark' ? 'text-light-50' : 'text-muted'
                              }
                          >
                            ID: {project.id}
                          </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setShowStatusModal(true)}
                        >
                          Изменить статус
                        </Button>
                      </div>

                      <div className="mb-4">
                        <h5>Описание</h5>
                        <p
                            className={
                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                            }
                        >
                          {project.description}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5>Фотографии</h5>
                        <Row xs={1} md={2} className="g-3">
                          {project.images.map((image, idx) => (
                              <Col key={idx}>
                                <img
                                    src={image}
                                    alt={`Project ${idx + 1}`}
                                    className="img-fluid rounded"
                                />
                              </Col>
                          ))}
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4}>
                  <Card
                      className={`mb-4 ${
                          theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                      }`}
                  >
                    <Card.Body>
                      <h5 className="card-title mb-4">Информация о проекте</h5>
                      <dl>
                        <dt>Статус</dt>
                        <dd
                            className={
                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                            }
                        >
                          {project.status}
                        </dd>

                        <dt>Категория</dt>
                        <dd
                            className={
                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                            }
                        >
                          {project.category}
                        </dd>

                        <dt>Создатель</dt>
                        <dd
                            className={
                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                            }
                        >
                          {project.creator.name}
                        </dd>

                        <dt>Создан</dt>
                        <dd
                            className={
                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                            }
                        >
                          {new Date(project.createdAt).toLocaleDateString()}
                        </dd>

                        <dt>Обновлён</dt>
                        <dd
                            className={
                              theme === 'dark' ? 'text-light-50' : 'text-muted'
                            }
                        >
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </dd>
                      </dl>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* ===== «Пожертвования» вкладка ===== */}
            <Tab.Pane eventKey="donations">
              <Card
                  className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
              >
                <Card.Body>
                  <h5 className="mb-4">Пожертвования по проекту</h5>
                  <Table
                      responsive
                      className={theme === 'dark' ? 'table-dark' : ''}
                  >
                    <thead>
                    <tr>
                      <th>Донор</th>
                      <th>Сумма</th>
                      <th>Дата</th>
                    </tr>
                    </thead>
                    <tbody>
                    {donations.map((don, idx) => (
                        <tr key={idx}>
                          <td>{don.userName}</td>
                          <td>${don.amount.toLocaleString()}</td>
                          <td>
                            {new Date(don.donateAt).toLocaleDateString()}
                          </td>
                        </tr>
                    ))}
                    {donations.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center">
                            Пожертвований не найдено
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* ===== Модалка «Изменить статус» ===== */}
        <Modal
            show={showStatusModal}
            onHide={() => setShowStatusModal(false)}
            centered
        >
          <Modal.Header
              closeButton
              className={
                theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
              }
          >
            <Modal.Title>Изменить статус проекта</Modal.Title>
          </Modal.Header>
          <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <Form.Group>
              <Form.Label>Новый статус</Form.Label>
              <Form.Select
                  value={newStatus}
                  onChange={e =>
                      setNewStatus(e.target.value as Project['status'])
                  }
                  className={
                    theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                  }
              >
                <option value="Pending">В ожидании</option>
                <option value="Approved">Одобрено</option>
                <option value="Rejected">Отклонено</option>
                <option value="Active">Активный</option>
                <option value="Completed">Завершено</option>
              </Form.Select>
            </Form.Group>
            <p
                className={`mt-3 mb-0 ${
                    theme === 'dark' ? 'text-light-50' : 'text-muted'
                }`}
            >
              Вы уверены, что хотите изменить статус?
            </p>
          </Modal.Body>
          <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
            <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                onClick={() => setShowStatusModal(false)}
            >
              Отмена
            </Button>
            <Button variant="primary" onClick={handleStatusUpdate}>
              Обновить статус
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};
