import os
import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import google.generativeai as genai
from dotenv import load_dotenv
import easyocr

# Import our new prompt builder
from promptTemplate import build_prompt

# --- Setup ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

# --- Load Models ---
try:
    yolo_model = YOLO("yolov8n.pt")
    # Using gpu=False for broader compatibility. Change to True if you have a supported GPU.
    easyocr_reader = easyocr.Reader(['en'], gpu=False) 
    gemini_model = genai.GenerativeModel('gemini-2.5-pro')
    print("✅ All models loaded successfully.")
except Exception as e:
    print(f"❌ Error during model initialization: {e}")
    exit()

# --- Utilities ---
def decode_image(base64_str):
    if base64_str.startswith("data:image"):
        base64_str = base64_str.split(",")[1]
    image_data = base64.b64decode(base64_str)
    np_arr = np.frombuffer(image_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

# --- ✅ NEW: SPATIAL ANALYSIS FUNCTION ---
def get_spatial_details(img_width, img_height, box):
    x1, y1, x2, y2 = box
    box_center_x = (x1 + x2) / 2
    
    # Position Logic
    if box_center_x < img_width / 3:
        position = "left"
    elif box_center_x > 2 * img_width / 3:
        position = "right"
    else:
        position = "center"
        
    # Distance Estimation Logic
    box_area = (x2 - x1) * (y2 - y1)
    total_area = img_width * img_height
    area_ratio = box_area / total_area
    
    if area_ratio > 0.15:
        distance = "very close"
    elif area_ratio > 0.05:
        distance = "close"
    else:
        distance = "far"
        
    return {"position": position, "distance": distance}

# --- Vision Analysis ---
def analyze_visuals(image):
    h, w, _ = image.shape
    
    # YOLO Detection
    yolo_results = yolo_model(image)
    objects = []
    for result in yolo_results:
        for box in result.boxes:
            if float(box.conf[0]) > 0.4:
                label = yolo_model.names[int(box.cls[0])]
                coords = [int(coord) for coord in box.xyxy[0]]
                # ✅ Get spatial details for each object
                spatial_info = get_spatial_details(w, h, coords)
                objects.append({"label": label, **spatial_info}) # Merge dicts

    # OCR
    ocr_text = [result[1] for result in easyocr_reader.readtext(image) if result[2] > 0.4]

    return objects, ocr_text

# --- API Route ---
@app.route('/process', methods=['POST'])
def process_frame():
    data = request.get_json()
    user_query = data.get('userQuery')
    image_base64 = data.get('imageBase64')
    session_history = data.get('sessionHistory', [])

    if not user_query or not image_base64:
        return jsonify({"error": "Missing data"}), 400

    image = decode_image(image_base64)
    if image is None:
        return jsonify({"error": "Invalid image data"}), 400
    
    # The frontend webcam feed is often mirrored, so we flip it back.
    corrected_image = cv2.flip(image, 1)

    detected_objects, ocr_text = analyze_visuals(corrected_image)

    # ✅ NEW: Use the chat-based method
    try:
        # 1. Start a chat session with the provided history
        chat = gemini_model.start_chat(history=session_history)
        
        # 2. Build the prompt for the CURRENT turn
        prompt = build_prompt(detected_objects, ocr_text, session_history, user_query)
        
        # 3. Send the new prompt to the ongoing chat
        print(f"\n--- Sending to Gemini Chat ---\n{prompt}\n---------------------------\n")
        response = chat.send_message(prompt)
        aura_response = response.text.strip()

    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        aura_response = "Sorry, I couldn't process that right now."

    return jsonify({
        "auraResponse": aura_response,
        "objectsDetected": detected_objects,
        "ocrTextExtracted": ocr_text
    })

# --- Main ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)