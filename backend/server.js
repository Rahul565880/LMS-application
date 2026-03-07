require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'learnflow_secret_key_2024';

let pool;

const initDB = async () => {
  const connectionString = process.env.DATABASE_URL;

  try {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await pool.query('SELECT 1');
    console.log('Connected to CockroachDB!');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        avatar VARCHAR(500),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        thumbnail VARCHAR(500),
        instructor_id INTEGER NOT NULL,
        category VARCHAR(100),
        price INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT false,
        what_you_will_learn TEXT,
        requirements TEXT,
        total_duration INTEGER DEFAULT 0,
        total_lessons INTEGER DEFAULT 0,
        enrollments_count INTEGER DEFAULT 0,
        rating_average DECIMAL(3,2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        lesson_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500),
        video_id VARCHAR(100),
        duration INTEGER DEFAULT 0,
        lesson_order INTEGER DEFAULT 0,
        is_free_preview BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        UNIQUE (user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        is_completed BOOLEAN DEFAULT false,
        watched_duration INTEGER DEFAULT 0,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, course_id, lesson_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created!');
    await seedDatabase();

  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Starting in demo mode without database...');
    pool = null;
  }
};

const seedDatabase = async () => {
  if (!pool) return;

  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(result.rows[0].count) > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert instructors
    await pool.query(
      'INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5)',
      ['CodeWithHarry', 'harry@code.com', hashedPassword, 'instructor', 'Popular Python instructor']
    );

    await pool.query(
      'INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5)',
      ['Bro Code', 'bro@code.com', hashedPassword, 'instructor', 'Programming tutorials']
    );

    await pool.query(
      'INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5)',
      ['Apna College', 'apna@college.com', hashedPassword, 'instructor', 'Free education platform']
    );

    await pool.query(
      'INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5)',
      ['Evlearn', 'evlearn@course.com', hashedPassword, 'instructor', 'Django tutorials']
    );

    // Insert courses - using instructor IDs 1, 2, 3, 4
    const courses = [
      // CodeWithHarry courses (instructor 1)
      ['Python Full Course', 'python-full-course', 'Complete Python programming course by CodeWithHarry. Learn Python from scratch.', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800', 1, 'Programming', 0, true, 'Python basics|Variables|Data types|Control flow|Functions|OOP', 'No prior coding experience needed', 1],
      ['Flask Python Web Development', 'flask-python-web-dev', 'Learn Flask framework for building web applications with Python.', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800', 1, 'Backend', 0, true, 'Flask basics|Templates|Database|REST API|Deployment', 'Basic Python knowledge required', 1],

      // Bro Code courses (instructor 2)
      ['Java Programming', 'java-programming', 'Complete Java course by Bro Code. Master Java programming.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', 2, 'Programming', 0, true, 'Java basics|OOP|Collections|Multithreading|Java FX', 'Basic programming knowledge', 1],
      ['JavaScript Tutorial', 'javascript-tutorial', 'Full JavaScript tutorial by Bro Code.', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800', 2, 'Web Development', 0, true, 'JavaScript basics|DOM|Events|Async|Functions', 'Basic HTML/CSS knowledge', 1],

      // Apna College courses (instructor 3)
      ['HTML Complete Course', 'html-complete-course', 'Complete HTML course by Apna College.', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800', 3, 'Web Development', 0, true, 'HTML basics|Tags|Forms|Semantic HTML|SEO', 'No prior experience needed', 1],
      ['CSS Complete Course', 'css-complete-course', 'Complete CSS course by Apna College.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 3, 'Web Development', 0, true, 'CSS basics|selectors|flexbox|grid|animations', 'Basic HTML knowledge', 1],

      // Evlearn course (instructor 4)
      ['Django Full Course', 'django-full-course', 'Complete Django course for building Python web apps.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 4, 'Backend', 0, true, 'Django basics|Models|Views|Templates|Admin|API', 'Python knowledge required', 1]
    ];

    for (const c of courses) {
      await pool.query(
        'INSERT INTO courses (title, slug, description, thumbnail, instructor_id, category, price, is_published, what_you_will_learn, requirements, total_lessons) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        c
      );
    }

    // Insert sections (one section per course)
    const sections = [
      [1, 'Getting Started', 0],
      [2, 'Getting Started', 0],
      [3, 'Getting Started', 0],
      [4, 'Getting Started', 0],
      [5, 'Getting Started', 0],
      [6, 'Getting Started', 0],
      [7, 'Getting Started', 0]
    ];

    for (const s of sections) {
      await pool.query('INSERT INTO sections (course_id, title, lesson_order) VALUES ($1, $2, $3)', s);
    }

    // Insert lessons with YouTube links
    const lessons = [
      // Python (course 1) - CodeWithHarry
      [1, 'Python Tutorial', 'Complete Python tutorial by CodeWithHarry', 'https://youtu.be/UrsmFxEIp5k', 'UrsmFxEIp5k', 7200, 0, true],

      // Java (course 3) - Bro Code
      [2, 'Java Tutorial', 'Complete Java tutorial by Bro Code', 'https://youtu.be/xTtL8E4LzTQ', 'xTtL8E4LzTQ', 7200, 0, true],

      // HTML (course 5) - Apna College
      [3, 'HTML Tutorial', 'Complete HTML tutorial by Apna College', 'https://youtu.be/HcOc7P5BMi4', 'HcOc7P5BMi4', 7200, 0, true],

      // CSS (course 6) - Apna College
      [4, 'CSS Tutorial', 'Complete CSS tutorial by Apna College', 'https://youtu.be/ESnrn1kAD4E', 'ESnrn1kAD4E', 7200, 0, true],

      // JavaScript (course 4) - Bro Code
      [5, 'JavaScript Tutorial', 'Complete JavaScript tutorial by Bro Code', 'https://youtu.be/lfmg-EJ8gm4', 'lfmg-EJ8gm4', 7200, 0, true],

      // Flask (course 2) - CodeWithHarry
      [6, 'Flask Python Tutorial', 'Complete Flask tutorial by CodeWithHarry', 'https://youtu.be/oA8brF3w5XQ', 'oA8brF3w5XQ', 7200, 0, true],

      // Django (course 7) - Evlearn
      [7, 'Django Tutorial', 'Complete Django tutorial by Evlearn', 'https://youtu.be/D584Rm9VLLc', 'D584Rm9VLLc', 7200, 0, true]
    ];

    for (const l of lessons) {
      await pool.query(
        'INSERT INTO lessons (section_id, title, description, video_url, video_id, duration, lesson_order, is_free_preview) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        l
      );
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

// Auth routes
const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const extractSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/api/health', async (req, res) => {
  if (pool) {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'cockroachdb' });
  } else {
    res.json({ status: 'ok', database: 'demo' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (pool) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, hashedPassword, role || 'student']
      );

      const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET, { expiresIn: '30d' });
      res.json({ id: result.rows[0].id, name, email, role: role || 'student', token });
    } else {
      // Demo mode - no database connection
      console.log('Demo mode registration');
      const token = jwt.sign({ id: 'demo_' + Date.now(), name, email, role: role || 'student' }, JWT_SECRET, { expiresIn: '30d' });
      res.status(201).json({ id: 'demo_' + Date.now(), name, email, role: role || 'student', token });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (pool) {
      const users = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (users.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

      const user = users.rows[0];
      if (!await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, token });
    } else {
      // Demo mode - accept any valid-looking credentials
      console.log('Demo mode login');
      const token = jwt.sign({ id: 'demo_user', name: 'Demo User', email }, JWT_SECRET, { expiresIn: '30d' });
      res.json({ id: 'demo_user', name: 'Demo User', email, role: 'student', token });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    if (pool) {
      const users = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
      if (users.rows.length === 0) return res.status(404).json({ message: 'User not found' });
      delete users.rows[0].password;
      res.json(users.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/auth/profile', authenticate, async (req, res) => {
  const { name, avatar, bio } = req.body;
  try {
    if (pool) {
      const result = await pool.query(
        'UPDATE users SET name = $1, avatar = $2, bio = $3 WHERE id = $4 RETURNING id, name, email, avatar, bio, role',
        [name, avatar, bio, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'Profile updated', user: result.rows[0] });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses', async (req, res) => {
  const { category, search } = req.query;
  try {
    if (pool) {
      let query = 'SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar FROM courses c JOIN users u ON c.instructor_id = u.id WHERE c.is_published = true';
      let params = [];
      let paramIndex = 1;

      if (category && category !== 'all') {
        query += ` AND c.category = $${paramIndex++}`;
        params.push(category);
      }
      if (search) {
        query += ` AND c.title LIKE $${paramIndex++}`;
        params.push(`%${search}%`);
      }

      const courses = await pool.query(query, params);
      res.json(courses.rows.map(c => ({
        ...c,
        instructor: { name: c.instructor_name, avatar: c.instructor_avatar },
        rating: { average: parseFloat(c.rating_average) || 0, count: c.rating_count || 0 }
      })));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses/categories', async (req, res) => {
  try {
    if (pool) {
      const categories = await pool.query('SELECT DISTINCT category FROM courses WHERE is_published = true');
      res.json(categories.rows.map(c => c.category));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses/:slug', async (req, res) => {
  try {
    if (pool) {
      // Try by slug first, then by ID
      let courses = await pool.query(
        'SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar, u.bio as instructor_bio FROM courses c JOIN users u ON c.instructor_id = u.id WHERE c.slug = $1',
        [req.params.slug]
      );

      // If not found by slug, try by ID
      if (courses.rows.length === 0) {
        courses = await pool.query(
          'SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar, u.bio as instructor_bio FROM courses c JOIN users u ON c.instructor_id = u.id WHERE c.id = $1',
          [req.params.slug]
        );
      }

      if (courses.rows.length === 0) return res.status(404).json({ message: 'Course not found' });

      const course = courses.rows[0];
      const sections = await pool.query(
        'SELECT * FROM sections WHERE course_id = $1 ORDER BY lesson_order',
        [course.id]
      );

      for (const section of sections.rows) {
        const lessons = await pool.query(
          'SELECT * FROM lessons WHERE section_id = $1 ORDER BY lesson_order',
          [section.id]
        );
        section.lessons = lessons.rows;
      }

      res.json({
        course: {
          ...course,
          instructor: { name: course.instructor_name, avatar: course.instructor_avatar, bio: course.instructor_bio },
          rating: { average: parseFloat(course.rating_average) || 0, count: course.rating_count || 0 },
          whatYouWillLearn: course.what_you_will_learn?.split('|') || [],
          requirements: course.requirements?.split('|') || []
        },
        sections: sections.rows
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/courses/instructor/courses', authenticate, async (req, res) => {
  try {
    if (pool) {
      const courses = await pool.query('SELECT * FROM courses WHERE instructor_id = $1', [req.userId]);
      res.json(courses.rows);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/courses', authenticate, async (req, res) => {
  try {
    if (pool) {
      const slug = extractSlug(req.body.title);
      const result = await pool.query(
        'INSERT INTO courses (title, slug, description, thumbnail, instructor_id, category, price, is_published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [req.body.title, slug, req.body.description, req.body.thumbnail, req.userId, req.body.category, req.body.price || 0, false]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/courses/:id', authenticate, async (req, res) => {
  try {
    if (pool) {
      await pool.query(
        'UPDATE courses SET title = $1, description = $2, category = $3, price = $4, thumbnail = $5 WHERE id = $6 AND instructor_id = $7',
        [req.body.title, req.body.description, req.body.category, req.body.price, req.body.thumbnail, req.params.id, req.userId]
      );
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/courses/:id', authenticate, async (req, res) => {
  try {
    if (pool) {
      // Check if user is admin or instructor
      const user = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
      const isAdmin = user.rows[0]?.role === 'admin';
      
      if (isAdmin) {
        await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
      } else {
        await pool.query('DELETE FROM courses WHERE id = $1 AND instructor_id = $2', [req.params.id, req.userId]);
      }
      res.json({ message: 'Course deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/courses/:id/sections', authenticate, async (req, res) => {
  try {
    if (pool) {
      const count = await pool.query('SELECT COUNT(*) as cnt FROM sections WHERE course_id = $1', [req.params.id]);
      const result = await pool.query(
        'INSERT INTO sections (course_id, title, lesson_order) VALUES ($1, $2, $3) RETURNING *',
        [req.params.id, req.body.title, parseInt(count.rows[0].cnt)]
      );
      res.status(201).json({ ...result.rows[0], lessons: [] });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/courses/sections/:sectionId', authenticate, async (req, res) => {
  try {
    if (pool) {
      await pool.query('DELETE FROM sections WHERE id = $1', [req.params.sectionId]);
      res.json({ message: 'Section deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/courses/sections/:sectionId/lessons', authenticate, async (req, res) => {
  try {
    if (pool) {
      const count = await pool.query('SELECT COUNT(*) as cnt FROM lessons WHERE section_id = $1', [req.params.sectionId]);
      const videoId = extractVideoId(req.body.videoUrl) || '';
      const result = await pool.query(
        'INSERT INTO lessons (section_id, title, description, video_url, video_id, duration, lesson_order, is_free_preview) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [req.params.sectionId, req.body.title, req.body.description, req.body.videoUrl, videoId, req.body.duration || 0, parseInt(count.rows[0].cnt), req.body.isFreePreview || false]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/courses/lessons/:lessonId', authenticate, async (req, res) => {
  try {
    if (pool) {
      await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.lessonId]);
      res.json({ message: 'Lesson deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/enrollments/:courseId', authenticate, async (req, res) => {
  try {
    if (pool) {
      // Check if already enrolled
      const existing = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [req.userId, req.params.courseId]
      );
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }
      
      // Check if course exists
      const course = await pool.query('SELECT id FROM courses WHERE id = $1', [req.params.courseId]);
      if (course.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      const result = await pool.query(
        'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *',
        [req.userId, req.params.courseId]
      );
      await pool.query('UPDATE courses SET enrollments_count = enrollments_count + 1 WHERE id = $1', [req.params.courseId]);
      res.status(201).json(result.rows[0]);
    } else {
      res.status(500).json({ message: 'Database not connected' });
    }
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/enrollments/my', authenticate, async (req, res) => {
  try {
    if (pool) {
      const enrollments = await pool.query(
        'SELECT e.*, c.title, c.thumbnail, c.category, c.total_lessons, u.name as instructor_name FROM enrollments e JOIN courses c ON e.course_id = c.id JOIN users u ON c.instructor_id = u.id WHERE e.user_id = $1 AND e.is_active = true',
        [req.userId]
      );

      for (const e of enrollments.rows) {
        const completed = await pool.query(
          'SELECT COUNT(*) as cnt FROM progress WHERE user_id = $1 AND course_id = $2 AND is_completed = true',
          [req.userId, e.course_id]
        );
        e.progress = e.total_lessons > 0 ? Math.round((parseInt(completed.rows[0].cnt) / e.total_lessons) * 100) : 0;
        e.completedLessons = parseInt(completed.rows[0].cnt);
        e.course = { id: e.course_id, title: e.title, thumbnail: e.thumbnail, instructor: { name: e.instructor_name } };
      }
      res.json(enrollments.rows);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/enrollments/:courseId/status', authenticate, async (req, res) => {
  try {
    if (pool) {
      const enrollments = await pool.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [req.userId, req.params.courseId]
      );
      res.json({ isEnrolled: enrollments.rows.length > 0, enrollment: enrollments.rows[0] || null });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/enrollments/:courseId/check', async (req, res) => {
  res.json({ isEnrolled: false, canEnroll: true });
});

app.post('/api/progress/lesson/:lessonId', authenticate, async (req, res) => {
  try {
    if (pool) {
      const lessons = await pool.query('SELECT s.course_id FROM lessons l JOIN sections s ON l.section_id = s.id WHERE l.id = $1', [req.params.lessonId]);
      if (lessons.rows.length === 0) return res.status(404).json({ message: 'Lesson not found' });

      const courseId = lessons.rows[0].course_id;

      try {
        await pool.query(
          'INSERT INTO progress (user_id, course_id, lesson_id, is_completed, completed_at) VALUES ($1, $2, $3, true, NOW())',
          [req.userId, courseId, req.params.lessonId]
        );
      } catch (e) {
        await pool.query(
          'UPDATE progress SET is_completed = true, completed_at = NOW() WHERE user_id = $1 AND lesson_id = $2',
          [req.userId, req.params.lessonId]
        );
      }

      const total = await pool.query('SELECT COUNT(*) as cnt FROM lessons l JOIN sections s ON l.section_id = s.id WHERE s.course_id = $1', [courseId]);
      const completed = await pool.query('SELECT COUNT(*) as cnt FROM progress WHERE user_id = $1 AND course_id = $2 AND is_completed = true', [req.userId, courseId]);

      res.json({
        completedLessons: parseInt(completed.rows[0].cnt),
        totalLessons: parseInt(total.rows[0].cnt),
        progressPercentage: Math.round((parseInt(completed.rows[0].cnt) / parseInt(total.rows[0].cnt)) * 100),
        isCompleted: true
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/progress/course/:courseId', authenticate, async (req, res) => {
  try {
    if (pool) {
      const sections = await pool.query(
        'SELECT * FROM sections WHERE course_id = $1 ORDER BY lesson_order',
        [req.params.courseId]
      );

      const completed = await pool.query(
        'SELECT lesson_id FROM progress WHERE user_id = $1 AND course_id = $2 AND is_completed = true',
        [req.userId, req.params.courseId]
      );

      const completedIds = completed.rows.map(p => p.lesson_id);
      let totalLessons = 0;

      for (const section of sections.rows) {
        const lessons = await pool.query('SELECT * FROM lessons WHERE section_id = $1 ORDER BY lesson_order', [section.id]);
        section.lessons = lessons.rows.map(l => ({ ...l, isCompleted: completedIds.includes(l.id) }));
        totalLessons += lessons.rows.length;
      }

      res.json({
        sections: sections.rows,
        totalLessons,
        completedCount: completedIds.length,
        progressPercentage: totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0,
        lastWatched: completedIds[completedIds.length - 1] || null
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/progress/lesson/:lessonId', authenticate, async (req, res) => {
  try {
    if (pool) {
      const progress = await pool.query(
        'SELECT * FROM progress WHERE user_id = $1 AND lesson_id = $2',
        [req.userId, req.params.lessonId]
      );
      res.json({ isCompleted: progress.rows[0]?.is_completed || false, watchedDuration: progress.rows[0]?.watched_duration || 0 });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
