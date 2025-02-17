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
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
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
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
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
      name: 'Mike Wilson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    createdAt: '2024-02-01T08:45:00Z'
  }
];