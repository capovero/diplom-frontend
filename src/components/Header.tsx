import React, { useState, useCallback } from 'react';
import { Navbar, Container, Form, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { debounce } from '../utils/debounce';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
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
    <Navbar bg="white" expand="lg" className="header">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <Home className="me-2" />
          ProjectHub
        </Navbar.Brand>
        
        <Form className="d-flex header__search mx-auto">
          <Form.Control
            type="search"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button variant="outline-primary" className="ms-2">
            <Search size={20} />
          </Button>
        </Form>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                <Button
                  variant="outline-primary"
                  className="me-2"
                  onClick={() => navigate('/create-project')}
                >
                  Create Project
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </Button>
                <Button
                  variant="link"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline-primary"
                  className="me-2"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
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