const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  videoId: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isFreePreview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
