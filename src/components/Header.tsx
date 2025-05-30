import React, { useState, useCallback } from 'react';
import { Navbar, Container, Form, Nav, Button, Form as BsForm } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Sun, Moon, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { debounce } from '../utils/debounce';

export const Header: React.FC = () => {
  const { user, logout, mockLogin, mockAdminLogin, isMockUser, isMockAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      // TODO: Implement search logic
      console.log('Searching for:', term);
    }, 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleMockUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      mockLogin();
    } else {
      logout();
    }
  };

  const handleMockAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      mockAdminLogin();
    } else {
      logout();
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Navbar bg={theme === 'dark' ? 'dark' : 'white'} expand="lg" className="header">
      <Container>
        <Navbar.Brand as={Link} to="/" className={theme === 'dark' ? 'text-light' : 'text-dark'}>
          <Home className="me-2" />
          ProjectFlow
          {isAdminRoute && <span className="ms-2 text-warning">(Режим администратора)</span>}
        </Navbar.Brand>
        
        {!isAdminRoute && (
          <Form className="d-flex header__search mx-auto">
            <Form.Control
              type="search"
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={handleSearch}
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
            />
            <Button variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} className="ms-2">
              <Search size={20} />
            </Button>
          </Form>
        )}

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Button
              variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
              className="me-3"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>

            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Button
                    variant={theme === 'dark' ? 'outline-warning' : 'warning'}
                    className="me-2"
                    onClick={() => navigate(isAdminRoute ? '/' : '/admin')}
                  >
                    <Settings size={18} className="me-1" />
                    {isAdminRoute ? 'Выйти из режима администратора' : 'Панель администратора'}
                  </Button>
                )}
                {!isAdminRoute && (
                  <>
                    <Button
                      variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                      className="me-2"
                      onClick={() => navigate('/create-project')}
                    >
                      Создать проект
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                      className="me-2"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <User size={18} className="me-1" />
                      Профиль
                    </Button>
                  </>
                )}
                <Button
                  variant="link"
                  className={theme === 'dark' ? 'text-light' : 'text-dark'}
                  onClick={logout}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <div className="d-flex align-items-center me-3">
                  <BsForm.Check 
                    type="switch"
                    id="mock-user-switch"
                    label="Тест пользователя"
                    checked={isMockUser}
                    onChange={handleMockUserChange}
                    className={theme === 'dark' ? 'text-light me-3' : ''}
                  />
                  <BsForm.Check 
                    type="switch"
                    id="mock-admin-switch"
                    label="Тест администратора"
                    checked={isMockAdmin}
                    onChange={handleMockAdminChange}
                    className={theme === 'dark' ? 'text-light' : ''}
                  />
                </div>
                <Button
                  variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                  className="me-2"
                  onClick={() => navigate('/login')}
                >
                  Войти
                </Button>
                <Button
                  variant={theme === 'dark' ? 'light' : 'primary'}
                  onClick={() => navigate('/register')}
                >
                  Зарегистрироваться
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};