import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-light mt-auto py-4 border-top">
            <Container>
                <Row className="justify-content-between align-items-center">
                    <Col md={4}>
                        <h5 className="mb-3">ProjectHub</h5>
                        <p className="text-muted mb-0">
                            Connecting innovators with supporters to bring great ideas to life.
                        </p>
                    </Col>
                    <Col md={4} className="text-md-center py-3 py-md-0">
                        <div className="d-flex gap-3 justify-content-md-center">
                            <a href="#" className="text-muted">About</a>
                            <a href="#" className="text-muted">Terms</a>
                            <a href="#" className="text-muted">Privacy</a>
                        </div>
                    </Col>
                    <Col md={4} className="text-md-end">
                        <div className="d-flex gap-3 justify-content-md-end">
                            <a href="#" className="text-muted">
                                <Github size={20} />
                            </a>
                            <a href="#" className="text-muted">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-muted">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};