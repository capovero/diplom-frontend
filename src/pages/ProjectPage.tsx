import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, ProgressBar, Button, Form, Card, Carousel, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { Star, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { DonationModal } from '../components/DonationModal';
import { SocialShareButtons } from '../components/SocialShareButtons';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

interface Review {
  id: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  goalAmount: number;
  collectedAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed';
  category: string;
  averageRating: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

const reviewSchema = Yup.object().shape({
  text: Yup.string()
      .min(10, 'Review must be at least 10 characters')
      .required('Review text is required'),
  rating: Yup.number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must not exceed 5')
      .required('Rating is required')
});

const StarRating: React.FC<{ rating: number, onSelect?: (rating: number) => void, interactive?: boolean }> = ({
                                                                                                                rating,
                                                                                                                onSelect,
                                                                                                                interactive = false
                                                                                                              }) => {
  const [hover, setHover] = useState(0);
  const { theme } = useTheme();

  const renderStar = (position: number) => {
    const filled = hover > 0 ? position <= hover : position <= rating;
    return (
        <Star
            key={position}
            className={`${filled ? 'text-warning' : theme === 'dark' ? 'text-light-50' : 'text-muted'} ${interactive ? 'cursor-pointer' : ''}`}
            size={20}
            fill={filled ? 'currentColor' : 'none'}
            onClick={() => interactive && onSelect?.(position)}
            onMouseEnter={() => interactive && setHover(position)}
            onMouseLeave={() => interactive && setHover(0)}
        />
    );
  };

  return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map(pos => renderStar(pos))}
      </div>
  );
};

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [project, setProject] = useState<Project | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  useEffect(() => {
    // Simulate API calls
    const mockProject = {
      id: '1',
      title: 'Modern E-commerce Platform',
      description: 'A full-featured e-commerce platform built with React and Node.js, featuring real-time updates, cart management, and secure payments. Our platform provides a seamless shopping experience with advanced features like real-time inventory tracking, personalized recommendations, and secure payment processing.',
      images: [
        'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      goalAmount: 50000,
      collectedAmount: 35000,
      status: 'Active' as const,
      category: 'Web Development',
      averageRating: 4.5,
      creator: {
        id: 'creator123',
        name: 'Alex Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      },
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-20T15:30:00Z'
    };

    const mockReviews = [
      {
        id: '1',
        userId: '123',
        userName: 'John Doe',
        text: 'Great project! The implementation is very professional.',
        rating: 5,
        createdAt: '2024-02-18T10:00:00Z'
      },
      {
        id: '2',
        userId: '124',
        userName: 'Jane Smith',
        text: 'Impressive work on the features. Looking forward to the final release.',
        rating: 4,
        createdAt: '2024-02-19T14:30:00Z'
      }
    ];

    setProject(mockProject);
    setReviews(mockReviews);
    setLoading(false);
  }, [id]);

  const handleSupport = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowDonationModal(true);
  };

  const handleDonate = async (amount: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Donated $${amount} to project ${id}`);
    // In a real app, you would update the project's collected amount
  };

  const handleReviewSubmit = async (values: { text: string; rating: number }, { resetForm }: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text: values.text,
      rating: values.rating,
      createdAt: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    resetForm();
  };

  if (loading) {
    return (
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
    );
  }

  if (!project) {
    return (
        <Container className="py-5">
          <div className="text-center">Project not found</div>
        </Container>
    );
  }

  const progress = (project.collectedAmount / project.goalAmount) * 100;

  return (
      <div className="d-flex flex-column min-vh-100">
        <animated.div style={fadeIn} className="flex-grow-1">
          <Container className="py-4">
            <Row className="g-4">
              <Col lg={7}>
                <div className="position-relative">
                  <Carousel
                      activeIndex={activeImage}
                      onSelect={setActiveImage}
                      interval={null}
                      className="project-carousel"
                      prevIcon={<ChevronLeft size={40} className="carousel-icon" />}
                      nextIcon={<ChevronRight size={40} className="carousel-icon" />}
                  >
                    {project.images.map((image, index) => (
                        <Carousel.Item key={index}>
                          <div className="project-image-container">
                            <img
                                src={image}
                                alt={`${project.title} - Image ${index + 1}`}
                                className="project-image"
                            />
                          </div>
                        </Carousel.Item>
                    ))}
                  </Carousel>

                  <div className="image-thumbnails d-none d-md-flex">
                    {project.images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className={`thumbnail-image ${activeImage === index ? 'active' : ''}`}
                            onClick={() => setActiveImage(index)}
                        />
                    ))}
                  </div>
                </div>

                <div className="project-content mt-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h1 className="h2 mb-2">{project.title}</h1>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Badge bg="primary">{project.category}</Badge>
                        <Badge bg="secondary">{project.status}</Badge>
                        <div className="d-flex align-items-center">
                          <StarRating rating={project.averageRating} />
                          <span className={`ms-2 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>({project.averageRating.toFixed(1)})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                    <Card.Body>
                      <h5 className="mb-3">Funding Progress</h5>
                      <ProgressBar
                          now={progress}
                          label={`${progress.toFixed(1)}%`}
                          className="mb-2"
                      />
                      <div className="d-flex justify-content-between">
                        <span className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Collected: ${project.collectedAmount.toLocaleString()}</span>
                        <span className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Goal: ${project.goalAmount.toLocaleString()}</span>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                    <Card.Body>
                      <h5 className="mb-3">About Project</h5>
                      <p className={ theme === 'dark' ? 'text-light-50' : 'text-muted'}>{project.description}</p>
                    </Card.Body>
                  </Card>

                  <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0">Reviews</h5>
                        {!showReviewForm && (
                            <Button
                                variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                                size="sm"
                                onClick={() => user ? setShowReviewForm(true) : navigate('/login')}
                            >
                              Write a Review
                            </Button>
                        )}
                      </div>

                      {showReviewForm && (
                          <Card className={`mb-4 border-primary border-opacity-25 ${theme === 'dark' ? 'bg-secondary-dark' : ''}`}>
                            <Card.Body>
                              <Formik
                                  initialValues={{ text: '', rating: 5 }}
                                  validationSchema={reviewSchema}
                                  onSubmit={handleReviewSubmit}
                              >
                                {({
                                    values,
                                    errors,
                                    touched,
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    setFieldValue
                                  }) => (
                                    <Form onSubmit={handleSubmit as any}>
                                      <Form.Group className="mb-3">
                                        <Form.Label>Your Rating</Form.Label>
                                        <div>
                                          <StarRating
                                              rating={values.rating}
                                              onSelect={(rating) => setFieldValue('rating', rating)}
                                              interactive
                                          />
                                        </div>
                                      </Form.Group>

                                      <Form.Group className="mb-3">
                                        <Form.Label>Your Review</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="text"
                                            value={values.text}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.text && !!errors.text}
                                            className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                          {errors.text}
                                        </Form.Control.Feedback>
                                      </Form.Group>

                                      <div className="d-flex gap-2">
                                        <Button type="submit" variant="primary" size="sm">
                                          Submit Review
                                        </Button>
                                        <Button
                                            variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                                            size="sm"
                                            onClick={() => setShowReviewForm(false)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </Form>
                                )}
                              </Formik>
                            </Card.Body>
                          </Card>
                      )}

                      <div className="reviews-list">
                        {reviews.map(review => (
                            <Card key={review.id} className={`mb-3 border-0 border-bottom ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                              <Card.Body className="px-0">
                                <div className="d-flex justify-content-between mb-2">
                                  <div className="d-flex align-items-center gap-2">
                                    <strong>{review.userName}</strong>
                                    <StarRating rating={review.rating} />
                                  </div>
                                  <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </small>
                                </div>
                                <p className={`mb-0 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>{review.text}</p>
                              </Card.Body>
                            </Card>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Col>

              <Col lg={5}>
                <div className="sticky-top" style={{ top: '2rem' }}>
                  <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                    <Card.Body>
                      <h5 className="card-title mb-4">Project Creator</h5>
                      <div className="d-flex align-items-center mb-3">
                        <div>
                          <Link
                              to={`/profile/${project.creator.id}`}
                              className={`text-decoration-none ${theme === 'dark' ? 'text-light' : 'text-dark'}`}
                          >
                            <strong className="d-block">{project.creator.name}</strong>
                          </Link>
                          <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Project Owner</small>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="d-flex justify-content-between mb-2">
                          <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Created:</small>
                          <small className={theme === 'dark' ? 'text-light' : 'text-dark'}>{new Date(project.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div className="d-flex justify-content-between">
                          <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Last updated:</small>
                          <small className={theme === 'dark' ? 'text-light' : 'text-dark'}>{new Date(project.updatedAt).toLocaleDateString()}</small>
                        </div>
                      </div>

                      <div className="d-grid gap-2">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSupport}
                        >
                          Support Project
                        </Button>
                        <Button
                            variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                            onClick={() => setShowShareModal(true)}
                        >
                          <Share2 size={18} className="me-2" />
                          Share Project
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                    <Card.Body>
                      <h6 className="mb-3">Project Statistics</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Total Reviews</span>
                        <strong className={theme === 'dark' ? 'text-light' : ''}>{reviews.length}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Average Rating</span>
                        <div className="d-flex align-items-center">
                          <strong className={`me-2 ${theme === 'dark' ? 'text-light' : ''}`}>{project.averageRating.toFixed(1)}</strong>
                          <StarRating rating={project.averageRating} />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>Funding Progress</span>
                        <strong className={theme === 'dark' ? 'text-light' : ''}>{progress.toFixed(1)}%</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            </Row>
          </Container>
        </animated.div>

        <Footer />

        {/* Donation Modal */}
        <DonationModal
            show={showDonationModal}
            onHide={() => setShowDonationModal(false)}
            projectTitle={project.title}
            onDonate={handleDonate}
        />

        {/* Share Modal */}
        <Modal
            show={showShareModal}
            onHide={() => setShowShareModal(false)}
            centered
        >
          <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
            <Modal.Title>Share this project</Modal.Title>
          </Modal.Header>
          <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <p className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
              Help spread the word about this project by sharing it with your network.
            </p>
            <SocialShareButtons projectId={project.id} projectTitle={project.title} />
          </Modal.Body>
        </Modal>
      </div>
  );
};