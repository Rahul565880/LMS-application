import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService, progressService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check, ChevronLeft, ChevronRight, Play, CheckCircle } from 'lucide-react';

const Learning = () => {
  const { slug, lessonId } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    courseService.getCourseBySlug(slug)
      .then(res => {
        setCourse(res.data.course);
        setSections(res.data.sections || []);
        
        const allLessons = (res.data.sections || []).flatMap(s => s.lessons || []);
        
        // Find current lesson
        let lesson = allLessons.find(l => String(l._id || l.id) === String(lessonId));
        if (!lesson && allLessons.length > 0) {
          lesson = allLessons[0];
        }
        setCurrentLesson(lesson);

        // Get progress if logged in
        if (user) {
          progressService.getCourseProgress(slug).then(progressRes => {
            const completed = [];
            (res.data.sections || []).forEach(s => {
              (s.lessons || []).forEach(l => {
                const lId = l._id || l.id;
                if (progressRes.data.sections) {
                  progressRes.data.sections.forEach(ps => {
                    const cl = ps.lessons?.find(cl => (cl._id || cl.id) === lId && cl.isCompleted);
                    if (cl) completed.push(lId);
                  });
                }
              });
            });
            setCompletedLessons(completed);
          }).catch(() => {});
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load course');
      })
      .finally(() => setLoading(false));
  }, [slug, lessonId, user]);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>{error}</h2>
        <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
      </div>
    );
  }

  const allLessons = sections.flatMap(s => s.lessons || []);
  
  if (!currentLesson || allLessons.length === 0) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>No lessons available</h2>
        <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
      </div>
    );
  }

  const videoId = currentLesson?.videoId || currentLesson?.video_id || '';
  const cleanVideoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');

  const currentIndex = allLessons.findIndex(l => String(l._id || l.id) === String(currentLesson?._id || currentLesson?.id));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const progressPercentage = allLessons.length > 0 ? Math.round((completedLessons.length / allLessons.length) * 100) : 0;
  const isCompleted = completedLessons.includes(currentLesson._id || currentLesson.id);

  const handleMarkComplete = async () => {
    try {
      await progressService.markLessonComplete(currentLesson._id || currentLesson.id);
      const currId = currentLesson._id || currentLesson.id;
      if (!completedLessons.includes(currId)) {
        setCompletedLessons([...completedLessons, currId]);
      }
      if (nextLesson) {
        window.location.href = `/learn/${slug}/lesson/${nextLesson._id || nextLesson.id}`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="learning-page">
      <div className="learning-container">
        <div className="learning-main">
          <div className="video-container">
            {cleanVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${cleanVideoId}?autoplay=1&rel=0`}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ padding: '50px', textAlign: 'center', background: '#333', color: '#fff' }}>
                No video available
              </div>
            )}
          </div>

          <div className="learning-content">
            <h1>{currentLesson.title}</h1>
            <p>{currentLesson.description || 'Watch the video to complete this lesson.'}</p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {prevLesson ? (
                <Link to={`/learn/${slug}/lesson/${prevLesson._id || prevLesson.id}`} className="btn btn-secondary">
                  <ChevronLeft size={18} /> Previous
                </Link>
              ) : (
                <button className="btn btn-secondary" disabled>Previous</button>
              )}

              <button className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`} onClick={handleMarkComplete}>
                <Check size={18} /> {isCompleted ? 'Completed' : 'Mark Complete'}
              </button>

              {nextLesson ? (
                <Link to={`/learn/${slug}/lesson/${nextLesson._id || nextLesson.id}`} className="btn btn-secondary">
                  Next <ChevronRight size={18} />
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-primary">
                  Finish <ChevronRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="learning-sidebar">
          <div className="learning-sidebar-header">
            <h2>{course.title}</h2>
            <p>{completedLessons.length} of {allLessons.length} completed ({progressPercentage}%)</p>
          </div>

          <div className="lesson-list">
            {sections.map(section => (
              <div key={section.id} className="lesson-section">
                <div className="lesson-section-title">{section.title}</div>
                {(section.lessons || []).map(lesson => {
                  const lid = lesson._id || lesson.id;
                  const isActive = String(lid) === String(currentLesson?._id || currentLesson?.id);
                  const isDone = completedLessons.includes(lid);

                  return (
                    <Link
                      key={lid}
                      to={`/learn/${slug}/lesson/${lid}`}
                      className={`lesson-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                    >
                      <div className="lesson-item-status">
                        {isDone && <Check size={12} color="white" />}
                        {isActive && !isDone && <Play size={12} color="white" />}
                      </div>
                      <span className="lesson-item-title">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
