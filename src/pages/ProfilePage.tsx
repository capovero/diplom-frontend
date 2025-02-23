import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/ProjectCard';

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

export const ProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

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
            // Add more mock projects as needed
        ];

        setProfile(mockProfile);
        setProjects(mockProjects.filter(project =>
            isOwnProfile || project.status === 'Active'
        ));
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
        <Container className="py-5">
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h2 className="mb-1">{profile.name}</h2>
                            {isOwnProfile && (
                                <p className="text-muted mb-2">{profile.email}</p>
                            )}
                            <p className="text-muted mb-0">
                                Member since {new Date(profile.joinedDate).toLocaleDateString()}
                            </p>
                        </div>
                        {isOwnProfile && (
                            <Link to="/settings" className="btn btn-outline-primary">
                                Edit Profile
                            </Link>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <h3 className="mb-4">
                {isOwnProfile ? 'My Projects' : 'Active Projects'}
            </h3>

            <Row xs={1} md={2} lg={3} className="g-4">
                {projects.map(project => (
                    <Col key={project.id}>
                        <ProjectCard {...project} />
                    </Col>
                ))}
            </Row>

            {projects.length === 0 && (
                <Card className="text-center py-5">
                    <Card.Body>
                        <p className="text-muted mb-0">No projects found</p>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};