import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ProjectPage } from './pages/ProjectPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateProjectPage } from './pages/CreateProjectPage';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <div className="min-vh-100 d-flex flex-column">
                        <Header />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/project/:id" element={<ProjectPage />} />
                            <Route path="/profile/:userId" element={<ProfilePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/create-project" element={<CreateProjectPage />} />
                        </Routes>
                    </div>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;