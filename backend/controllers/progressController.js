const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const Enrollment = require('../models/Enrollment');

exports.markLessonComplete = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const section = await Section.findById(lesson.section);
    const courseId = section.course;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
      lesson: lessonId
    });

    if (progress) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();
    } else {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        lesson: lessonId,
        isCompleted: true,
        completedAt: new Date()
      });
    }

    const totalLessons = await Lesson.countDocuments({
      section: { $in: await Section.find({ course: courseId }).select('_id') }
    });

    const completedLessons = await Progress.countDocuments({
      user: req.user._id,
      course: courseId,
      isCompleted: true
    });

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    res.json({
      progress,
      completedLessons,
      totalLessons,
      progressPercentage,
      isCompleted: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const sections = await Section.find({ course: courseId })
      .sort('order')
      .populate({
        path: 'lessons',
        select: 'title duration order videoId',
        options: { sort: { order: 1 } }
      });

    const allLessons = sections.flatMap(section => section.lessons);
    const totalLessons = allLessons.length;

    const completedProgress = await Progress.find({
      user: req.user._id,
      course: courseId,
      isCompleted: true
    });

    const completedLessonIds = completedProgress.map(p => p.lesson.toString());
    
    const lessonsWithProgress = allLessons.map(lesson => ({
      ...lesson.toObject(),
      isCompleted: completedLessonIds.includes(lesson._id.toString())
    }));

    const completedCount = completedProgress.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const lastWatched = completedProgress.length > 0 
      ? completedProgress[completedProgress.length - 1].lesson
      : (totalLessons > 0 ? allLessons[0]._id : null);

    res.json({
      sections: sections.map((section, idx) => ({
        ...section.toObject(),
        lessons: lessonsWithProgress.filter(l => l.section.toString() === section._id.toString())
      })),
      totalLessons,
      completedCount,
      progressPercentage,
      lastWatched
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLessonProgress = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const section = await Section.findById(lesson.section);
    const courseId = section.course;

    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
      lesson: lessonId
    });

    res.json({
      isCompleted: progress ? progress.isCompleted : false,
      watchedDuration: progress ? progress.watchedDuration : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWatchProgress = async (req, res) => {
  try {
    const { watchedDuration } = req.body;
    const lessonId = req.params.lessonId;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const section = await Section.findById(lesson.section);
    const courseId = section.course;

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
      lesson: lessonId
    });

    if (progress) {
      progress.watchedDuration = Math.max(progress.watchedDuration, watchedDuration);
      await progress.save();
    } else {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        lesson: lessonId,
        watchedDuration
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNextLesson = async (req, res) => {
  try {
    const { courseId, currentLessonId } = req.params;

    const sections = await Section.find({ course: courseId })
      .sort('order')
      .populate({
        path: 'lessons',
        select: '_id title order',
        options: { sort: { order: 1 } }
      });

    const allLessons = sections.flatMap(section => section.lessons);
    const currentIndex = allLessons.findIndex(
      l => l._id.toString() === currentLessonId
    );

    if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
      return res.json({ nextLesson: null, hasNext: false });
    }

    const nextLesson = allLessons[currentIndex + 1];

    res.json({ nextLesson, hasNext: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPrevLesson = async (req, res) => {
  try {
    const { courseId, currentLessonId } = req.params;

    const sections = await Section.find({ course: courseId })
      .sort('order')
      .populate({
        path: 'lessons',
        select: '_id title order',
        options: { sort: { order: 1 } }
      });

    const allLessons = sections.flatMap(section => section.lessons);
    const currentIndex = allLessons.findIndex(
      l => l._id.toString() === currentLessonId
    );

    if (currentIndex <= 0) {
      return res.json({ prevLesson: null, hasPrev: false });
    }

    const prevLesson = allLessons[currentIndex - 1];

    res.json({ prevLesson, hasPrev: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
