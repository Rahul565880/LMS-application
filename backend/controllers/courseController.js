const Course = require('../models/Course');
const Section = require('../models/Section');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

exports.getCourses = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort('-createdAt');

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'name avatar bio');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const sections = await Section.find({ course: course._id })
      .sort('order')
      .populate({
        path: 'lessons',
        select: 'title duration order videoId isFreePreview',
        options: { sort: { order: 1 } }
      });

    res.json({ course, sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user._id
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Section.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    let courses;
    if (req.user.role === 'admin') {
      courses = await Course.find()
        .populate('instructor', 'name avatar')
        .sort('-createdAt');
    } else {
      courses = await Course.find({ instructor: req.user._id })
        .populate('instructor', 'name avatar')
        .sort('-createdAt');
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name avatar')
      .sort('-createdAt');

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const sectionCount = await Section.countDocuments({ course: course._id });
    
    const section = await Section.create({
      course: course._id,
      title: req.body.title,
      order: sectionCount
    });

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const course = await Course.findById(section.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedSection = await Section.findByIdAndUpdate(
      req.params.sectionId,
      req.body,
      { new: true }
    );

    res.json(updatedSection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const course = await Course.findById(section.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Lesson.deleteMany({ section: section._id });
    await Section.findByIdAndDelete(req.params.sectionId);

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addLesson = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const course = await Course.findById(section.course);
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const lessonCount = await Lesson.countDocuments({ section: section._id });
    
    const videoId = extractVideoId(req.body.videoUrl);

    const lesson = await Lesson.create({
      section: section._id,
      title: req.body.title,
      description: req.body.description,
      videoUrl: req.body.videoUrl,
      videoId: videoId,
      duration: req.body.duration || 0,
      order: lessonCount,
      isFreePreview: req.body.isFreePreview || false
    });

    const totalLessons = await Lesson.countDocuments({ section: { $in: await Section.find({ course: course._id }).select('_id') } });
    await Course.findByIdAndUpdate(course._id, { totalLessons });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const section = await Section.findById(lesson.section);
    const course = await Course.findById(section.course);
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const videoId = req.body.videoUrl ? extractVideoId(req.body.videoUrl) : lesson.videoId;

    lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      { ...req.body, videoId },
      { new: true }
    );

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const section = await Section.findById(lesson.section);
    const course = await Course.findById(section.course);
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Lesson.findByIdAndDelete(req.params.lessonId);

    const totalLessons = await Lesson.countDocuments({ section: { $in: await Section.find({ course: course._id }).select('_id') } });
    await Course.findByIdAndUpdate(course._id, { totalLessons });

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('section');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
