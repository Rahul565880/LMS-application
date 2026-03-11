import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentService, courseService } from '../services/api';
import { BookOpen, Clock, Users, Play, LayoutDashboard, GraduationCap, Trash2, Edit, TrendingUp, Award } from 'lucide-react';

const CircularProgress = ({ progress, size = 120 }) => {
  const radius = (size - 12) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const handleDeleteCourse = async (courseId, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await courseService.deleteCourse(courseId);
      setInstructorCourses(instructorCourses.filter(c => c.id !== courseId));
      alert('Course deleted successfully!');
    } catch (err) {
      alert('Failed to delete course');
    }
  };

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
        } else if (isInstructor) {
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
          <p>{isInstructor ? 'Manage your courses and track student progress' : 'Continue your learning journey'}</p>
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

            {enrollments.length > 0 && (
              <div className="progress-overview-card">
                <div className="progress-overview-left">
                  <CircularProgress 
                    progress={enrollments.length > 0 
                      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
                      : 0} 
                  />
                </div>
                <div className="progress-overview-right">
                  <h3><TrendingUp size={20} /> Learning Progress</h3>
                  <p>You've completed {enrollments.filter(e => e.progress === 100).length} of {enrollments.length} courses</p>
                  <div className="progress-stats-mini">
                    <div className="progress-stat-mini">
                      <Award size={16} />
                      <span>{enrollments.filter(e => e.progress === 100).length} Completed</span>
                    </div>
                    <div className="progress-stat-mini">
                      <BookOpen size={16} />
                      <span>{enrollments.filter(e => e.progress > 0 && e.progress < 100).length} In Progress</span>
                    </div>
                  </div>
                  <Link to="/courses" className="btn btn-primary btn-sm">
                    Continue Learning
                  </Link>
                </div>
              </div>
            )}

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

        {isInstructor && (
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
                        style={{ marginTop: '12px', marginRight: '8px' }}
                      >
                        <Edit size={14} /> Edit
                      </Link>
                      <button 
                        onClick={(e) => handleDeleteCourse(course.id, e)}
                        className="btn btn-danger btn-sm"
                        style={{ marginTop: '12px' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
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
