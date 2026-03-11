import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../services/api';
import { Search, Clock, Video, Star } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    courseService.getCategories()
      .then(res => setCategories(['all', ...res.data]))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (search) params.search = search;

    courseService.getCourses(params)
      .then(res => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory, search]);

  return (
    <section className="courses-section">
      <div className="container">
        <div className="courses-header">
          <div>
            <h1 className="section-title">Explore Courses</h1>
            <p className="section-subtitle">Find the perfect course to learn new skills</p>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="courses-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 180 }}></div>
                <div style={{ padding: 20 }}>
                  <div className="skeleton" style={{ height: 24, marginBottom: 12 }}></div>
                  <div className="skeleton" style={{ height: 16, width: '60%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-3">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} />
            <h3>No courses found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>
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
          {course.instructor?.avatar ? (
            <img src={course.instructor.avatar} alt={course.instructor.name} />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)' }}></div>
          )}
          <span>{course.instructor?.name || 'Instructor'}</span>
        </div>
        <div className="course-card-meta">
          <span><Video size={14} /> {course.totalLessons} lessons</span>
          <span><Clock size={14} /> {Math.floor(course.totalDuration / 60)}h</span>
          {course.rating?.count > 0 && (
            <span><Star size={14} style={{ color: 'var(--accent)' }} /> {course.rating.average.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Courses;
