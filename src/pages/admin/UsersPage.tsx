// src/pages/admin/UsersPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Form,
  Button,
  Modal,
  Spinner,
  Alert,
  Pagination
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usersApi } from '../../services/api';
import type { UserResponse } from '../../types/index.ts';

export const UsersPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usersPerPage = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await usersApi.getAll();
        // Отбрасываем учётку с userName === 'administrator'
        const onlyNonAdmin = resp.data.filter(u => u.userName.toLowerCase() !== 'administrator');
        setUsers(onlyNonAdmin);
        setFilteredUsers(onlyNonAdmin);
        setCurrentPage(1);
      } catch (err) {
        console.error('Не удалось загрузить пользователей:', err);
        setError('Не удалось загрузить пользователей');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
          users.filter(u =>
              u.id.toLowerCase().includes(term) ||
              u.userName.toLowerCase().includes(term) ||
              u.email.toLowerCase().includes(term)
          )
      );
    }
    setCurrentPage(1);
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentSlice = filteredUsers.slice(
      (currentPage - 1) * usersPerPage,
      currentPage * usersPerPage
  );

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      await usersApi.deleteById(selectedUserId);
      setUsers(prev => prev.filter(u => u.id !== selectedUserId));
      setFilteredUsers(prev => prev.filter(u => u.id !== selectedUserId));
      setShowDeleteModal(false);
      setSelectedUserId(null);
    } catch (err) {
      console.error('Не удалось удалить пользователя:', err);
      setError('Не удалось удалить пользователя');
      setShowDeleteModal(false);
      setSelectedUserId(null);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const items: React.ReactNode[] = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
          <Pagination.Item
              key={i}
              active={i === currentPage}
              onClick={() => setCurrentPage(i)}
          >
            {i}
          </Pagination.Item>
      );
    }
    return (
        <Pagination className="mt-3">
          <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
          />
          <Pagination.Prev
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
          />
          {items}
          <Pagination.Next
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
          />
          <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
          />
        </Pagination>
    );
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
              Управление пользователями
            </h2>
          </div>

          <Form className="d-flex" style={{ width: '300px' }}>
            <Form.Control
                type="search"
                placeholder="Поиск по ID, имени или почте"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
            />
            <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                className="ms-2"
            >
              <Search size={20} />
            </Button>
          </Form>
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
              <div className={`rounded ${theme === 'dark' ? 'bg-dark' : 'bg-white'} shadow-sm`}>
                <Table responsive hover className={theme === 'dark' ? 'table-dark' : ''}>
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Почта</th>
                    <th>Действия</th>
                  </tr>
                  </thead>
                  <tbody>
                  {currentSlice.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <Link
                              to={`/admin/users/${user.id}`}
                              className={`text-decoration-none ${
                                  theme === 'dark' ? 'text-light' : 'text-primary'
                              }`}
                          >
                            {user.userName}
                          </Link>
                        </td>
                        <td>{user.email}</td>
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
                  {currentSlice.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-3">
                          Пользователи не найдены
                        </td>
                      </tr>
                  )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className={theme === 'dark' ? 'text-light' : ''}>
                  Показано {currentSlice.length} из {filteredUsers.length} пользователей
                </div>
                {renderPagination()}
              </div>
            </>
        )}

        {/* ===== Модалка «Подтвердите удаление» ===== */}
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
