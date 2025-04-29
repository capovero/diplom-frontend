import React from 'react';
import { Button } from 'react-bootstrap';
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SocialShareButtonsProps {
  projectId: string;
  projectTitle: string;
}

export const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  projectId,
  projectTitle
}) => {
  const { theme } = useTheme();
  const currentUrl = `${window.location.origin}/project/${projectId}`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(`Check out this project: ${projectTitle}`);
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };
  
  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };
  
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Button
        variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
        size="sm"
        onClick={() => openShareWindow(shareLinks.facebook)}
        aria-label="Share on Facebook"
      >
        <Facebook size={16} className="me-1" />
        Facebook
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'outline-light' : 'outline-info'}
        size="sm"
        onClick={() => openShareWindow(shareLinks.twitter)}
        aria-label="Share on Twitter"
      >
        <Twitter size={16} className="me-1" />
        Twitter
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
        size="sm"
        onClick={() => openShareWindow(shareLinks.linkedin)}
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={16} className="me-1" />
        LinkedIn
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'outline-light' : 'outline-secondary'}
        size="sm"
        onClick={copyToClipboard}
        aria-label="Copy link"
      >
        <LinkIcon size={16} className="me-1" />
        Copy Link
      </Button>
    </div>
  );
};