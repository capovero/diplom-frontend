import React from 'react';
import { Card, ProgressBar, Badge, Button } from 'react-bootstrap';
import { useSpring, animated } from 'react-spring';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Status } from '../types';

interface ProjectCardProps {
    id: number;
    title: string;
    description: string;
    image: string;
    goalAmount: number;
    collectedAmount: number;
    progress: number;
    category: string; // Теперь используется в компоненте
    status: Status;
    averageRating?: number | null;
    creator?: {
        id: string;
        name: string;
    };
    onEdit?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
                                                            id,
                                                            title,
                                                            description,
                                                            image,
                                                            goalAmount,
                                                            collectedAmount,
                                                            progress,
                                                            category,
                                                            status,
                                                            averageRating,
                                                            creator,
                                                            onEdit
                                                        }) => {
    const animationProps = useSpring({
        from: { opacity: 0, transform: 'translate3d(0,40px,0)' },
        to: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    });

    const truncateDescription = (text: string, maxLength: number = 150) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const statusVariant = {
        'Active': 'success',
        'Completed': 'primary',
        'Pending': 'warning',
        'Rejected': 'danger'
    }[status];

    return (
        <animated.div style={animationProps}>
            <Card className="project-card h-100 shadow-sm">
                <Card.Img
                    variant="top"
                    src={image}
                    alt={title}
                    className="project-card__image"
                    style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <Card.Title className="mb-0">{title}</Card.Title>
                        <Badge bg={statusVariant} pill>
                            {status}
                        </Badge>
                    </div>

                    {/* Добавляем отображение категории */}
                    <div className="mb-2">
                        <Badge bg="info" className="me-2">
                            {category}
                        </Badge>
                    </div>

                    <Card.Text className="text-muted mb-3">
                        {truncateDescription(description)}
                    </Card.Text>

                    <div className="mt-auto">
                        {averageRating !== undefined && averageRating !== null && (
                            <div className="d-flex align-items-center mb-2">
                                <Star size={16} className="text-warning me-1" />
                                <small className="text-muted">{averageRating.toFixed(1)}</small>
                            </div>
                        )}

                        {creator && (
                            <div className="mb-2">
                                <small className="text-muted">
                                    Автор: {' '}
                                    <Link
                                        to={`/profile/${creator.id}`}
                                        className="text-decoration-none text-primary"
                                    >
                                        {creator.name}
                                    </Link>
                                </small>
                            </div>
                        )}

                        <div className="mb-3">
                            <ProgressBar
                                now={progress}
                                label={`${progress}%`}
                                variant={progress >= 100 ? 'success' : 'primary'}
                                className="mb-2"
                            />
                            <div className="d-flex justify-content-between small">
                                <span>Собрано: ${collectedAmount}</span>
                                <span>Цель: ${goalAmount}</span>
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <Link
                                to={`/project/${id}`}
                                className="btn btn-outline-primary btn-sm"
                            >
                                Подробнее
                            </Link>
                            {onEdit && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={onEdit}
                                >
                                    Редактировать
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </animated.div>
    );
};