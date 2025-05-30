import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Users, Package2, LayoutGrid } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const menuItems = [
    {
      title: 'Управление пользователями',
      description: 'Управление пользователями, просмотр информации и выполнение операций, связанных с пользователями',
      icon: Users,
      path: '/admin/users',
      color: 'primary'
    },
    {
      title: 'Управление проектами',
      description: 'Анализ, утверждение и управление всеми проектами',
      icon: Package2,
      path: '/admin/projects',
      color: 'success'
    },
    {
      title: 'Категории',
      description: 'Управление категориями и классификациями проектов',
      icon: LayoutGrid,
      path: '/admin/categories',
      color: 'warning'
    }
  ];

  return (
    <Container fluid className="py-4">
      <h2 className={`mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Панель администратора</h2>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {menuItems.map((item, index) => (
          <Col key={index}>
            <Card 
              className={`h-100 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(item.path)}
            >
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <div className={`rounded-circle p-2 bg-${item.color} bg-opacity-10 me-3`}>
                    <item.icon size={24} className={`text-${item.color}`} />
                  </div>
                  <h5 className="card-title mb-0">{item.title}</h5>
                </div>
                <p className={`card-text ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                  {item.description}
                </p>
                <Button 
                  variant={`outline-${item.color}`}
                  className="mt-auto align-self-start"
                  onClick={() => navigate(item.path)}
                >
                  Управление
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};