import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ProjectCard } from '../components/ProjectCard';
import { Pagination } from '../components/Pagination';
import { Footer } from '../components/Footer';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const projectsPerPage = 10;

  useEffect(() => {
    setCategories(mockCategories);
  }, []);

  useEffect(() => {
    // Simulate API call with pagination
    const filteredProjects = mockProjects
        .filter(project => !selectedCategory || project.category === selectedCategory);

    const total = Math.ceil(filteredProjects.length / projectsPerPage);
    setTotalPages(total);

    const start = (currentPage - 1) * projectsPerPage;
    const paginatedProjects = filteredProjects.slice(start, start + projectsPerPage);

    setProjects(paginatedProjects);
  }, [currentPage, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <Container className="py-5">
            <div className="d-flex flex-wrap gap-2 mb-4">
              <Button
                  variant={selectedCategory === '' ? 'primary' : 'outline-primary'}
                  onClick={() => {
                    setSelectedCategory('');
                    setCurrentPage(1);
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
                        setCurrentPage(1);
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

            {projects.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">No projects found</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                  />
                </div>
            )}
          </Container>
        </main>
        <Footer />
      </div>
  );
};