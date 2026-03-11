import { Link } from 'react-router-dom';
import { courseService } from '../services/api';
import { useState, useEffect } from 'react';
import { Play, BookOpen, Users, Award, Search, Clock, Video } from 'lucide-react';

const Home = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    courseService.getCourses()
      .then(res => setCourses(res.data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Master New Skills with<br /><span>Expert-Led Courses</span></h1>
          <p>
            Join thousands of learners and unlock your potential. 
            Video-based courses taught by industry experts.
          </p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn btn-primary btn-lg">
              <Search size={20} />
              Browse Courses
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Video size={28} />
              </div>
              <h3>HD Video Lessons</h3>
              <p>High-quality video content from industry experts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={28} />
              </div>
              <h3>Structured Learning</h3>
              <p>Organized curriculum with step-by-step progress</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={28} />
              </div>
              <h3>Expert Instructors</h3>
              <p>Learn from professionals with real-world experience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Award size={28} />
              </div>
              <h3>Track Progress</h3>
              <p>Monitor your learning journey with detailed analytics</p>
            </div>
          </div>
        </div>
      </section>

      <section className="courses-section">
        <div className="container">
          <div className="courses-header">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-subtitle">Start learning from our most popular courses</p>
            </div>
            <Link to="/courses" className="btn btn-secondary">View All Courses</Link>
          </div>
          <div className="grid grid-4">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <Play size={24} />
            <span>LearnFlow</span>
          </div>
          <p className="footer-text">© 2024 LearnFlow. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
};

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course.slug}`} className="course-card">
      <div className="course-card-image">
        <img src={course.thumbnail} alt={course.title} />
        <span className="course-card-badge badge badge-primary">{course.category}</span>
        <span className="course-card-price">
          {course.price === 0 ? 'Free' : `₹${(course.price / 100).toFixed(0)}`}
        </span>
      </div>
      <div className="course-card-content">
        <h3 className="course-card-title">{course.title}</h3>
        <div className="course-card-instructor">
          {course.instructor?.avatar && (
            <img src={course.instructor.avatar} alt={course.instructor.name} />
          )}
          <span>{course.instructor?.name || 'Instructor'}</span>
        </div>
        <div className="course-card-meta">
          <span><Video size={14} /> {course.totalLessons} lessons</span>
          <span><Clock size={14} /> {Math.floor(course.totalDuration / 60)}h</span>
        </div>
      </div>
    </Link>
  );
};

export default Home;
