require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Seeding with embeddable YouTube videos...');

        await pool.query('DELETE FROM progress');
        await pool.query('DELETE FROM enrollments');
        await pool.query('DELETE FROM lessons');
        await pool.query('DELETE FROM sections');
        await pool.query('DELETE FROM courses');
        await pool.query('DELETE FROM users');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const i1 = await pool.query('INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5) RETURNING id', ['CodeWithHarry', 'harry@code.com', hashedPassword, 'instructor', 'Popular Python instructor']);
        const i2 = await pool.query('INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5) RETURNING id', ['Bro Code', 'bro@code.com', hashedPassword, 'instructor', 'Programming tutorials']);
        const i3 = await pool.query('INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5) RETURNING id', ['Apna College', 'apna@college.com', hashedPassword, 'instructor', 'Free education platform']);
        const i4 = await pool.query('INSERT INTO users (name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5) RETURNING id', ['Telusko', 'telusko@course.com', hashedPassword, 'instructor', 'Programming tutorials']);

        const courses = [
            {
                title: 'Python Programming',
                slug: 'python-programming',
                description: 'Learn Python programming from scratch.',
                thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
                instructorId: i1.rows[0].id,
                category: 'Programming',
                price: 499,
                whatYouWillLearn: 'Python basics|Variables|Data types|Control flow|Functions|OOP',
                requirements: 'No prior coding experience needed',
                sections: [
                    {
                        title: 'Python Basics',
                        lessons: [
                            { title: 'What is Python?', videoId: 'rfscVS0vtbw', duration: 600 },
                            { title: 'Install Python', videoId: 'CVv3s84o330', duration: 720 },
                            { title: 'First Program', videoId: 'ntlbtL4t6K4', duration: 480 },
                            { title: 'Variables', videoId: 'C3IZ5xB7jdU', duration: 900 },
                            { title: 'Data Types', videoId: 'GHf7NpPE--k', duration: 840 }
                        ]
                    },
                    {
                        title: 'Control Flow',
                        lessons: [
                            { title: 'If Else', videoId: 'Zp5MuPOtsSY', duration: 720 },
                            { title: 'While Loop', videoId: 'D0Nb2NsSdcg', duration: 660 },
                            { title: 'For Loop', videoId: 'wxEu10mQWZw', duration: 540 },
                            { title: 'Functions', videoId: 'o0-LYHjXq1U', duration: 900 },
                            { title: 'Lists', videoId: 'N6u44l7etaE', duration: 780 }
                        ]
                    },
                    {
                        title: 'Advanced',
                        lessons: [
                            { title: 'Dictionaries', videoId: 'Ua8X7nWdJDs', duration: 840 },
                            { title: 'OOP', videoId: 'qiSCMNBjCro', duration: 1200 },
                            { title: 'File Handling', videoId: 'eyiwMi4xI4Q', duration: 720 },
                            { title: 'Exception', videoId: 'SpLqs3t6e4w', duration: 660 },
                            { title: 'Practice', videoId: 'QbPMp2zCylw', duration: 900 }
                        ]
                    }
                ]
            },
            {
                title: 'Java Programming',
                slug: 'java-programming',
                description: 'Master Java programming.',
                thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
                instructorId: i2.rows[0].id,
                category: 'Programming',
                price: 599,
                whatYouWillLearn: 'Java basics|OOP|Collections|Exception Handling',
                requirements: 'Basic programming knowledge',
                sections: [
                    {
                        title: 'Java Basics',
                        lessons: [
                            { title: 'Intro to Java', videoId: 'xTtL8E4LzTQ', duration: 600 },
                            { title: 'Install JDK', videoId: 'rLs9DcjZ-jg', duration: 720 },
                            { title: 'First Program', videoId: 'U4q8tFkFtdQ', duration: 480 },
                            { title: 'Variables', videoId: 'w4Gt2T3HmTU', duration: 660 },
                            { title: 'Data Types', videoId: '7g7VVNT4J9M', duration: 720 }
                        ]
                    },
                    {
                        title: 'Control Statements',
                        lessons: [
                            { title: 'If Else', videoId: 'qOqpPWMqz9g', duration: 600 },
                            { title: 'Switch', videoId: 'yE-FUqqXQ9Q', duration: 540 },
                            { title: 'Loops', videoId: 'K3UaP4b1H4E', duration: 660 },
                            { title: 'Arrays', videoId: 'FqHJp7V4JGw', duration: 840 },
                            { title: 'Methods', videoId: '2Z1XW5Qw0vI', duration: 720 }
                        ]
                    },
                    {
                        title: 'OOP',
                        lessons: [
                            { title: 'Classes', videoId: '8yjkWGRb8kA', duration: 900 },
                            { title: 'Inheritance', videoId: 'K_1kP5tJzIY', duration: 840 },
                            { title: 'Polymorphism', videoId: 'N2uR4uLQ3dE', duration: 780 },
                            { title: 'Interface', videoId: 'Y_X4U4sX8L4', duration: 900 },
                            { title: 'Practice', videoId: 'nq2_B9C-BuY', duration: 600 }
                        ]
                    }
                ]
            },
            {
                title: 'HTML Tutorial',
                slug: 'html-tutorial',
                description: 'Learn HTML for web development.',
                thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
                instructorId: i3.rows[0].id,
                category: 'Web Development',
                price: 399,
                whatYouWillLearn: 'HTML basics|Tags|Forms|Semantic HTML',
                requirements: 'No prior experience needed',
                sections: [
                    {
                        title: 'HTML Basics',
                        lessons: [
                            { title: 'What is HTML?', videoId: 'HcOc7P5BMi4', duration: 720 },
                            { title: 'Structure', videoId: 'M6Cux2K2cTk', duration: 660 },
                            { title: 'Headings', videoId: 'k3jmWu4q6QE', duration: 540 },
                            { title: 'Paragraphs', videoId: 'bOKU2R8N4nU', duration: 600 },
                            { title: 'Links', videoId: 'YW2qwJ4g7hU', duration: 720 }
                        ]
                    },
                    {
                        title: 'HTML Elements',
                        lessons: [
                            { title: 'Lists', videoId: 'N2X2fLLkYB4', duration: 480 },
                            { title: 'Tables', videoId: 'c6NTQyC5bZM', duration: 660 },
                            { title: 'Forms', videoId: 'Qsb9pQhI3t8', duration: 900 },
                            { title: 'Inputs', videoId: 'Ydv5XaaZ4lE', duration: 780 },
                            { title: 'Semantic', videoId: 'MODuFzC78R4', duration: 600 }
                        ]
                    },
                    {
                        title: 'Practice',
                        lessons: [
                            { title: 'Project 1', videoId: 'Y4G6NqdC7eI', duration: 720 },
                            { title: 'Project 2', videoId: 'HsWd5LvL6IQ', duration: 540 },
                            { title: 'HTML5 Features', videoId: 'MD5vZzCjCq4', duration: 660 },
                            { title: 'SEO Basics', videoId: 'XpU5nCqBfZQ', duration: 600 },
                            { title: 'Final Project', videoId: 'u2OgG7r61jU', duration: 900 }
                        ]
                    }
                ]
            },
            {
                title: 'CSS Tutorial',
                slug: 'css-tutorial',
                description: 'Learn CSS for styling websites.',
                thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
                instructorId: i3.rows[0].id,
                category: 'Web Development',
                price: 449,
                whatYouWillLearn: 'CSS basics|selectors|flexbox|grid|animations',
                requirements: 'Basic HTML knowledge',
                sections: [
                    {
                        title: 'CSS Basics',
                        lessons: [
                            { title: 'Intro to CSS', videoId: 'ESnrn1kAD4E', duration: 720 },
                            { title: 'Selectors', videoId: 'c3QkFHBqVcM', duration: 660 },
                            { title: 'Colors', videoId: 's7BbaKwbZw4', duration: 540 },
                            { title: 'Box Model', videoId: 'MeZbFjY6DxY', duration: 600 },
                            { title: 'Text Style', videoId: 'spK5qFzj2aQ', duration: 480 }
                        ]
                    },
                    {
                        title: 'Layout',
                        lessons: [
                            { title: 'Display', videoId: 'xL4piM3XU8U', duration: 660 },
                            { title: 'Flexbox', videoId: 'SS-mFx7gL6I', duration: 900 },
                            { title: 'Grid', videoId: '68jjaL9wJ7A', duration: 840 },
                            { title: 'Position', videoId: 'M7lc1UVf-VE', duration: 720 },
                            { title: 'Responsive', videoId: 'z2KuG9W8P6Q', duration: 780 }
                        ]
                    },
                    {
                        title: 'Advanced',
                        lessons: [
                            { title: 'Animations', videoId: 'Y8888jVYk6A', duration: 720 },
                            { title: 'Transitions', videoId: 'NLoNierLu8E', duration: 540 },
                            { title: 'Variables', videoId: 'J4G6NqdC7eI', duration: 480 },
                            { title: 'Media Queries', videoId: 'z2KuG9W8P6Q', duration: 600 },
                            { title: 'Portfolio', videoId: 'X8H5xN5b5N8', duration: 1500 }
                        ]
                    }
                ]
            },
            {
                title: 'JavaScript Tutorial',
                slug: 'javascript-tutorial',
                description: 'Learn JavaScript for web development.',
                thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
                instructorId: i2.rows[0].id,
                category: 'Web Development',
                price: 449,
                whatYouWillLearn: 'JavaScript basics|DOM|Events|Async|Functions',
                requirements: 'Basic HTML/CSS knowledge',
                sections: [
                    {
                        title: 'JS Basics',
                        lessons: [
                            { title: 'Intro to JS', videoId: 'lfmg-EJ8gm4', duration: 720 },
                            { title: 'Variables', videoId: '9kKs8tHJD4U', duration: 660 },
                            { title: 'Operators', videoId: 'K1ibB7jaswc', duration: 540 },
                            { title: 'Control Flow', videoId: '6P-pxS7tS3Q', duration: 600 },
                            { title: 'Functions', videoId: 'FOD408a0EzU', duration: 780 }
                        ]
                    },
                    {
                        title: 'DOM',
                        lessons: [
                            { title: 'DOM Intro', videoId: '0L6L8aR7aWw', duration: 660 },
                            { title: 'Select Elements', videoId: 'l4VhT4rXjWw', duration: 540 },
                            { title: 'Modify DOM', videoId: 'X6F4q3N8H4Y', duration: 600 },
                            { title: 'Events', videoId: 'K4guqF4R7g', duration: 720 },
                            { title: 'Event Listener', videoId: 'M2N0K7Z5P8W', duration: 660 }
                        ]
                    },
                    {
                        title: 'Advanced',
                        lessons: [
                            { title: 'Arrays', videoId: 'oigfaZ5ApsM', duration: 840 },
                            { title: 'Objects', videoId: '4L4CvL3E2N8', duration: 780 },
                            { title: 'Async JS', videoId: 'PoRJizFvM7s', duration: 900 },
                            { title: 'Promises', videoId: 'v3h-znKjvUk', duration: 720 },
                            { title: 'Fetch API', videoId: 'wI1C7Y6K7xQ', duration: 840 }
                        ]
                    }
                ]
            },
            {
                title: 'Django Tutorial',
                slug: 'django-tutorial',
                description: 'Learn Django for web development.',
                thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
                instructorId: i4.rows[0].id,
                category: 'Backend',
                price: 449,
                whatYouWillLearn: 'Django basics|Models|Views|Templates|Admin',
                requirements: 'Python knowledge required',
                sections: [
                    {
                        title: 'Getting Started',
                        lessons: [
                            { title: 'Intro Django', videoId: 'D584Rm9VLLc', duration: 720 },
                            { title: 'Install Django', videoId: 'F6M8N7K6J5', duration: 660 },
                            { title: 'Project Setup', videoId: 'G5K6L7M8H4', duration: 600 },
                            { title: 'App Creation', videoId: 'H4L7M6N5J3', duration: 540 },
                            { title: 'URL Routing', videoId: 'J5K6L7M8N4', duration: 660 }
                        ]
                    },
                    {
                        title: 'Models & DB',
                        lessons: [
                            { title: 'Models', videoId: 'K6L7M8N5J3', duration: 840 },
                            { title: 'Migrations', videoId: 'L7M8N6K4J2', duration: 720 },
                            { title: 'Admin Panel', videoId: 'M8N7L5K3J1', duration: 780 },
                            { title: 'CRUD Ops', videoId: 'N9K7L6M4K2', duration: 900 },
                            { title: 'Relationships', videoId: 'O8K7N6M5L1', duration: 840 }
                        ]
                    },
                    {
                        title: 'Views & Templates',
                        lessons: [
                            { title: 'Views', videoId: 'P9K7N6M4J3', duration: 720 },
                            { title: 'Templates', videoId: 'R8K7L6M4N1', duration: 780 },
                            { title: 'Template Tags', videoId: 'S9L7K6M5O2', duration: 600 },
                            { title: 'Static Files', videoId: 'T8K6L7N5M1', duration: 540 },
                            { title: 'Project', videoId: 'U9K7M6N5O3', duration: 1200 }
                        ]
                    }
                ]
            }
        ];

        for (const course of courses) {
            let totalLessons = 0;
            course.sections.forEach(s => { totalLessons += s.lessons.length; });

            const res = await pool.query(
                'INSERT INTO courses (title, slug, description, thumbnail, instructor_id, category, price, is_published, what_you_will_learn, requirements, total_lessons) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
                [course.title, course.slug, course.description, course.thumbnail, course.instructorId, course.category, course.price, true, course.whatYouWillLearn, course.requirements, totalLessons]
            );
            const courseId = res.rows[0].id;

            let sOrder = 0;
            for (const section of course.sections) {
                const sres = await pool.query(
                    'INSERT INTO sections (course_id, title, lesson_order) VALUES ($1, $2, $3) RETURNING id',
                    [courseId, section.title, sOrder++]
                );
                const sectionId = sres.rows[0].id;

                let lOrder = 0;
                for (const lesson of section.lessons) {
                    await pool.query(
                        'INSERT INTO lessons (section_id, title, description, video_url, video_id, duration, lesson_order, is_free_preview) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                        [sectionId, lesson.title, `Learn ${lesson.title}`, `https://youtu.be/${lesson.videoId}`, lesson.videoId, lesson.duration, lOrder++, lOrder === 1]
                    );
                }
            }
        }

        console.log('Database seeded!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
};

seedDB();
