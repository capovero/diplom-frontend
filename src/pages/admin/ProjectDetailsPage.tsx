import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Tab, Nav, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed';
  category: string;
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Donation {
  id: string;
  amount: number;
  userId: string;
  userName: string;
  createdAt: string;
}

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [project, setProject] = useState<Project | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Project['status']>('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // GET /api/admin/projects/${id}
    // GET /api/admin/donations/project/${id}
    const mockProject: Project = {
      id: id || '',
      title: 'Sample Project',
      description: 'Project description...',
      images: [
        'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      status: 'Pending',
      category: 'Web Development',
      creator: {
        id: 'user-1',
        name: 'John Doe'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mockDonations: Donation[] = [
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

    setProject(mockProject);
    setDonations(mockDonations);
    setNewStatus(mockProject.status);
    setLoading(false);
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      // TODO: Replace with actual API call
      // await axios.patch(`/api/admin/projects/${id}/status`, { status: newStatus });
      setProject(prev => prev ? { ...prev, status: newStatus } : null);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
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
      <Container className="py-4">
        <div className="text-center">Project not found</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button
          variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
          className="me-3"
          onClick={() => navigate('/admin/projects')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>Project Details</h2>
      </div>

      <Tab.Container defaultActiveKey="details">
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              eventKey="details"
              className={theme === 'dark' ? 'text-light' : ''}
            >
              Details
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              eventKey="donations"
              className={theme === 'dark' ? 'text-light' : ''}
            >
              Donations
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="details">
            <Row className="g-4">
              <Col lg={8}>
                <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h3 className="mb-2">{project.title}</h3>
                        <p className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                          ID: {project.id}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => setShowStatusModal(true)}
                      >
                        Change Status
                      </Button>
                    </div>

                    <div className="mb-4">
                      <h5>Description</h5>
                      <p className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                        {project.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h5>Images</h5>
                      <Row xs={1} md={2} className="g-3">
                        {project.images.map((image, index) => (
                          <Col key={index}>
                            <img
                              src={image}
                              alt={`Project ${index + 1}`}
                              className="img-fluid rounded"
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                  <Card.Body>
                    <h5 className="card-title mb-4">Project Information</h5>
                    <dl>
                      <dt>Status</dt>
                      <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>{project.status}</dd>
                      
                      <dt>Category</dt>
                      <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>{project.category}</dd>
                      
                      <dt>Creator</dt>
                      <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>{project.creator.name}</dd>
                      
                      <dt>Created</dt>
                      <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </dd>
                      
                      <dt>Last Updated</dt>
                      <dd className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </dd>
                    </dl>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

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
                        <td>{donation.userName}</td>
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
        </Tab.Content>
      </Tab.Container>

      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
      >
        <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
          <Modal.Title>Change Project Status</Modal.Title>
        </Modal.Header>
        <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
          <Form.Group>
            <Form.Label>New Status</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Project['status'])}
              className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </Form.Select>
          </Form.Group>
          <p className={`mt-3 mb-0 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
            Are you sure you want to change the project status?
          </p>
        </Modal.Body>
        <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
          <Button
            variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
            onClick={() => setShowStatusModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};