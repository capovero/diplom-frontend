import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { useSpring, animated } from 'react-spring';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  image,
  progress,
  category,
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
          <div className="mb-2">
            <small className="text-muted">{category}</small>
          </div>
          <ProgressBar now={progress} label={`${progress}%`} className="mb-3" />
          <Link to={`/project/${id}`} className="btn btn-outline-primary">
            View Project
          </Link>
        </Card.Body>
      </Card>
    </animated.div>
  );
};