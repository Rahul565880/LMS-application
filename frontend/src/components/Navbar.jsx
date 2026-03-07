import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { BookOpen, User, LogOut, LayoutDashboard, GraduationCap, Sun, Moon, Settings } from 'lucide-react';
import './components.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <GraduationCap size={32} />
          <span>LearnFlow</span>
        </Link>

        <div className="navbar-links">
          <Link to="/courses" className="nav-link"><BookOpen size={18} /> Courses</Link>
          {user?.role === 'instructor' && (
            <Link to="/instructor/create-course" className="nav-link">Create Course</Link>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user">
              <Link to="/dashboard" className="nav-link-user">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <div className="user-info">
                <User size={18} />
                <span>{user.name}</span>
              </div>

              <button onClick={toggleTheme} className="btn btn-secondary btn-sm" aria-label="Toggle Theme" style={{ padding: '8px' }}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/settings')}>
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <button onClick={toggleTheme} className="btn btn-secondary btn-sm" aria-label="Toggle Theme" style={{ padding: '8px', marginRight: '8px' }}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
