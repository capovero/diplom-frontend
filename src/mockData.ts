export const mockCategories = [
  { id: '1', name: 'Web Development' },
  { id: '2', name: 'Mobile Apps' },
  { id: '3', name: 'UI/UX Design' },
  { id: '4', name: 'Machine Learning' }
];

export const mockProjects = [
  {
    id: '1',
    title: 'Modern E-commerce Platform',
    description: 'A full-featured e-commerce platform built with React and Node.js, featuring real-time updates, cart management, and secure payments.',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    progress: 75,
    category: 'Web Development',
    creator: {
      id: '101',
      name: 'Alex Johnson'
    },
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'AI-Powered Task Manager',
    description: 'Smart task management application that uses AI to prioritize and organize your daily activities for maximum productivity.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    progress: 45,
    category: 'Machine Learning',
    creator: {
      id: '102',
      name: 'Sarah Chen'
    },
    createdAt: '2024-02-10T15:30:00Z'
  },
  {
    id: '3',
    title: 'Fitness Tracking App',
    description: 'Mobile application for tracking workouts, nutrition, and progress with social features and personalized recommendations.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    progress: 90,
    category: 'Mobile Apps',
    creator: {
      id: '103',
      name: 'Mike Wilson'
    },
    createdAt: '2024-02-01T08:45:00Z'
  },
  {
    id: '4',
    title: 'Smart Home Dashboard',
    description: 'Centralized dashboard for managing all your smart home devices with automation rules and energy monitoring.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 60,
    category: 'Web Development',
    creator: {
      id: '104',
      name: 'Emma Davis'
    },
    createdAt: '2024-02-05T09:15:00Z'
  },
  {
    id: '5',
    title: 'AR Shopping Experience',
    description: 'Augmented reality shopping app that lets users visualize products in their space before purchasing.',
    image: 'https://images.unsplash.com/photo-1633536726481-465c3676851d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 30,
    category: 'Mobile Apps',
    creator: {
      id: '105',
      name: 'Ryan Zhang'
    },
    createdAt: '2024-02-08T11:20:00Z'
  },
  {
    id: '6',
    title: 'Social Media Analytics',
    description: 'Advanced analytics platform for social media managers with AI-powered insights and recommendations.',
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 85,
    category: 'Machine Learning',
    creator: {
      id: '106',
      name: 'Lisa Brown'
    },
    createdAt: '2024-02-12T14:30:00Z'
  },
  {
    id: '7',
    title: 'Portfolio Builder',
    description: 'Easy-to-use portfolio website builder for creative professionals with customizable templates.',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 70,
    category: 'Web Development',
    creator: {
      id: '107',
      name: 'Tom Anderson'
    },
    createdAt: '2024-02-14T16:45:00Z'
  },
  {
    id: '8',
    title: 'UX Research Tool',
    description: 'Comprehensive UX research platform with user testing, analytics, and reporting features.',
    image: 'https://images.unsplash.com/photo-1553484771-047a44eee27b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 40,
    category: 'UI/UX Design',
    creator: {
      id: '108',
      name: 'Nina Patel'
    },
    createdAt: '2024-02-16T13:10:00Z'
  },
  {
    id: '9',
    title: 'Code Review Assistant',
    description: 'AI-powered code review tool that helps identify bugs and suggests improvements.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 55,
    category: 'Machine Learning',
    creator: {
      id: '109',
      name: 'David Kim'
    },
    createdAt: '2024-02-18T10:25:00Z'
  },
  {
    id: '10',
    title: 'Design System Builder',
    description: 'Tool for creating and managing design systems with component libraries and documentation.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 65,
    category: 'UI/UX Design',
    creator: {
      id: '110',
      name: 'Sophie Martin'
    },
    createdAt: '2024-02-20T15:55:00Z'
  },
  {
    id: '11',
    title: 'Virtual Event Platform',
    description: 'Comprehensive platform for hosting virtual events with interactive features and analytics.',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 80,
    category: 'Web Development',
    creator: {
      id: '111',
      name: 'James Wilson'
    },
    createdAt: '2024-02-22T09:40:00Z'
  },
  {
    id: '12',
    title: 'Health Monitoring App',
    description: 'Mobile app for tracking health metrics with personalized insights and recommendations.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    progress: 50,
    category: 'Mobile Apps',
    creator: {
      id: '112',
      name: 'Maria Garcia'
    },
    createdAt: '2024-02-24T12:15:00Z'
  }
];