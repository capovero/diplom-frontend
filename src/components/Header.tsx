import React, { useState, useCallback } from 'react';
import { Navbar, Container, Form, Nav, Button, Form as BsForm } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { debounce } from '../utils/debounce';

export const Header: React.FC = () => {
  const { user, logout, mockLogin, isMockUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useCallback(
      debounce((term: string) => {
        // Implement search logic here
        console.log('Searching for:', term);
      }, 300),
      []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleMockLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      mockLogin();
    } else {
      logout();
    }
  };

  return (
      <Navbar bg={theme === 'dark' ? 'dark' : 'white'} expand="lg" className="header">
        <Container>
          <Navbar.Brand as={Link} to="/" className={theme === 'dark' ? 'text-light' : 'text-dark'}>
            <Home className="me-2" />
            ProjectHub
          </Navbar.Brand>

          <Form className="d-flex header__search mx-auto">
            <Form.Control
                type="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearch}
                className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
            />
            <Button variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} className="ms-2">
              <Search size={20} />
            </Button>
          </Form>

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
                    <Button
                        variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                        className="me-2"
                        onClick={() => navigate('/create-project')}
                    >
                      Create Project
                    </Button>
                    <Button
                        variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                        className="me-2"
                        onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      <User size={18} className="me-1" />
                      Profile
                    </Button>
                    <Button
                        variant="link"
                        className={theme === 'dark' ? 'text-light' : 'text-dark'}
                        onClick={logout}
                    >
                      Logout
                    </Button>
                  </>
              ) : (
                  <>
                    <div className="d-flex align-items-center me-3">
                      <BsForm.Check
                          type="switch"
                          id="mock-login-switch"
                          label="Test User"
                          checked={isMockUser}
                          onChange={handleMockLoginChange}
                          className={theme === 'dark' ? 'text-light' : ''}
                      />
                    </div>
                    <Button
                        variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                        className="me-2"
                        onClick={() => navigate('/login')}
                    >
                      Login
                    </Button>
                    <Button
                        variant={theme === 'dark' ? 'light' : 'primary'}
                        onClick={() => navigate('/register')}
                    >
                      Register
                    </Button>
                  </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
};