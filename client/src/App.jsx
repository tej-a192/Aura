import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import WebcamFeed from './components/WebcamFeed';
import ChatWindow from './components/ChatWindow';
import './App.css';

// This file has no functional changes, only the h1 tag is updated.
// The rest of the logic remains the same.

const API_URL = 'http://localhost:5001/api';

function App() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('Initializing...');
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const sessionIdRef = useRef('');
  const isProcessingQuery = useRef(false);
  const isSpeaking = useRef(false);

  const startListening = () => {
    if (!isProcessingQuery.current && !isSpeaking.current) {
      setStatus('Listening...');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn("Could not start recognition:", e.message);
      }
    }
  };
  
  const captureFrameAsBase64 = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const speak = (text) => {
    isSpeaking.current = true;
    setStatus('Speaking...');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      isSpeaking.current = false;
      startListening();
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleQuery = async (userQuery) => {
    if (isProcessingQuery.current) return;

    isProcessingQuery.current = true;
    setStatus('Processing...');
    setHistory(prev => [...prev, { role: 'user', text: userQuery }]);

    const imageBase64 = captureFrameAsBase64();
    if (!imageBase64) {
      const errorMsg = 'Error: Could not capture frame.';
      setHistory(prev => [...prev, { role: 'aura', text: errorMsg }]);
      isProcessingQuery.current = false;
      speak(errorMsg);
      return;
    }

    const payload = { sessionId: sessionIdRef.current, userQuery, imageBase64 };
    console.log("Sending payload to backend:", payload);

    try {
      const response = await axios.post(`${API_URL}/query`, payload);
      const auraResponse = response.data.auraResponse;
      setHistory(prev => [...prev, { role: 'aura', text: auraResponse }]);
      speak(auraResponse);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage = 'Sorry, an error occurred.';
      setHistory(prev => [...prev, { role: 'aura', text: errorMessage }]);
      speak(errorMessage);
    } finally {
      isProcessingQuery.current = false;
    }
  };

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setStatus('Speech recognition not supported.');
      return;
    }
    
    sessionIdRef.current = `aura-session-${Date.now()}`;
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      handleQuery(transcript);
    };

    recognition.onend = () => {
      startListening();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        setStatus('Voice recognition error.');
      }
    };
    
    startListening();

    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Aura: AI Vision Assistant for Visually Impaired [Blind People]</h1>
      </header>
      <main className="main-content">
        <WebcamFeed videoRef={videoRef} />
        <ChatWindow history={history} status={status} />
      </main>
    </div>
  );
}

export default App;