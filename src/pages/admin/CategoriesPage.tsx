import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Category {
  id: string;
  name: string;
}

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockCategories: Category[] = [
      { id: '1', name: 'Web Development' },
      { id: '2', name: 'Mobile Apps' },
      { id: '3', name: 'UI/UX Design' },
      { id: '4', name: 'Machine Learning' }
    ];
    setCategories(mockCategories);
  }, []);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setShowEditModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      // TODO: Replace with actual API call
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory?.id ? { ...cat, name: editName } : cat
      ));
      setShowEditModal(false);
    } catch (error) {
      console.error('Не удалось обновить категорию:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    try {
      // TODO: Replace with actual API call
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Не удалось удалить категорию:', error);
    }
  };

  const handleCreateSubmit = async () => {
    try {
      // TODO: Replace with actual API call
      const newCategory = {
        id: Date.now().toString(),
        name: editName
      };
      setCategories(prev => [...prev, newCategory]);
      setShowCreateModal(false);
      setEditName('');
    } catch (error) {
      console.error('Не удалось создать категорию:', error);
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
        <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>Категории</h2>
      </div>

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

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>Изменить категорию</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          <input
            type="text"
            className={`form-control ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Название категории"
          />
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Button
            variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
            onClick={() => setShowEditModal(false)}
          >
            Отмена
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Сохранить изменения
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>Подтвердите удаление</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          Вы уверены, что хотите удалить категорию "{selectedCategory?.name}"?
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Button
            variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
            onClick={() => setShowDeleteModal(false)}
          >
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Удалить категорию
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>Создать категорию</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          <input
            type="text"
            className={`form-control ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Название категории"
          />
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Button
            variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
            onClick={() => setShowCreateModal(false)}
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