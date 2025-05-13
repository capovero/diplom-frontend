import React, { useState } from 'react';
import { Container, Table, Form, Button, Modal, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface User {
  id: string;
  name: string;
  email: string;
  projectsCount: number;
  createdAt: string;
}

export const UsersPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const usersPerPage = 20;

  // TODO: Replace with actual API call
  const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    projectsCount: Math.floor(Math.random() * 5),
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }));

  const filteredUsers = mockUsers.filter(user => 
    user.id.includes(searchTerm) || 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      // TODO: Replace with actual API call
      // await axios.delete(`/api/admin/users/${selectedUserId}`);
      console.log('Удаление пользователя:', selectedUserId);
      setShowDeleteModal(false);
      setSelectedUserId(null);
      // Refresh users list
    } catch (error) {
      console.error('Не удалось удалить пользователя:', error);
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
          <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>Управление пользователями</h2>
        </div>
        <Form className="d-flex" style={{ width: '300px' }}>
          <Form.Control
            type="search"
            placeholder="Искать пользователя по id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
          />
          <Button variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} className="ms-2">
            <Search size={20} />
          </Button>
        </Form>
      </div>

      <div className={`rounded ${theme === 'dark' ? 'bg-dark' : 'bg-white'} shadow-sm`}>
        <Table responsive hover className={theme === 'dark' ? 'table-dark' : ''}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Почта</th>
              <th>Проекты</th>
              <th>Joined</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <Link 
                    to={`/admin/users/${user.id}`}
                    className={`text-decoration-none ${theme === 'dark' ? 'text-light' : 'text-primary'}`}
                  >
                    {user.name}
                  </Link>
                </td>
                <td>{user.email}</td>
                <td>{user.projectsCount}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className={theme === 'dark' ? 'text-light' : ''}>
          Showing {Math.min(usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        <Pagination>
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} />
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
            .map((page, index, array) => {
              if (index > 0 && array[index - 1] !== page - 1) {
                return (
                  <React.Fragment key={`ellipsis-${page}`}>
                    <Pagination.Ellipsis />
                    <Pagination.Item
                      active={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  </React.Fragment>
                );
              }
              return (
                <Pagination.Item
                  key={page}
                  active={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}
          
          <Pagination.Next onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>Подтвердите удаление</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          Вы уверены, что хотите удалить этого пользователя?
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Button 
            variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'} 
            onClick={() => setShowDeleteModal(false)}
          >
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Удалить пользователя
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};