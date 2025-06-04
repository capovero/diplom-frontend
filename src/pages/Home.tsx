// src/pages/Home.tsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import { ProjectCard } from '../components/ProjectCard';
import { Pagination } from '../components/Pagination';
import { Footer } from '../components/Footer';
import { CrowdfundingInfo } from '../components/CrowdfundingInfo';
import { projectsApi, categoriesApi } from '../services/api';
import type {
  CategoryDto,
  ProjectPaginationResponse,
} from '../types/index.ts';
import { useSearchParams } from 'react-router-dom';

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

  // Получаем из URL: ?query=…&page=…
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Number(pageParam) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const projectsPerPage = 6;

  // — Загрузить категории
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

  // Если URL-страница (searchParams) меняется извне, синхронизируем currentPage
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  // — Загрузить проекты каждый раз, когда меняются: currentPage, selectedCategoryId или searchParams
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      setErrorProjects(null);

      try {
        // 1) Формируем объект фильтра
        const filter: {
          title?: string;
          categoryId?: number;
        } = {};

        const titleQuery = searchParams.get('query');
        if (titleQuery && titleQuery.trim() !== '') {
          filter.title = titleQuery.trim();
        }
        if (selectedCategoryId !== null) {
          filter.categoryId = selectedCategoryId;
        }

        // 2) Вызываем API: /api/projects?Title=…&CategoryId=…&pageNumber=…&pageSize=…
        const resp = await projectsApi.getAll(
            filter,
            currentPage,
            projectsPerPage
        );
        const paginationData: ProjectPaginationResponse = resp.data;

        // 3) Мапим ProjectResponseDto → DisplayProject
        const mapped = paginationData.data.map((p) => {
          const firstImage =
              p.mediaFiles.length > 0 ? p.mediaFiles[0] : '/placeholder-image.jpg';
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

        // 4) Вычисляем общее число страниц
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
  }, [currentPage, selectedCategoryId, searchParams]);

  // При клике на другую страницу пагинации
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  // При выборе категории — сбрасываем страницу на 1 и перезаписываем ?page=1
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <Container className="py-5">
            <Row className="mb-5">
              <Col>
                <Card
                    className={
                      theme === 'dark' ? 'bg-dark text-light border-secondary' : ''
                    }
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="mb-0">Добро пожаловать на ProjectFlow</h2>
                      <Button
                          variant={
                            theme === 'dark' ? 'outline-light' : 'outline-primary'
                          }
                          onClick={() => setShowInfo(!showInfo)}
                      >
                        {showInfo ? 'Скрыть информацию' : 'О краудфандинге'}
                      </Button>
                    </div>
                    <p
                        className={
                          theme === 'dark' ? 'text-light-50' : 'text-muted'
                        }
                    >
                      Откройте для себя инновационные проекты и поддержите авторов
                      в воплощении их идей в жизнь.
                    </p>
                    {showInfo && <CrowdfundingInfo />}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mb-4">
              <Button
                  variant={
                    selectedCategoryId === null ? 'primary' : 'outline-primary'
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
                            selectedCategoryId === cat.id ? 'primary' : 'outline-primary'
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
                  <Row xs={1} md={2} lg={3} className="g-4 projects-grid">
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

            {!loadingProjects && !errorProjects && totalPages > 1 && (
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
