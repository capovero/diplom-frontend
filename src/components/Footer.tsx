import React from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const textClass = theme === 'dark' ? 'text-light' : 'text-dark';
  const mutedClass = theme === 'dark' ? 'text-light-50' : 'text-muted';
  const [showModal, setShowModal] = useState<'about' | 'terms' | 'privacy' | null>(null);

  const modalContent = {
    about: {
      title: 'About ProjectHub',
      content: (
        <>
          <h5>Our Mission</h5>
          <p>
            ProjectHub is a crowdfunding platform dedicated to connecting innovative creators with passionate supporters. 
            We believe in the power of community-driven funding to bring groundbreaking ideas to life.
          </p>
          
          <h5>What We Do</h5>
          <p>
            We provide a secure and transparent platform where creators can showcase their projects and receive funding 
            from supporters worldwide. Our platform supports various project categories, from technology and arts to 
            social initiatives and environmental causes.
          </p>
          
          <h5>Our Values</h5>
          <ul>
            <li>Transparency in all transactions and project updates</li>
            <li>Support for innovative and impactful projects</li>
            <li>Building strong communities around shared interests</li>
            <li>Protecting both creators and supporters</li>
          </ul>
        </>
      )
    },
    terms: {
      title: 'Terms of Service',
      content: (
        <>
          <h5>1. User Agreement</h5>
          <p>
            By using ProjectHub, you agree to these terms and conditions. Users must be at least 18 years old 
            to create an account or make contributions.
          </p>
          
          <h5>2. Project Guidelines</h5>
          <p>
            Projects must:
          </p>
          <ul>
            <li>Be clearly described and transparent about goals</li>
            <li>Not violate any laws or regulations</li>
            <li>Provide regular updates to backers</li>
            <li>Deliver promised rewards or refund contributions</li>
          </ul>
          
          <h5>3. Funding Terms</h5>
          <p>
            All contributions are final once a project is successfully funded. Creators are legally obligated 
            to fulfill their stated project goals or provide refunds.
          </p>
          
          <h5>4. Platform Fees</h5>
          <p>
            ProjectHub charges a 5% platform fee on successfully funded projects, plus payment processing fees.
          </p>
        </>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <>
          <h5>1. Information We Collect</h5>
          <p>
            We collect:
          </p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Usage data and analytics</li>
            <li>Communication preferences</li>
          </ul>
          
          <h5>2. How We Use Your Information</h5>
          <p>
            Your information is used to:
          </p>
          <ul>
            <li>Process transactions and maintain your account</li>
            <li>Send important updates about projects you've backed</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h5>3. Data Security</h5>
          <p>
            We implement industry-standard security measures to protect your personal information. 
            All payment data is encrypted and processed through secure payment providers.
          </p>
          
          <h5>4. Your Rights</h5>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Request corrections or deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </>
      )
    }
  };

  return (
    <>
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
                <a 
                  href="#" 
                  className={mutedClass} 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('about');
                  }}
                >
                  About
                </a>
                <a 
                  href="#" 
                  className={mutedClass}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('terms');
                  }}
                >
                  Terms
                </a>
                <a 
                  href="#" 
                  className={mutedClass}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal('privacy');
                  }}
                >
                  Privacy
                </a>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="d-flex gap-3 justify-content-md-end">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={mutedClass}>
                  <Github size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={mutedClass}>
                  <Twitter size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={mutedClass}>
                  <Linkedin size={20} />
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

      <Modal
        show={showModal !== null}
        onHide={() => setShowModal(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>{showModal && modalContent[showModal].title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          {showModal && modalContent[showModal].content}
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Button variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'} onClick={() => setShowModal(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};