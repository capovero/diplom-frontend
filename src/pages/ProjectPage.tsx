import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, ProgressBar, Button, Card, Carousel, Modal, Tab, Nav, Table } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { Star, ChevronLeft, ChevronRight, Share2, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { DonationModal } from '../components/DonationModal';
import { SocialShareButtons } from '../components/SocialShareButtons';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  goalAmount: number;
  currentAmount: number;
  creator: {
    id: string;
    name: string;
  };
  category: string;
  status: string;
  createdAt: string;
  rating: number;
  totalReviews: number;
}

interface ProjectUpdate {
  id: string;
  text: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  createdAt: string;
}

const updateSchema = Yup.object().shape({
  text: Yup.string()
    .min(10, 'Update must be at least 10 characters')
    .required('Update text is required'),
});

const reviewSchema = Yup.object().shape({
  rating: Yup.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot be more than 5')
    .required('Rating is required'),
  comment: Yup.string()
    .min(10, 'Review must be at least 10 characters')
    .required('Review text is required'),
});

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [project, setProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300 }
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    // GET /api/projects/${id}
    const mockProject: Project = {
      id: id || '1',
      title: 'Modern E-commerce Platform',
      description: 'A full-featured e-commerce platform built with React and Node.js, featuring real-time updates, cart management, and secure payments.',
      images: [
        'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      goalAmount: 50000,
      currentAmount: 25000,
      creator: {
        id: 'user-1',
        name: 'Alex Johnson'
      },
      category: 'Web Development',
      status: 'Active',
      createdAt: '2024-02-15T10:00:00Z',
      rating: 4.5,
      totalReviews: 12
    };

    const mockDonations = [
      {
        id: 'd1',
        amount: 100,
        userId: 'user-2',
        userName: 'Jane Smith',
        createdAt: new Date().toISOString()
      },
      {
        id: 'd2',
        amount: 50,
        userId: 'user-3',
        userName: 'Bob Johnson',
        createdAt: new Date().toISOString()
      }
    ];

    const mockReviews: Review[] = [
      {
        id: 'r1',
        rating: 5,
        comment: 'Excellent project! Very well thought out and executed.',
        userId: 'user-2',
        userName: 'Jane Smith',
        createdAt: '2024-03-15T10:00:00Z'
      },
      {
        id: 'r2',
        rating: 4,
        comment: 'Great initiative, looking forward to the final product.',
        userId: 'user-3',
        userName: 'Bob Johnson',
        createdAt: '2024-03-14T15:30:00Z'
      }
    ];

    setProject(mockProject);
    setDonations(mockDonations);
    setReviews(mockReviews);
  }, [id]);

  useEffect(() => {
    // TODO: Replace with actual API call
    // GET /api/updates/project/${id}
    const mockUpdates: ProjectUpdate[] = [
      {
        id: '1',
        text: 'Thanks everyone! We reached 50% of our goal!',
        createdAt: '2024-04-27T10:00:00Z',
        createdBy: {
          id: 'creator123',
          name: 'Alex Johnson',
          role: 'USER'
        }
      },
      {
        id: '2',
        text: 'Project development is going well. Here\'s our latest milestone.',
        createdAt: '2024-04-25T15:30:00Z',
        createdBy: {
          id: 'admin1',
          name: 'Admin',
          role: 'ADMIN'
        }
      }
    ];
    setUpdates(mockUpdates);
  }, []);

  const handleDonate = async (amount: number) => {
    try {
      // TODO: Replace with actual API call
      // POST /api/donations
      console.log('Processing donation:', amount);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProject(prev => prev ? {
        ...prev,
        currentAmount: prev.currentAmount + amount
      } : null);
      
      setShowDonateModal(false);
    } catch (error) {
      console.error('Donation failed:', error);
    }
  };

  const handleUpdateSubmit = async (values: { text: string }, { resetForm }: any) => {
    try {
      // TODO: Replace with actual API call
      // POST /api/updates/${id} or PUT /api/updates/${editingUpdate.id}
      const newUpdate = {
        id: Date.now().toString(),
        text: values.text,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: user?.id || '',
          name: user?.name || '',
          role: user?.role || 'USER'
        }
      };

      if (editingUpdate) {
        setUpdates(prev => prev.map(update => 
          update.id === editingUpdate.id ? { ...update, text: values.text } : update
        ));
      } else {
        setUpdates(prev => [newUpdate, ...prev]);
      }

      setShowUpdateModal(false);
      setEditingUpdate(null);
      resetForm();
    } catch (error) {
      console.error('Failed to submit update:', error);
    }
  };

  const handleReviewSubmit = async (values: { rating: number; comment: string }, { resetForm }: any) => {
    try {
      // TODO: Replace with actual API call
      // POST /api/reviews/${id} or PUT /api/reviews/${editingReview.id}
      const newReview = {
        id: Date.now().toString(),
        ...values,
        userId: user?.id || '',
        userName: user?.name || '',
        createdAt: new Date().toISOString()
      };

      if (editingReview) {
        setReviews(prev => prev.map(review =>
          review.id === editingReview.id ? { ...newReview, id: review.id } : review
        ));
      } else {
        setReviews(prev => [newReview, ...prev]);
      }

      // Update project rating
      if (project) {
        const newTotalReviews = editingReview ? project.totalReviews : project.totalReviews + 1;
        const currentTotal = (project.rating * project.totalReviews) - (editingReview?.rating || 0);
        const newRating = (currentTotal + values.rating) / newTotalReviews;
        
        setProject(prev => prev ? {
          ...prev,
          rating: newRating,
          totalReviews: newTotalReviews
        } : null);
      }

      setShowReviewModal(false);
      setEditingReview(null);
      resetForm();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    try {
      // TODO: Replace with actual API call
      // DELETE /api/updates/${updateId}
      if (window.confirm('Are you sure you want to delete this update?')) {
        setUpdates(prev => prev.filter(update => update.id !== updateId));
      }
    } catch (error) {
      console.error('Failed to delete update:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      // TODO: Replace with actual API call
      // DELETE /api/reviews/${reviewId}
      if (window.confirm('Are you sure you want to delete this review?')) {
        const reviewToDelete = reviews.find(r => r.id === reviewId);
        if (reviewToDelete && project) {
          const newTotalReviews = project.totalReviews - 1;
          const newRating = newTotalReviews > 0 
            ? ((project.rating * project.totalReviews) - reviewToDelete.rating) / newTotalReviews
            : 0;
          
          setProject(prev => prev ? {
            ...prev,
            rating: newRating,
            totalReviews: newTotalReviews
          } : null);
        }
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const canManageUpdates = user?.role === 'ADMIN' || project?.creator?.id === user?.id;
  const canManageReviews = user?.role === 'ADMIN';
  const hasUserReviewed = reviews.some(review => review.userId === user?.id);
  const isProjectCreator = project?.creator?.id === user?.id;

  if (!project) {
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

  const progress = (project.currentAmount / project.goalAmount) * 100;

  return (
    <div className="d-flex flex-column min-vh-100">
      <animated.div style={fadeIn} className="flex-grow-1">
        <Container className="py-4">
          <div className="mb-4">
            <Button
              variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
              onClick={() => navigate('/')}
              className="mb-3"
            >
              <ChevronLeft size={20} className="me-1" />
              Back to Projects
            </Button>
            <h1 className={theme === 'dark' ? 'text-light' : ''}>{project.title}</h1>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Badge bg="primary">{project.category}</Badge>
              <Badge bg="success">{project.status}</Badge>
              <div className="ms-2 d-flex align-items-center">
                <Star className="text-warning" size={18} />
                <span className="ms-1">{project.rating.toFixed(1)}</span>
                <span className="ms-1 text-muted">({project.totalReviews} reviews)</span>
              </div>
              <div className="ms-2">
                by <Link to={`/profile/${project.creator.id}`} className={`text-decoration-none ${theme === 'dark' ? 'text-light' : 'text-primary'}`}>
                  {project.creator.name}
                </Link>
              </div>
            </div>
          </div>

          <Row className="g-4">
            <Col lg={8}>
              <Card className={`project-carousel mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                <Card.Body className="p-0">
                  <Carousel
                    activeIndex={currentImageIndex}
                    onSelect={setCurrentImageIndex}
                    interval={null}
                    indicators={false}
                  >
                    {project.images.map((image, index) => (
                      <Carousel.Item key={index}>
                        <div className="project-image-container">
                          <img
                            src={image}
                            alt={`Project ${index + 1}`}
                            className="project-image"
                          />
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                  
                  <div className="image-thumbnails px-3 pb-3">
                    {project.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className={`thumbnail-image ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </Card.Body>
              </Card>

              <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                <Card.Body>
                  <h4 className="mb-3">About This Project</h4>
                  <p>{project.description}</p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                <Card.Body>
                  <h4 className="mb-3">${project.currentAmount.toLocaleString()}</h4>
                  <p className={`mb-1 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                    raised of ${project.goalAmount.toLocaleString()} goal
                  </p>
                  <ProgressBar now={progress} className="mb-4" />
                  
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3"
                    onClick={() => setShowDonateModal(true)}
                  >
                    Support This Project
                  </Button>
                  
                  <SocialShareButtons
                    projectId={project.id}
                    projectTitle={project.title}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Tab.Container defaultActiveKey="reviews">
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="reviews" className={theme === 'dark' ? 'text-light' : ''}>
                  Reviews
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="updates" className={theme === 'dark' ? 'text-light' : ''}>
                  Updates
                </Nav.Link>
              </Nav.Item>
              {(user?.role === 'ADMIN' || isProjectCreator) && (
                <Nav.Item>
                  <Nav.Link eventKey="donations" className={theme === 'dark' ? 'text-light' : ''}>
                    Donations
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="reviews">
                <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 className="mb-2">Project Reviews</h5>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                size={20}
                                className={index < Math.round(project.rating) ? 'text-warning' : 'text-muted'}
                                fill={index < Math.round(project.rating) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="fs-5 fw-bold me-2">{project.rating.toFixed(1)}</span>
                          <span className="text-muted">({project.totalReviews} reviews)</span>
                        </div>
                      </div>
                      {user && !hasUserReviewed && !isProjectCreator && (
                        <Button
                          variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                          onClick={() => {
                            setEditingReview(null);
                            setShowReviewModal(true);
                          }}
                        >
                          Write a Review
                        </Button>
                      )}
                    </div>

                    {reviews.map(review => (
                      <Card 
                        key={review.id} 
                        className={`mb-3 ${theme === 'dark' ? 'bg-secondary-dark border-secondary' : 'bg-light'}`}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <div>
                              <div className="d-flex align-items-center mb-1">
                                <div className="me-2">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      size={16}
                                      className={index < review.rating ? 'text-warning' : 'text-muted'}
                                      fill={index < review.rating ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                </div>
                                <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                  by <Link to={`/profile/${review.userId}`} className={theme === 'dark' ? 'text-light' : 'text-primary'}>
                                    {review.userName}
                                  </Link>
                                </small>
                              </div>
                              <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                            {(canManageReviews || review.userId === user?.id) && (
                              <div>
                                {review.userId === user?.id && (
                                  <Button
                                    variant="link"
                                    className="p-0 me-3"
                                    onClick={() => {
                                      setEditingReview(review);
                                      setShowReviewModal(true);
                                    }}
                                  >
                                    <Edit size={16} />
                                  </Button>
                                )}
                                <Button
                                  variant="link"
                                  className="p-0 text-danger"
                                  onClick={() => handleDeleteReview(review.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="mb-0">{review.comment}</p>
                        </Card.Body>
                      </Card>
                    ))}

                    {reviews.length === 0 && (
                      <p className={`text-center ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                        No reviews yet
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="updates">
                <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Project Updates</h5>
                      {canManageUpdates && (
                        <Button
                          variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                          onClick={() => {
                            setEditingUpdate(null);
                            setShowUpdateModal(true);
                          }}
                        >
                          Add Update
                        </Button>
                      )}
                    </div>

                    {updates.map(update => (
                      <Card 
                        key={update.id} 
                        className={`mb-3 ${theme === 'dark' ? 'bg-secondary-dark border-secondary' : 'bg-light'}`}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <div>
                              <small className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                {new Date(update.createdAt).toLocaleDateString()} by{' '}
                                <Link to={`/profile/${update.createdBy.id}`} className={theme === 'dark' ? 'text-light' : 'text-primary'}>
                                  {update.createdBy.name}
                                </Link>
                                {update.createdBy.role === 'ADMIN' && (
                                  <Badge bg="warning" className="ms-2">Admin</Badge>
                                )}
                              </small>
                            </div>
                            {(user?.role === 'ADMIN' || (isProjectCreator && update.createdBy.id === user?.id)) && (
                              <div>
                                <Button
                                  variant="link"
                                  className="p-0 me-3"
                                  onClick={() => {
                                    setEditingUpdate(update);
                                    setShowUpdateModal(true);
                                  }}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="link"
                                  className="p-0 text-danger"
                                  onClick={() => handleDeleteUpdate(update.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="mb-0">{update.text}</p>
                        </Card.Body>
                      </Card>
                    ))}

                    {updates.length === 0 && (
                      <p className={`text-center ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                        No updates yet
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {(user?.role === 'ADMIN' || isProjectCreator) && (
                <Tab.Pane eventKey="donations">
                  <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                    <Card.Body>
                      <h5 className="mb-4">Project Donations</h5>
                      <Table responsive className={theme === 'dark' ? 'table-dark' : ''}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Donor</th>
                            <th>Amount</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.map(donation => (
                            <tr key={donation.id}>
                              <td>{donation.id}</td>
                              <td>
                                <Link to={`/profile/${donation.userId}`} className={theme === 'dark' ? 'text-light' : 'text-primary'}>
                                  {donation.userName}
                                </Link>
                              </td>
                              <td>${donation.amount}</td>
                              <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {donations.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center">No donations found</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              )}
            </Tab.Content>
          </Tab.Container>
        </Container>
      </animated.div>
      
      <Footer />

      <DonationModal
        show={showDonateModal}
        onHide={() => setShowDonateModal(false)}
        projectTitle={project.title}
        onDonate={handleDonate}
      />

      <Modal
        show={showUpdateModal}
        onHide={() => {
          setShowUpdateModal(false);
          setEditingUpdate(null);
        }}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>{editingUpdate ? 'Edit Update' : 'Add Update'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{ text: editingUpdate?.text || '' }}
          validationSchema={updateSchema}
          onSubmit={handleUpdateSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <Form.Group>
                  <Form.Label>Update Text</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
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
              </Modal.Body>
              <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                <Button
                  variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                  onClick={() => {
                    setShowUpdateModal(false);
                    setEditingUpdate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingUpdate ? 'Save Changes' : 'Add Update'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      <Modal
        show={showReviewModal}
        onHide={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>{editingReview ? 'Edit Review' : 'Write a Review'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            rating: editingReview?.rating || 5,
            comment: editingReview?.comment || ''
          }}
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
            setFieldValue,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <div className="d-flex gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Button
                        key={index}
                        variant="link"
                        className="p-0"
                        onClick={() => setFieldValue('rating', index + 1)}
                      >
                        <Star
                          size={24}
                          className={index < values.rating ? 'text-warning' : 'text-muted'}
                          fill={index < values.rating ? 'currentColor' : 'none'}
                        />
                      </Button>
                    ))}
                  </div>
                  {touched.rating && errors.rating && (
                    <div className="text-danger">{errors.rating}
                    </div>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label>Review</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="comment"
                    value={values.comment}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.comment && !!errors.comment}
                    className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.comment}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                <Button
                  variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
                  onClick={() => {
                    setShowReviewModal(false);
                    setEditingReview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingReview ? 'Save Changes' : 'Submit Review'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};