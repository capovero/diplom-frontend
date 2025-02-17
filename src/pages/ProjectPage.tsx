import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { mockProjects } from '../mockData';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  creator: {
    name: string;
    avatar: string;
  };
  createdAt: string;
}

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  useEffect(() => {
    // Simulate API call
    const foundProject = mockProjects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5">
        <div>Loading...</div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="py-5">
        <div>Project not found</div>
      </Container>
    );
  }

  return (
    <animated.div style={fadeIn}>
      <Container className="py-5">
        <Row>
          <Col lg={8}>
            <img
              src={project.image}
              alt={project.title}
              className="img-fluid rounded mb-4"
            />
            <h1 className="mb-3">{project.title}</h1>
            <Badge bg="primary" className="mb-3">
              {project.category}
            </Badge>
            <p className="text-muted">
              Created on {new Date(project.createdAt).toLocaleDateString()}
            </p>
            <ProgressBar
              now={project.progress}
              label={`${project.progress}%`}
              className="mb-4"
            />
            <div className="mb-4">
              {project.description}
            </div>
          </Col>
          <Col lg={4}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Creator</h5>
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={project.creator.avatar}
                    alt={project.creator.name}
                    className="rounded-circle me-2"
                    width="40"
                    height="40"
                  />
                  <div>
                    <strong>{project.creator.name}</strong>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </animated.div>
  );
};