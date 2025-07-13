const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true 
  },
  userQuery: {
    type: String,
    required: true
  },
  auraResponse: {
    type: String,
    required: true
  },
  objectsDetected: {
    type: Array,
    default: []
  },
  ocrTextExtracted: {
    type: Array,
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// The change is to directly export the result of mongoose.model.
// This ensures that what's being exported is always the compiled model.
module.exports = mongoose.model('Conversation', conversationSchema);