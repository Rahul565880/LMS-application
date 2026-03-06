import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService, enrollmentService, progressService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Play, Clock, Users, BookOpen, Check, ChevronDown, ChevronUp, Lock, PlayCircle } from 'lucide-react';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    courseService.getCourseBySlug(slug)
      .then(res => {
        setCourse(res.data.course);
        setSections(res.data.sections);
        const expanded = {};
        res.data.sections.forEach((s) => { expanded[s.id] = true; }); // All sections expanded by default
        setExpandedSections(expanded);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (user && course) {
      const courseId = course._id || course.id;
      enrollmentService.getEnrollmentStatus(courseId)
        .then(res => setIsEnrolled(res.data.isEnrolled))
        .catch(err => console.error(err));
    }
  }, [user, course]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const courseId = course._id || course.id;
    console.log('Enrolling - Course ID:', courseId);
    
    // First try to enroll
    try {
      await enrollmentService.enrollInCourse(courseId);
      console.log('Enrolled successfully!');
      setIsEnrolled(true);
    } catch (err) {
      console.log('Enrollment response:', err.response);
      // If already enrolled, just set isEnrolled to true
      if (err.response?.status === 400 || err.response?.data?.message?.includes('Already enrolled')) {
        setIsEnrolled(true);
      } else {
        alert('Error: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="skeleton" style={{ height: 400, marginBottom: 40 }}></div>
        <div className="skeleton" style={{ height: 200 }}></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Course not found</h3>
          <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
        </div>
      </div>
    );
  }

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const firstLesson = sections[0]?.lessons?.[0];
  const firstLessonId = firstLesson?._id || firstLesson?.id;

  return (
    <div className="course-detail">
      <div className="container">
        <div className="course-detail-header">
          <div className="course-detail-main">
            <span className="badge badge-primary">{course.category}</span>
            <h1>{course.title}</h1>
            <p className="description">{course.description}</p>
            <div className="course-detail-main .meta">
              <div className="course-meta-item">
                <Users size={18} />
                <span>{course.enrollmentsCount} students enrolled</span>
              </div>
              <div className="course-meta-item">
                <Play size={18} />
                <span>{totalLessons} lessons</span>
              </div>
              <div className="course-meta-item">
                <Clock size={18} />
                <span>{Math.floor(course.totalDuration / 60)} hours</span>
              </div>
              <div className="course-meta-item">
                <BookOpen size={18} />
                <span>Created by {course.instructor?.name}</span>
              </div>
            </div>
          </div>

          <div className="course-detail-sidebar">
            <img src={course.thumbnail} alt={course.title} />
            <div className="price">
              {course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
            </div>
            
            {isEnrolled ? (
              <>
                <Link to={`/learn/${course.slug}/lesson/${firstLessonId}`} className="btn btn-primary enroll-btn">
                  <PlayCircle size={20} />
                  Start Learning
                </Link>
              </>
            ) : (
              <button 
                className="btn btn-primary enroll-btn" 
                onClick={handleEnroll}
              >
                {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
              </button>
            )}
            
            {firstLesson && (
              <Link 
                to={`/courses/${course.slug}`} 
                className="btn btn-secondary preview-btn"
                onClick={(e) => {
                  e.preventDefault();
                  const courseId = course._id || course.id;
                  if (user) {
                    enrollmentService.checkEnrollment(courseId)
                      .then(res => {
                        if (res.data.isEnrolled && firstLesson) {
                          navigate(`/learn/${course.slug}/lesson/${firstLessonId}`);
                        } else {
                          alert('Please enroll to access the full course');
                        }
                      });
                  } else {
                    navigate('/login');
                  }
                }}
              >
                <Play size={18} />
                Preview Course
              </Link>
            )}
          </div>
        </div>

        <div className="course-detail-content">
          {course.whatYouWillLearn?.length > 0 && (
            <div className="content-section">
              <h2>What you'll learn</h2>
              <ul className="learn-list">
                {course.whatYouWillLearn.map((item, i) => (
                  <li key={i}>
                    <Check size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="content-section">
            <h2>Course Content</h2>
            <div className="curriculum">
              {sections.map((section, idx) => (
                <div key={section.id} className="curriculum-section">
                  <div 
                    className="curriculum-section-header" 
                    onClick={() => toggleSection(section.id)}
                  >
                    <h3>{section.title}</h3>
                    <span>
                      {section.lessons?.length || 0} lessons
                      {expandedSections[section.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                  {expandedSections[section.id] && section.lessons?.length > 0 && (
                    <div className="curriculum-lessons">
                      {section.lessons.map(lesson => (
                        <div 
                          key={lesson._id} 
                          className="curriculum-lesson" 
                          onClick={() => {
                            if (isEnrolled || lesson.isFreePreview) {
                              navigate(`/learn/${course.slug}/lesson/${lesson._id}`);
                            } else {
                              alert('Please enroll to watch this lesson');
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <Play size={16} />
                          <span>{lesson.title}</span>
                          {lesson.isFreePreview && <span className="badge badge-success">Preview</span>}
                          <span className="duration">
                            {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
