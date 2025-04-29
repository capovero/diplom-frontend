import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const textClass = theme === 'dark' ? 'text-light' : 'text-dark';
  const mutedClass = theme === 'dark' ? 'text-light-50' : 'text-muted';

  return (
    <footer className={`${theme === 'dark' ? 'bg-dark' : 'bg-light'} mt-auto py-4 border-top border-secondary`}>
      <Container>
        <Row className="justify-content-between align-items-center">
          <Col md={4}>
            <h5 className={`mb-3 ${textClass}`}>ProjectHub</h5>
            <p className={`mb-0 ${mutedClass}`}>
              Connecting innovators with supporters to bring great ideas to life.
            </p>
          </Col>
          <Col md={4} className="text-md-center py-3 py-md-0">
            <div className="d-flex gap-3 justify-content-md-center">
              <a href="#" className={mutedClass}>About</a>
              <a href="#" className={mutedClass}>Terms</a>
              <a href="#" className={mutedClass}>Privacy</a>
            </div>
          </Col>
          <Col md={4} className="text-md-end">
            <div className="d-flex gap-3 justify-content-md-end">
              <a href="#" className={mutedClass}>
                <Github size={20} />
              </a>
              <a href="#" className={mutedClass}>
                <Twitter size={20} />
              </a>
              <a href="#" className={mutedClass}>
                <Linkedin size={20} />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};