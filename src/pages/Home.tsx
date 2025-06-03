// src/pages/Home.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { ProjectCard } from '../components/ProjectCard';
import { Pagination } from '../components/Pagination';
import { Footer } from '../components/Footer';
import { CrowdfundingInfo } from '../components/CrowdfundingInfo';
import { useTheme } from '../context/ThemeContext';
import { projectsApi, categoriesApi } from '../services/api';
import type { CategoryDto, ProjectPaginationResponse } from '../types/index.ts';

interface DisplayProject {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  goalAmount: number;
  collectedAmount: number;
  status: string;
}

export const Home: React.FC = () => {
  const { theme } = useTheme();

  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const projectsPerPage = 6;

  // Загрузка списка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);

      try {
        const resp = await categoriesApi.getAll();
        setCategories(resp.data);
      } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
        setErrorCategories('Не удалось загрузить категории');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Загрузка списка проектов (с учётом пагинации и фильтра по категории)
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      setErrorProjects(null);

      try {
        // Формируем объект фильтра для API
        const filter: {
          title?: string;
          categoryId?: number;
        } = {};

        if (selectedCategoryId !== null) {
          filter.categoryId = selectedCategoryId;
        }

        // Вызываем эндпоинт
        const resp = await projectsApi.getAll(
            filter,
            currentPage,
            projectsPerPage
        );

        const paginationData: ProjectPaginationResponse = resp.data;

        // Преобразуем каждый ProjectResponse в локальный DisplayProject
        const mapped = paginationData.data.map((p) => {
          const firstImage = p.mediaFiles.length > 0
              ? p.mediaFiles[0]
              : '/placeholder-image.jpg';

          // Вычисляем прогресс (collectedAmount / goalAmount) * 100
          const prog =
              p.goalAmount > 0
                  ? Number(((p.collectedAmount / p.goalAmount) * 100).toFixed(2))
                  : 0;

          return {
            id: p.id.toString(),
            title: p.title,
            description: p.description,
            image: firstImage,
            progress: prog,
            category: p.categoryName || 'Без категории',
            goalAmount: Number(p.goalAmount),
            collectedAmount: Number(p.collectedAmount),
            status: p.status,
          };
        });

        setProjects(mapped);

        // Пересчитываем общее число страниц
        const totalPagesCalc = Math.ceil(
            paginationData.totalRecords / projectsPerPage
        );
        setTotalPages(totalPagesCalc);
      } catch (err) {
        console.error('Ошибка загрузки проектов:', err);
        setErrorProjects('Не удалось загрузить проекты');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [currentPage, selectedCategoryId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <Container className="py-5">
            <Row className="mb-5">
              <Col>
                <Card
                    className={
                      theme === 'dark'
                          ? 'bg-dark text-light border-secondary'
                          : ''
                    }
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="mb-0">Добро пожаловать на ProjectFlow</h2>
                      <Button
                          variant={
                            theme === 'dark'
                                ? 'outline-light'
                                : 'outline-primary'
                          }
                          onClick={() => setShowInfo(!showInfo)}
                      >
                        {showInfo
                            ? 'Скрыть информацию'
                            : 'О краудфандинге'}
                      </Button>
                    </div>
                    <p
                        className={
                          theme === 'dark'
                              ? 'text-light-50'
                              : 'text-muted'
                        }
                    >
                      Откройте для себя инновационные проекты и поддержите
                      авторов в воплощении их идей в жизнь.
                    </p>

                    {showInfo && <CrowdfundingInfo />}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <Button
                  variant={
                    selectedCategoryId === null
                        ? 'primary'
                        : 'outline-primary'
                  }
                  onClick={() => handleCategorySelect(null)}
              >
                Все
              </Button>

              {loadingCategories && (
                  <Spinner animation="border" size="sm" className="ms-2" />
              )}

              {!loadingCategories &&
                  categories.map((cat) => (
                      <Button
                          key={cat.id}
                          variant={
                            selectedCategoryId === cat.id
                                ? 'primary'
                                : 'outline-primary'
                          }
                          onClick={() => handleCategorySelect(cat.id)}
                      >
                        {cat.name}
                      </Button>
                  ))}

              {errorCategories && (
                  <Alert variant="danger" className="mt-2">
                    {errorCategories}
                  </Alert>
              )}
            </div>

            {loadingProjects ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </Spinner>
                </div>
            ) : errorProjects ? (
                <Alert variant="danger" className="text-center">
                  {errorProjects}
                </Alert>
            ) : (
                <>
                  <Row
                      xs={1}
                      md={2}
                      lg={3}
                      className="g-4 projects-grid"
                  >
                    {projects.map((project) => (
                        <Col key={project.id}>
                          <ProjectCard {...project} />
                        </Col>
                    ))}
                  </Row>

                  {projects.length === 0 && (
                      <div className="text-center py-5">
                        <p className="text-muted">Проекты не найдены</p>
                      </div>
                  )}
                </>
            )}

            {!loadingProjects &&
                !errorProjects &&
                totalPages > 1 && (
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
