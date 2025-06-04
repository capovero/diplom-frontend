import React, { useState } from 'react';
import { Navbar, Container, Form, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Sun, Moon, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');

  const isAdminRoute = location.pathname.startsWith('/admin');
  // Делать сравнение роли нечувствительным к регистру:
  const isActuallyAdmin =
      user?.role?.toLowerCase() === 'admin' ||
      user?.userName?.toLowerCase() === 'administrator';

  // Обработчик при клике на кнопку поиска или при Enter
  const doSearch = () => {
    const trimmed = searchTerm.trim();
    if (trimmed.length > 0) {
      navigate(`/search?query=${encodeURIComponent(trimmed)}&page=1`);
    } else {
      navigate('/');
    }
  };

  // При нажатии Enter в input
  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  };

  return (
      <Navbar
          bg={theme === 'dark' ? 'dark' : 'white'}
          expand="lg"
          className="header"
      >
        <Container>
          <Navbar.Brand
              as={Link}
              to="/"
              className={theme === 'dark' ? 'text-light' : 'text-dark'}
          >
            <Home className="me-2" />
            ProjectFlow
            {isAdminRoute && (
                <span className="ms-2 text-warning">(Режим администратора)</span>
            )}
          </Navbar.Brand>

          {!isAdminRoute && (
              <Form
                  className="d-flex header__search mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    doSearch();
                  }}
              >
                <Form.Control
                    type="search"
                    placeholder="Поиск проектов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={onKeyDownHandler}
                    className={
                      theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                    }
                />
                <Button
                    variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                    className="ms-2"
                    onClick={doSearch}
                >
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
                    {isActuallyAdmin && (
                        <Button
                            variant={theme === 'dark' ? 'outline-warning' : 'warning'}
                            className="me-2"
                            onClick={() => navigate(isAdminRoute ? '/' : '/admin')}
                        >
                          <Settings size={18} className="me-1" />
                          {isAdminRoute ? 'Выйти из админа' : 'Панель администратора'}
                        </Button>
                    )}

                    {!isAdminRoute && (
                        <>
                          <Button
                              variant={
                                theme === 'dark' ? 'outline-light' : 'outline-primary'
                              }
                              className="me-2"
                              onClick={() => navigate('/create-project')}
                          >
                            Создать проект
                          </Button>
                          <Button
                              variant={
                                theme === 'dark' ? 'outline-light' : 'outline-secondary'
                              }
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
                        onClick={() => logout()}
                    >
                      Выйти
                    </Button>
                  </>
              ) : (
                  <>
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
