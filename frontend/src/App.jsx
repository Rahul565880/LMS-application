import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learning from './pages/Learning';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import Settings from './pages/Settings';
import Practice from './pages/Practice';
import Notes from './pages/Notes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/learn/:slug/lesson/:lessonId" element={<Learning />} />
          <Route path="/learn/:slug" element={<Learning />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/instructor/create-course" element={<CreateCourse />} />
          <Route path="/instructor/edit-course/:courseId" element={<CreateCourse />} />
        </Routes>
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;
