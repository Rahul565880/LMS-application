import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentService, courseService } from '../services/api';
import { BookOpen, Clock, Users, Play, LayoutDashboard, GraduationCap, Trash2, Edit, TrendingUp, Award, Target, Timer, BarChart3, Zap } from 'lucide-react';

const CircularProgress = ({ progress, size = 100, label }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="circular-progress-wrapper">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="circular-progress-label">
        <span className="progress-value">{progress}%</span>
        {label && <span className="progress-label">{label}</span>}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
  <div className="stat-card-analytics">
    <div className="stat-icon" style={{ background: color ? `${color}15` : 'var(--dark-surface-2)' }}>
      <Icon size={20} style={{ color: color || 'var(--primary)' }} />
    </div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {subValue && <span className="stat-sub">{subValue}</span>}
    </div>
  </div>
);

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

  const totalLessonsCompleted = enrollments.reduce((acc, e) => acc + (e.completedLessons || 0), 0);
  const totalLessons = enrollments.reduce((acc, e) => acc + (e.totalLessons || 0), 0);
  const overallProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const estimatedHours = Math.round((totalLessonsCompleted * 15) / 60);
  const quizScore = 75;

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
            <div className="analytics-header">
              <h2><BarChart3 size={24} /> Progress Analytics</h2>
            </div>

            <div className="analytics-grid">
              <StatCard 
                icon={Target} 
                label="Course Completion" 
                value={`${overallProgress}%`}
                subValue={`${completedCourses} of ${enrollments.length} courses`}
                color="#1a1a1a"
              />
              <StatCard 
                icon={Zap} 
                label="Quiz Performance" 
                value={`${quizScore}%`}
                subValue="Average score"
                color="#059669"
              />
              <StatCard 
                icon={Timer} 
                label="Time Spent Learning" 
                value={`${estimatedHours}h`}
                subValue={`${totalLessonsCompleted} lessons completed`}
                color="#7c3aed"
              />
              <StatCard 
                icon={Award} 
                label="Courses Completed" 
                value={completedCourses}
                subValue={`${inProgressCourses} in progress`}
                color="#dc2626"
              />
            </div>

            {enrollments.length > 0 && (
              <div className="progress-overview-card">
                <div className="progress-overview-left">
                  <CircularProgress 
                    progress={overallProgress}
                    label="Overall"
                  />
                </div>
                <div className="progress-overview-right">
                  <h3><TrendingUp size={20} /> Learning Progress</h3>
                  <p>You've completed {completedCourses} of {enrollments.length} courses</p>
                  <div className="progress-stats-mini">
                    <div className="progress-stat-mini">
                      <Award size={16} />
                      <span>{completedCourses} Completed</span>
                    </div>
                    <div className="progress-stat-mini">
                      <BookOpen size={16} />
                      <span>{inProgressCourses} In Progress</span>
                    </div>
                    <div className="progress-stat-mini">
                      <Clock size={16} />
                      <span>{estimatedHours}h Learning</span>
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
