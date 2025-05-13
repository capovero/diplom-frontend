import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { useSpring, animated } from 'react-spring';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  rating?: number;
  creator?: {
    id: string;
    name: string;
  };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  image,
  progress,
  category,
  rating,
  creator
}) => {
  const props = useSpring({
    from: { opacity: 0, transform: 'translate3d(0,40px,0)' },
    to: { opacity: 1, transform: 'translate3d(0,0px,0)' },
  });

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <animated.div style={props}>
      <Card className="project-card h-100">
        <Card.Img
          variant="top"
          src={image}
          className="project-card__image"
          loading="lazy"
        />
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text className="project-card__description">
            {truncateDescription(description)}
          </Card.Text>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <small className="text-muted">{category}</small>
            {rating !== undefined && (
              <div className="d-flex align-items-center">
                <Star size={16} className="text-warning me-1" />
                <small>{rating.toFixed(1)}</small>
              </div>
            )}
          </div>
          {creator && (
            <div className="mb-2">
              <small className="text-muted">
                by <Link to={`/profile/${creator.id}`} className="text-decoration-none">{creator.name}</Link>
              </small>
            </div>
          )}
          <ProgressBar now={progress} label={`${progress}%`} className="mb-3" />
          <Link to={`/project/${id}`} className="btn btn-outline-primary">
            Смотреть проект
          </Link>
        </Card.Body>
      </Card>
    </animated.div>
  );
};