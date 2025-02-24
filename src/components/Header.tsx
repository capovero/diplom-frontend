import React, { useState, useCallback } from 'react';
import { Navbar, Container, Form, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { debounce } from '../utils/debounce';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
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
                        onClick={() => navigate('/profile')}
                    >
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