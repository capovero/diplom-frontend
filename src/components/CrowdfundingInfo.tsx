import React from 'react';
import { Accordion } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

export const CrowdfundingInfo: React.FC = () => {
  const { theme } = useTheme();
  const darkClass = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
  
  return (
    <div className="mt-4">
      <h4 className="mb-3">What is Crowdfunding?</h4>
      <p>
        Crowdfunding is a method of raising capital through the collective effort of friends, family, customers, and individual investors. 
        This approach taps into the collective efforts of a large pool of individuals—primarily online via social media and crowdfunding 
        platforms—and leverages their networks for greater reach and exposure.
      </p>
      
      <Accordion defaultActiveKey="0" className="mt-4">
        <Accordion.Item eventKey="0" className={darkClass}>
          <Accordion.Header>Types of Crowdfunding</Accordion.Header>
          <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <ul>
              <li><strong>Reward-based:</strong> Contributors receive a reward, typically the product being funded.</li>
              <li><strong>Donation-based:</strong> Contributors donate without expecting anything in return.</li>
              <li><strong>Equity-based:</strong> Contributors receive equity or shares in the company.</li>
              <li><strong>Debt-based:</strong> Contributors are repaid with interest over time.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="1" className={darkClass}>
          <Accordion.Header>Benefits of Crowdfunding</Accordion.Header>
          <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <ul>
              <li><strong>Access to Capital:</strong> Provides funding for projects that might not qualify for traditional financing.</li>
              <li><strong>Market Validation:</strong> Tests if there's interest in your product or service.</li>
              <li><strong>Marketing Opportunity:</strong> Creates awareness and builds an audience before launch.</li>
              <li><strong>Community Building:</strong> Develops a community of supporters who are invested in your success.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        
        <Accordion.Item eventKey="2" className={darkClass}>
          <Accordion.Header>Tips for Successful Campaigns</Accordion.Header>
          <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
            <ol>
              <li><strong>Set a Clear Goal:</strong> Define exactly what you're raising money for and how much you need.</li>
              <li><strong>Tell Your Story:</strong> Create a compelling narrative about your project and why it matters.</li>
              <li><strong>Use Quality Media:</strong> Include high-quality photos and videos to showcase your project.</li>
              <li><strong>Offer Attractive Rewards:</strong> Create incentives that motivate people to contribute.</li>
              <li><strong>Promote Widely:</strong> Share your campaign across all your networks and social media channels.</li>
              <li><strong>Provide Regular Updates:</strong> Keep your backers informed about progress and milestones.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};