const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Define API routes
router.post('/query', sessionController.createQuery);
router.get('/history/:sessionId', sessionController.getSessionHistory);
router.delete('/session/:sessionId', sessionController.deleteSession);

module.exports = router;