import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash, Save, ArrowLeft } from 'lucide-react';

const CreateCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(!!courseId);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    thumbnail: '',
    whatYouWillLearn: [''],
    requirements: ['']
  });
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    videoUrl: '',
    isFreePreview: false
  });
  const [showLessonModal, setShowLessonModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      navigate('/');
      return;
    }

    if (courseId) {
      courseService.getCourseBySlug(courseId)
        .then(res => {
          setCourse({
            title: res.data.course.title,
            description: res.data.course.description,
            category: res.data.course.category,
            price: res.data.course.price,
            thumbnail: res.data.course.thumbnail,
            whatYouWillLearn: res.data.course.whatYouWillLearn?.length ? res.data.course.whatYouWillLearn : [''],
            requirements: res.data.course.requirements?.length ? res.data.course.requirements : ['']
          });
          setSections(res.data.sections);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [courseId, user, navigate]);

  const handleCourseChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      let courseData = {
        ...course,
        whatYouWillLearn: course.whatYouWillLearn.filter(i => i),
        requirements: course.requirements.filter(i => i),
        isPublished: true
      };

      if (courseId) {
        await courseService.updateCourse(courseId, courseData);
      } else {
        const res = await courseService.createCourse(courseData);
        navigate(`/instructor/edit-course/${res.data.id}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim() || !courseId) return;
    
    try {
      const res = await courseService.addSection(courseId, { title: newSectionTitle });
      setSections([...sections, res.data]);
      setNewSectionTitle('');
      setShowSectionModal(false);
      setActiveSection(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (sectionId) => {
    if (!newLesson.title.trim() || !newLesson.videoUrl.trim()) return;
    
    try {
      const res = await courseService.addLesson(sectionId, newLesson);
      
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, lessons: [...(s.lessons || []), res.data] };
        }
        return s;
      }));
      
      setNewLesson({ title: '', videoUrl: '', isFreePreview: false });
      setShowLessonModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this section and all its lessons?')) return;
    
    try {
      await courseService.deleteSection(sectionId);
      setSections(sections.filter(s => s.id !== sectionId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (sectionId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    
    try {
      await courseService.deleteLesson(lessonId);
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) };
        }
        return s;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!courseId) {
    return (
      <div className="create-course">
        <h1>Create New Course</h1>
        <form className="create-course-form" onSubmit={(e) => { e.preventDefault(); handleSaveCourse(); }}>
          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              className="input"
              placeholder="e.g., Complete Python Mastery"
              value={course.title}
              onChange={handleCourseChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="input"
              placeholder="Describe what students will learn..."
              rows={4}
              value={course.description}
              onChange={handleCourseChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                className="input"
                placeholder="e.g., Programming"
                value={course.category}
                onChange={handleCourseChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Price (in cents)</label>
              <input
                type="number"
                name="price"
                className="input"
                placeholder="0 for free"
                value={course.price}
                onChange={handleCourseChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              name="thumbnail"
              className="input"
              placeholder="https://..."
              value={course.thumbnail}
              onChange={handleCourseChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="create-course">
        <div className="skeleton" style={{ height: 400 }}></div>
      </div>
    );
  }

  return (
    <div className="create-course" style={{ maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Link to="/dashboard" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1>Edit Course: {course.title}</h1>
        </div>
        <button className="btn btn-primary" onClick={handleSaveCourse} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40 }}>
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Course Content</h3>
            
            {sections.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No sections yet. Add a section to start adding lessons.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {sections.map((section, idx) => (
                  <div key={section.id} style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 12, 
                    overflow: 'hidden' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 16px', 
                      background: 'var(--dark-surface-2)' 
                    }}>
                      <span style={{ fontWeight: 600 }}>Section {idx + 1}: {section.title}</span>
                      <button 
                        onClick={() => handleDeleteSection(section.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                    <div style={{ padding: 12 }}>
                      {section.lessons?.map((lesson, lIdx) => (
                        <div key={lesson.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: 8,
                          marginBottom: 8,
                          background: 'var(--dark-surface)'
                        }}>
                          <span>{lIdx + 1}. {lesson.title}</span>
                          <button 
                            onClick={() => handleDeleteLesson(section.id, lesson.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <Plus size={14} /> Add Lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => setShowSectionModal(true)}
            >
              <Plus size={18} /> Add Section
            </button>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Course Details</h3>
            <form className="create-course-form" onSubmit={(e) => { e.preventDefault(); handleSaveCourse(); }}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  className="input"
                  value={course.title}
                  onChange={handleCourseChange}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="input"
                  rows={3}
                  value={course.description}
                  onChange={handleCourseChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    className="input"
                    value={course.category}
                    onChange={handleCourseChange}
                  />
                </div>
                <div className="form-group">
                  <label>Price (cents)</label>
                  <input
                    type="number"
                    name="price"
                    className="input"
                    value={course.price}
                    onChange={handleCourseChange}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showSectionModal && (
        <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Section</h3>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Section Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Getting Started"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowSectionModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddSection}>Add Section</button>
            </div>
          </div>
        </div>
      )}

      {activeSection && !showLessonModal && (
        <div className="modal-overlay" onClick={() => setActiveSection(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Lesson</h3>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Lesson Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Introduction"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>YouTube URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newLesson.isFreePreview}
                  onChange={(e) => setNewLesson({ ...newLesson, isFreePreview: e.target.checked })}
                />
                Free Preview
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setActiveSection(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { handleAddLesson(activeSection); }}>Add Lesson</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
