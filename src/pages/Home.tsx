import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ProjectCard } from '../components/ProjectCard';
import { mockProjects, mockCategories } from '../mockData';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

export const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Simulate API call for categories
    setCategories(mockCategories);
  }, []);

  useEffect(() => {
    // Simulate API call for projects
    const filteredProjects = mockProjects
      .filter(project => !selectedCategory || project.category === selectedCategory)
      .slice(0, page * 6);
    
    setProjects(filteredProjects);
    setHasMore(filteredProjects.length < mockProjects.length);
  }, [page, selectedCategory]);

  return (
    <Container className="py-5">
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedCategory === '' ? 'primary' : 'outline-primary'}
          onClick={() => {
            setSelectedCategory('');
            setPage(1);
          }}
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.name ? 'primary' : 'outline-primary'}
            onClick={() => {
              setSelectedCategory(category.name);
              setPage(1);
            }}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <Row xs={1} md={2} lg={3} className="g-4 projects-grid">
        {projects.map(project => (
          <Col key={project.id}>
            <ProjectCard {...project} />
          </Col>
        ))}
      </Row>

      {hasMore && (
        <div className="text-center mt-4">
          <Button
            variant="outline-primary"
            onClick={() => setPage(prev => prev + 1)}
          >
            Load More
          </Button>
        </div>
      )}
    </Container>
  );
};