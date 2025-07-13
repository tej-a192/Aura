const Conversation = require('../models/conversationModel');
const axios = require('axios');

// POST /api/query
exports.createQuery = async (req, res) => {
  console.log("Node.js: Received request on /api/query");
  const { sessionId, userQuery, imageBase64 } = req.body;
  
  if (!sessionId || !userQuery || !imageBase64) {
    return res.status(400).json({ error: 'sessionId, userQuery, and imageBase64 are required.' });
  }

  try {
    // Step 1: Get recent conversation history for context
    const history = await Conversation.find({ sessionId }).sort({ timestamp: -1 }).limit(4);
    
    // ✅ FIXED: Properly format history as array of objects
    const sessionHistory = [];
    for (let i = history.length - 1; i >= 0; i--) {
        const turn = history[i];
        sessionHistory.push({ role: "user", parts: [turn.userQuery] });
        sessionHistory.push({ role: "model", parts: [turn.auraResponse] });
    }

    // Step 2: Prepare the payload for the Python service
    const pythonPayload = {
      userQuery,
      imageBase64,
      sessionHistory
    };
    
    console.log("Sending payload to Python:", JSON.stringify(pythonPayload, null, 2));

    // Step 3: Call the Python service
    const pythonServiceUrl = `${process.env.PYTHON_SERVICE_URL}/process`;
    const pythonResponse = await axios.post(pythonServiceUrl, pythonPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    // Step 4: Save the conversation
    const newConversation = new Conversation({
      sessionId,
      userQuery,
      auraResponse: pythonResponse.data.auraResponse,
      objectsDetected: pythonResponse.data.objectsDetected,
      ocrTextExtracted: pythonResponse.data.ocrTextExtracted
    });
    await newConversation.save();

    // Step 5: Send response
    res.status(201).json({ 
      auraResponse: pythonResponse.data.auraResponse 
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

// GET /api/history/:sessionId
exports.getSessionHistory = async (req, res) => {
  try {
    const history = await Conversation.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    if (!history) {
      return res.status(404).json({ error: 'No history found for this session.' });
    }
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

// DELETE /api/session/:sessionId
exports.deleteSession = async (req, res) => {
  try {
    const result = await Conversation.deleteMany({ sessionId: req.params.sessionId });
    if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'No session found to delete.' });
    }
    res.status(200).json({ message: `Session ${req.params.sessionId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session.' });
  }
};