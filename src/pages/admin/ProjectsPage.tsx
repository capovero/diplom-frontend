import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Modal,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Pagination } from '../../components/Pagination';
import { projectsApi } from '../../services/api';
import type {
  ProjectPaginationResponse,
  ProjectResponse,
} from '../../types/index.ts';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Rejected' | 'Approved';
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectsPerPage = 6;

  // Вычисляет Bootstrap-цвет бейджа для статуса
  const getStatusBadgeVariant = (status: Project['status']) => {
    const variants: Record<Project['status'], string> = {
      Pending: 'warning',
      Approved: 'success',
      Rejected: 'danger',
      Active: 'primary',
      Completed: 'info',
    };
    return variants[status];
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // У админа нет поиска/фильтрации: передаём пустой filter → бэкенд вернёт ВСЕ проекты
        const resp = await projectsApi.getAll(
            {},
            currentPage,
            projectsPerPage
        );
        const paginationData: ProjectPaginationResponse = resp.data;

        const mapped: Project[] = paginationData.data.map((p: ProjectResponse) => {
          const firstImage = p.mediaFiles.length > 0
              ? p.mediaFiles[0]
              : '/placeholder-image.jpg';

          const prog = p.goalAmount > 0
              ? Number(((p.collectedAmount / p.goalAmount) * 100).toFixed(2))
              : 0;

          return {
            id: p.id.toString(),
            title: p.title,
            description: p.description,
            image: firstImage,
            progress: prog,
            category: p.categoryName || 'Без категории',
            status: p.status as Project['status'],
            creator: {
              id: p.creator.id,
              name: p.creator.userName,
            },
            createdAt: p.createdAt,
          };
        });

        setProjects(mapped);
        setTotalPages(
            Math.ceil(paginationData.totalRecords / projectsPerPage)
        );
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
        setError('Не удалось загрузить проекты');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage]);

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    try {
      // DELETE /api/admin/projects/{selectedProjectId}
      await projectsApi.delete(Number(selectedProjectId));
      setProjects(prev => prev.filter(p => p.id !== selectedProjectId));
      setShowDeleteModal(false);
      setSelectedProjectId(null);
    } catch (err) {
      console.error('Ошибка при удалении проекта:', err);
      setError('Не удалось удалить проект');
      setShowDeleteModal(false);
      setSelectedProjectId(null);
    }
  };

  return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                className="me-3"
                onClick={() => navigate('/admin')}
            >
              <ArrowLeft size={20} />
            </Button>
            <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
              Управление проектами
            </h2>
          </div>
        </div>

        {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
            </div>
        ) : error ? (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
        ) : (
            <>
              <Row xs={1} md={2} lg={3} className="g-4">
                {projects.map((project) => (
                    <Col key={project.id}>
                      <Card
                          className={`h-100 ${
                              theme === 'dark'
                                  ? 'bg-dark text-light border-secondary'
                                  : ''
                          }`}
                      >
                        <Card.Img
                            variant="top"
                            src={project.image}
                            style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title>{project.title}</Card.Title>
                            <Badge bg={getStatusBadgeVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <Card.Text
                              className={theme === 'dark' ? 'text-light-50' : 'text-muted'}
                          >
                            ID: {project.id}
                          </Card.Text>
                          <Card.Text
                              className={theme === 'dark' ? 'text-light-50' : 'text-muted'}
                          >
                            Создатель: {project.creator.name}
                          </Card.Text>
                          <div className="d-flex gap-2 mt-3">
                            <Button
                                variant="primary"
                                onClick={() =>
                                    navigate(`/admin/projects/${project.id}`)
                                }
                            >
                              Смотреть детали
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                  setSelectedProjectId(project.id);
                                  setShowDeleteModal(true);
                                }}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                ))}
              </Row>

              {projects.length === 0 && (
                  <div className="text-center py-5">
                    <p className={theme === 'dark' ? 'text-light' : ''}>
                      Проекты не найдены
                    </p>
                  </div>
              )}

              {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          window.scrollTo(0, 0);
                        }}
                    />
                  </div>
              )}
            </>
        )}

        <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
        >
          <Modal.Header
              closeButton
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
          >
            <Modal.Title>Подтвердите удаление</Modal.Title>
          </Modal.Header>
          <Modal.Body
              className={theme === 'dark' ? 'bg-dark text-light' : ''}
          >
            Вы уверены, что хотите удалить этот проект?
          </Modal.Body>
          <Modal.Footer
              className={theme === 'dark' ? 'bg-dark border-secondary' : ''}
          >
            <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                onClick={() => setShowDeleteModal(false)}
            >
              Отмена
            </Button>
            <Button variant="danger" onClick={handleDeleteProject}>
              Удалить проект
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};
