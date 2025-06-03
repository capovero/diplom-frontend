import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ProjectPage } from './pages/ProjectPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersPage } from './pages/admin/UsersPage';
import { UserDetailsPage } from './pages/admin/UserDetailsPage';
import { ProjectsPage } from './pages/admin/ProjectsPage';
import { ProjectDetailsPage } from './pages/admin/ProjectDetailsPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { useAuth } from './context/AuthContext';
import { EditProjectPage } from './pages/EditProjectPage';

const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

const UserRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/project/:id" element={<ProjectPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
        <Route
            path="/edit-project/:id"
            element={<UserRoute element={<EditProjectPage />} />}
        />


        {/* Protected User Routes */}
      <Route path="/profile/:userId" element={<UserRoute element={<ProfilePage />} />} />
      <Route path="/create-project" element={<UserRoute element={<CreateProjectPage />} />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
      <Route path="/admin/users" element={<AdminRoute element={<UsersPage />} />} />
      <Route path="/admin/users/:userId" element={<AdminRoute element={<UserDetailsPage />} />} />
      <Route path="/admin/projects" element={<AdminRoute element={<ProjectsPage />} />} />
      <Route path="/admin/projects/:id" element={<AdminRoute element={<ProjectDetailsPage />} />} />
      <Route path="/admin/categories" element={<AdminRoute element={<CategoriesPage />} />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-vh-100 d-flex flex-column">
            <Header />
            <AppRoutes />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;