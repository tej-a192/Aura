import React, { useEffect } from 'react';

// Pass videoRef as a prop
const WebcamFeed = ({ videoRef }) => {
  useEffect(() => {
    const getWebcam = async () => {
      // ... (The webcam logic remains exactly the same) ...
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Could not access webcam. Please grant permission.");
      }
    };

    getWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  return (
    <div className="webcam-container">
      <h3>Live Camera</h3>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        style={{ width: '100%', borderRadius: '8px', transform: 'scaleX(-1)' }} // Flip horizontally
      />
    </div>
  );
};

export default WebcamFeed;