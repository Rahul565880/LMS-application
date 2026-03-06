import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentService, courseService } from '../services/api';
import { BookOpen, Clock, Users, Play, LayoutDashboard, GraduationCap } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        if (user.role === 'student') {
          const res = await enrollmentService.getMyEnrollments();
          setEnrollments(res.data);
        } else if (user.role === 'instructor') {
          const res = await courseService.getInstructorCourses();
          setInstructorCourses(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="skeleton" style={{ height: 60, marginBottom: 40 }}></div>
          <div className="grid grid-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 200 }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>{user?.role === 'instructor' ? 'Manage your courses and track student progress' : 'Continue your learning journey'}</p>
        </div>

        {user?.role === 'student' && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Enrolled Courses</h3>
                <div className="value">{enrollments.length}</div>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <div className="value">
                  {enrollments.filter(e => e.progress === 100).length}
                </div>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <div className="value">
                  {enrollments.filter(e => e.progress > 0 && e.progress < 100).length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Total Progress</h3>
                <div className="value">
                  {enrollments.length > 0 
                    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
                    : 0}%
                </div>
              </div>
            </div>

            <h2 style={{ marginBottom: '24px' }}>My Courses</h2>
            
            {enrollments.length > 0 ? (
              <div className="enrolled-courses">
                {enrollments.map(enrollment => (
                  <div key={enrollment.id} className="enrolled-course-card">
                    <img src={enrollment.course.thumbnail} alt={enrollment.course.title} />
                    <div className="enrolled-course-info">
                      <h3>{enrollment.course.title}</h3>
                      <p className="instructor">by {enrollment.course.instructor?.name}</p>
                      <div className="enrolled-course-progress">
                        <div className="progress-info">
                          <span>{enrollment.completedLessons} of {enrollment.totalLessons} lessons</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${enrollment.progress}%` }}></div>
                        </div>
                      </div>
                      <Link 
                        to={`/learn/${enrollment.course.id}`} 
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '12px' }}
                      >
                        <Play size={16} />
                        {enrollment.progress > 0 ? 'Continue' : 'Start Learning'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>No courses yet</h3>
                <p>Browse our courses and start learning today!</p>
                <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
              </div>
            )}
          </>
        )}

        {user?.role === 'instructor' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <Link to="/instructor/create-course" className="btn btn-primary">
                <BookOpen size={18} />
                Create New Course
              </Link>
            </div>

            <h2 style={{ marginBottom: '24px' }}>My Courses</h2>
            
            {instructorCourses.length > 0 ? (
              <div className="grid grid-3">
                {instructorCourses.map(course => (
                  <div key={course.id} className="card">
                    <div className="course-card-image">
                      <img src={course.thumbnail} alt={course.title} />
                    </div>
                    <div className="course-card-content">
                      <h3 className="course-card-title">{course.title}</h3>
                      <div className="course-card-meta">
                        <span><Users size={14} /> {course.enrollmentsCount} students</span>
                        <span><BookOpen size={14} /> {course.totalLessons} lessons</span>
                      </div>
                      <Link 
                        to={`/instructor/edit-course/${course.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '12px', width: '100%' }}
                      >
                        Edit Course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>No courses yet</h3>
                <p>Create your first course and start teaching!</p>
                <Link to="/instructor/create-course" className="btn btn-primary">Create Course</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
