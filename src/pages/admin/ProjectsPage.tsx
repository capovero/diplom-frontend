import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Pagination } from '../../components/Pagination';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const projectsPerPage = 6;

  useEffect(() => {
    // TODO: Replace with actual API call
    // GET /api/admin/projects/search?q=${searchTerm}&status=${statusFilter}&page=${currentPage}
    const mockProjects: Project[] = Array.from({ length: 12 }, (_, i) => ({
      id: `project-${i + 1}`,
      title: `Project ${i + 1}`,
      description: 'Project description...',
      image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      progress: Math.floor(Math.random() * 100),
      category: 'Web Development',
      status: ['Pending', 'Approved', 'Rejected', 'Active', 'Completed'][Math.floor(Math.random() * 5)] as Project['status'],
      creator: {
        id: `user-${i + 1}`,
        name: `User ${i + 1}`
      },
      createdAt: new Date().toISOString()
    }));

    const filteredProjects = mockProjects.filter(project => 
      (project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       project.id.includes(searchTerm) ||
       project.creator.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!statusFilter || project.status === statusFilter)
    );

    setProjects(filteredProjects);
    setTotalPages(Math.ceil(filteredProjects.length / projectsPerPage));
  }, [searchTerm, statusFilter, currentPage]);

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;

    try {
      // TODO: Replace with actual API call
      // await axios.delete(`/api/admin/projects/${selectedProjectId}`);
      console.log('Удаление проекта:', selectedProjectId);
      setProjects(prev => prev.filter(p => p.id !== selectedProjectId));
      setShowDeleteModal(false);
      setSelectedProjectId(null);
    } catch (error) {
      console.error('Ошибка при удалении проекта', error);
    }
  };

  const getStatusBadgeVariant = (status: Project['status']) => {
    const variants = {
      Pending: 'warning',
      Approved: 'success',
      Rejected: 'danger',
      Active: 'primary',
      Completed: 'info'
    };
    return variants[status];
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
          <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>Управление проектами</h2>
        </div>
      </div>

      <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
        <Card.Body>
          <div className="d-flex gap-3 flex-wrap">
            <Form.Group style={{ flex: 2, minWidth: '200px' }}>
              <Form.Control
                type="search"
                placeholder="Поиск проекта"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
              />
            </Form.Group>

            <Form.Group style={{ flex: 1, minWidth: '150px' }}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
              >
                <option value="">Все статусы</option>
                <option value="Pending">Рассматривается</option>
                <option value="Approved">Одобрено</option>
                <option value="Rejected">Отклонено</option>
                <option value="Active">Активно</option>
                <option value="Completed">Завершено</option>
              </Form.Select>
            </Form.Group>

            <Button variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}>
              <Search size={20} />
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} lg={3} className="g-4">
        {projects.map(project => (
          <Col key={project.id}>
            <Card className={`h-100 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
              <Card.Img
                variant="top"
                src={project.image}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title>{project.title}</Card.Title>
                  <Badge bg={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                </div>
                <Card.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                  ID: {project.id}
                </Card.Text>
                <Card.Text className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                  Создатель: {project.creator.name}
                </Card.Text>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
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
          <p className={theme === 'dark' ? 'text-light' : ''}>Проекты не найдены</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>Подтвердите удаление</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          Вы уверены, что хотите удалить этот проект?
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
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