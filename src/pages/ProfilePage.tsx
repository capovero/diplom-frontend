import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Badge, Button } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';
import { Footer } from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    joinedDate: string;
}

interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    progress: number;
    category: string;
    status: string;
}

interface Donation {
    id: string;
    projectId: string;
    projectTitle: string;
    amount: number;
    date: string;
}

export const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    // Removed unused activeTab state variable

    const isOwnProfile = user?.id === userId;

    useEffect(() => {
        // Simulate API call
        const mockProfile = {
            id: userId || '',
            name: 'John Doe',
            email: 'john@example.com',
            joinedDate: '2024-01-01T00:00:00Z'
        };

        const mockProjects = [
            {
                id: '1',
                title: 'E-commerce Platform',
                description: 'A modern e-commerce solution',
                image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                progress: 75,
                category: 'Web Development',
                status: 'Active'
            },
            {
                id: '2',
                title: 'Mobile App',
                description: 'A revolutionary mobile application',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                progress: 30,
                category: 'Mobile Apps',
                status: 'Pending'
            }
        ];

        const mockDonations = [
            {
                id: 'd1',
                projectId: '3',
                projectTitle: 'Fitness Tracking App',
                amount: 50,
                date: '2024-03-15T14:30:00Z'
            },
            {
                id: 'd2',
                projectId: '4',
                projectTitle: 'Smart Home Dashboard',
                amount: 100,
                date: '2024-03-10T09:15:00Z'
            }
        ];

        setProfile(mockProfile);
        setProjects(mockProjects.filter(project =>
            isOwnProfile || project.status === 'Active'
        ));
        setDonations(mockDonations);
        setLoading(false);
    }, [userId, isOwnProfile]);

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

    if (!profile) {
        return (
            <Container className="py-5">
                <div className="text-center">User not found</div>
            </Container>
        );
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <main className="flex-grow-1">
                <Container className="py-5">
                    <Card className={`mb-4 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h2 className="mb-1">{profile.name}</h2>
                                    {isOwnProfile && (
                                        <p className={`mb-2 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>{profile.email}</p>
                                    )}
                                    <p className={`mb-0 ${theme === 'dark' ? 'text-light-50' : 'text-muted'}`}>
                                        Member since {new Date(profile.joinedDate).toLocaleDateString()}
                                    </p>
                                </div>
                                {isOwnProfile && (
                                    <div>
                                        <Button
                                            variant="primary"
                                            className="me-2"
                                            onClick={() => navigate('/create-project')}
                                        >
                                            Create Project
                                        </Button>
                                        <Button
                                            variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
                                            onClick={() => navigate('/settings')}
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {isOwnProfile ? (
                        <Tab.Container id="profile-tabs" defaultActiveKey="projects">
                            <Nav variant="tabs" className="mb-4">
                                <Nav.Item>
                                    <Nav.Link
                                        eventKey="projects"
                                        className={theme === 'dark' ? 'text-light' : ''}
                                    >
                                        My Projects
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        eventKey="donations"
                                        className={theme === 'dark' ? 'text-light' : ''}
                                    >
                                        My Donations
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            <Tab.Content>
                                <Tab.Pane eventKey="projects">
                                    <Row xs={1} md={2} lg={3} className="g-4">
                                        {projects.map(project => (
                                            <Col key={project.id}>
                                                <ProjectCard {...project} />
                                            </Col>
                                        ))}
                                    </Row>

                                    {projects.length === 0 && (
                                        <Card className={`text-center py-5 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                                            <Card.Body>
                                                <p className={theme === 'dark' ? 'text-light-50 mb-3' : 'text-muted mb-3'}>You haven't created any projects yet</p>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => navigate('/create-project')}
                                                >
                                                    Create Your First Project
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Tab.Pane>

                                <Tab.Pane eventKey="donations">
                                    {donations.length > 0 ? (
                                        <Card className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
                                            <Card.Body>
                                                <h5 className="mb-4">Your Donations</h5>
                                                {donations.map(donation => (
                                                    <div key={donation.id} className={`p-3 mb-3 rounded ${theme === 'dark' ? 'bg-secondary-dark' : 'bg-light'}`}>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="mb-1">
                                                                    <Link to={`/project/${donation.projectId}`} className={theme === 'dark' ? 'text-light' : ''}>
                                                                        {donation.projectTitle}
                                                                    </Link>
                                                                </h6>
                                                                <div className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>
                                                                    {new Date(donation.date).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <Badge bg="success" className="fs-6">
                                                                ${donation.amount}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Card.Body>
                                        </Card>
                                    ) : (
                                        <Card className={`text-center py-5 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                                            <Card.Body>
                                                <p className={theme === 'dark' ? 'text-light-50 mb-3' : 'text-muted mb-3'}>You haven't made any donations yet</p>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => navigate('/')}
                                                >
                                                    Explore Projects
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    ) : (
                        <>
                            <h3 className={`mb-4 ${theme === 'dark' ? 'text-light' : ''}`}>Active Projects</h3>

                            <Row xs={1} md={2} lg={3} className="g-4">
                                {projects.map(project => (
                                    <Col key={project.id}>
                                        <ProjectCard {...project} />
                                    </Col>
                                ))}
                            </Row>

                            {projects.length === 0 && (
                                <Card className={`text-center py-5 ${theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}`}>
                                    <Card.Body>
                                        <p className={theme === 'dark' ? 'text-light-50' : 'text-muted'}>No active projects found</p>
                                    </Card.Body>
                                </Card>
                            )}
                        </>
                    )}
                </Container>
            </main>
            <Footer />
        </div>
    );
};