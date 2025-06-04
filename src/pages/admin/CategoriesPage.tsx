// src/pages/admin/CategoriesPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  ListGroup,
  Button,
  Modal,
  Spinner,
  Alert,
  Form,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { categoriesApi } from '../../services/api';
import type { CategoryDto } from '../../types/index.ts';

interface Category {
  id: string;
  name: string;
}

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояния для модалок
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  // При монтировании: загрузить все категории
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await categoriesApi.getAll();
        const mapped: Category[] = resp.data.map(c => ({
          id: c.id.toString(),
          name: c.name,
        }));
        setCategories(mapped);
      } catch (err) {
        console.error('Не удалось загрузить категории:', err);
        setError('Не удалось загрузить категории');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Открыть «Изменить»
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setShowEditModal(true);
  };

  // Открыть «Удалить»
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  // Подтвердить редактирование
  const handleEditSubmit = async () => {
    if (!selectedCategory) return;
    setError(null);

    if (!editName.trim()) {
      setError('Название не может быть пустым');
      return;
    }

    try {
      const idNum = Number(selectedCategory.id);
      const resp = await categoriesApi.update(idNum, editName.trim());
      const updated: Category = {
        id: resp.data.id.toString(),
        name: resp.data.name,
      };
      setCategories(prev =>
          prev.map(cat =>
              cat.id === updated.id ? { ...cat, name: updated.name } : cat
          )
      );
      setShowEditModal(false);
      setSelectedCategory(null);
      setEditName('');
    } catch (err: any) {
      console.error('Не удалось обновить категорию:', err);
      if (err.response?.status === 400 && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Не удалось обновить категорию');
      }
    }
  };

  // Подтвердить удаление
  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setError(null);

    try {
      const idNum = Number(selectedCategory.id);
      await categoriesApi.delete(idNum);
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      console.error('Не удалось удалить категорию:', err);
      if (err.response?.status === 400 && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Не удалось удалить категорию');
      }
      setShowDeleteModal(false);
      setSelectedCategory(null);
    }
  };

  // Подтвердить создание
  const handleCreateSubmit = async () => {
    setError(null);
    if (!editName.trim()) {
      setError('Название не может быть пустым');
      return;
    }
    try {
      const resp = await categoriesApi.create(editName.trim());
      const newCat: Category = {
        id: resp.data.id.toString(),
        name: resp.data.name,
      };
      setCategories(prev => [...prev, newCat]);
      setShowCreateModal(false);
      setEditName('');
    } catch (err: any) {
      console.error('Не удалось создать категорию:', err);
      if (err.response?.status === 400 && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Не удалось создать категорию');
      }
    }
  };

  return (
      <Container fluid className="py-4">
        <div className="d-flex align-items-center mb-4">
          <Button
              variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
              className="me-3"
              onClick={() => navigate('/admin')}
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
            Категории
          </h2>
        </div>

        {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
            </div>
        ) : (
            <>
              {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
              )}

              <ListGroup className="mb-4">
                {categories.map(category => (
                    <ListGroup.Item
                        key={category.id}
                        className={`d-flex justify-content-between align-items-center ${
                            theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                        }`}
                    >
                      <span>{category.name}</span>
                      <div>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(category)}
                        >
                          Изменить
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(category)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </ListGroup.Item>
                ))}
                {categories.length === 0 && (
                    <ListGroup.Item className="text-center py-3">
                      Категорий не найдено
                    </ListGroup.Item>
                )}
              </ListGroup>

              <Button
                  variant="primary"
                  onClick={() => {
                    setEditName('');
                    setShowCreateModal(true);
                  }}
              >
                <Plus size={20} className="me-2" />
                Создать категорию
              </Button>
            </>
        )}

        {/* ===== Модалка «Изменить категорию» ===== */}
        <Modal
            show={showEditModal}
            onHide={() => {
              setShowEditModal(false);
              setSelectedCategory(null);
              setEditName('');
            }}
            centered
        >
          <Modal.Header
              closeButton
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
          >
            <Modal.Title>Изменить категорию</Modal.Title>
          </Modal.Header>
          <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <Form.Control
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Название категории"
                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
            />
          </Modal.Body>
          <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
            <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategory(null);
                  setEditName('');
                }}
            >
              Отмена
            </Button>
            <Button variant="primary" onClick={handleEditSubmit}>
              Сохранить изменения
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ===== Модалка «Подтвердите удаление» ===== */}
        <Modal
            show={showDeleteModal}
            onHide={() => {
              setShowDeleteModal(false);
              setSelectedCategory(null);
            }}
            centered
        >
          <Modal.Header
              closeButton
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
          >
            <Modal.Title>Подтвердите удаление</Modal.Title>
          </Modal.Header>
          <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            Вы уверены, что хотите удалить категорию «{selectedCategory?.name}»?
          </Modal.Body>
          <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
            <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
            >
              Отмена
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Удалить категорию
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ===== Модалка «Создать категорию» ===== */}
        <Modal
            show={showCreateModal}
            onHide={() => {
              setShowCreateModal(false);
              setEditName('');
            }}
            centered
        >
          <Modal.Header
              closeButton
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
          >
            <Modal.Title>Создать категорию</Modal.Title>
          </Modal.Header>
          <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <Form.Control
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Название категории"
                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
            />
          </Modal.Body>
          <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
            <Button
                variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                onClick={() => {
                  setShowCreateModal(false);
                  setEditName('');
                }}
            >
              Отмена
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              Создать категорию
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};
