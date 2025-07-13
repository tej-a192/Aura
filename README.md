# 🧠 Aura: Real-Time Visual Assistant for the Visually Impaired

Aura is a voice-based, AI-powered assistant that helps visually impaired users understand their surroundings using a webcam. It uses object detection, OCR, and Gemini LLM to answer questions about the scene — just like a human would.

---

## 🚀 What is Aura?

Aura captures a **live frame** from a webcam whenever a user asks something like:

> "What is this?"  
> "Where is the door?"  
> "What does that label say?"

It analyzes the frame with AI and responds with accurate, confident answers — **using memory**, **intelligent inference**, and **spoken output**.

---

## 🔧 Architecture

Here’s a visual overview of Aura’s full-stack architecture:

<p align="center">
  <img src="./assets/aura-architecture.png" alt="Aura System Architecture" width="800"/>
</p>


## 🧰 Tech Stack

| Layer              | Technologies                                                                 |
|-------------------|-------------------------------------------------------------------------------|
| 👁️ Visual Processing | ![Python](https://img.shields.io/badge/-Python-blue?logo=python) `YOLOv8`, `EasyOCR` |
| 🧠 LLM Reasoning     | ![Gemini](https://img.shields.io/badge/-Gemini_API-purple) (Text-only, Basic Key) |
| 🧩 Backend API       | ![Node.js](https://img.shields.io/badge/-Node.js-green?logo=node.js) `Express.js` |
| 🗃️ Data Storage       | ![MongoDB](https://img.shields.io/badge/-MongoDB-teal?logo=mongodb) |
| 🌐 Frontend UI       | ![React](https://img.shields.io/badge/-React-blue?logo=react) + `SpeechRecognition` |
| 🔊 Voice            | `SpeechSynthesis`, `Web Speech API`                                         |

---

## 🎯 Core Features

### 🔹 1. Real-Time Scene Understanding
> Captures a webcam frame and describes what’s visible

**Example**:  
**User**: “What do you see?”  
**Aura**: “There is a laptop in the center, a bottle on the left, and a chair behind the table.”

---

### 🔹 2. OCR + LLM Inference
> Reads visible text and answers smartly

**Example**:  
- Text Detected: `"Mucaine Gd"`  
- LLM infers: “It is likely Mucaine Gel, an antacid used for heartburn and gas.”

Aura **never says the raw OCR text** — it speaks like a human would.

---

### 🔹 3. Short-Term Visual Memory
> Understands follow-up questions like “Now?” or “Where is it?”

- If user asked: "Where is the door?"  
- Aura replies: "No door found. Please move the camera."  
- Later:  
  **User**: “Now?”  
  **Aura**: “The door is on the right side of the frame.”

---

### 🔹 4. Query-Triggered Intelligence
> Aura only analyzes the scene **after a user asks a question**

✅ Reduces computation  
✅ Makes it feel human-aware

---

### 🔹 5. End Session (Cleanup)
> User clicks "End Session" → deletes all MongoDB data and resets memory.

---

## 🧠 LLM Prompt Strategy (Chain of Thought)

Aura uses a **smart CoT prompt** that behaves like this:

| Condition                      | Result |
|-------------------------------|--------|
| User asks about scene/text    | Uses object + OCR context |
| User asks general question    | Answers with general knowledge |
| OCR is messy or noisy         | LLM **guesses** what it actually refers to |

Example:
```plaintext
USER QUERY: What is this?
OCR: ["Mucaine Gd", "Yio"]
LLM OUTPUT: "This appears to be Mucaine Gel, a syrup used for acidity."

---

## 📸 Input Handling

Aura uses `cv2.VideoCapture(0)` to grab a **live webcam frame** for every voice query.

- It does **not** stream continuously
- It captures **only one frame** when the user speaks

This keeps the system lightweight and efficient, especially for low-resource devices.

---

## 📦 What’s Sent to Gemini?

For every user query, Aura sends:

- 📦 **Object list** with positions (e.g., `"door": right, far`)
- 🔤 **OCR extracted text** (used internally — not shown to user)
- 💬 **2–3 previous conversation turns** for context
- ❓ **Current user query**
- 🔁 **Prompt instruction**: "Use context only if relevant to the query"

✅ If the question is about the environment → LLM uses the context  
✅ If the question is general → LLM answers intelligently, **without saying 'this is not related'**

---

## 🎥 Demo

👉 **Watch the full walkthrough video:** [📺 Google Drive Demo Link](https://your-drive-link-here.com)

---

## 🧠 Summary

Aura is an intelligent, vision-powered assistant that:

- 🧠 Uses AI to answer questions based on **live camera input**
- 👁️ Detects objects, reads text, and infers what the scene means
- 🧩 Understands **follow-up questions** using short-term memory
- 🎤 Responds via voice in a human-like way
- 💾 Stores each query session in MongoDB with cleanup capability
- 🔗 Combines React + Node.js + Python + Gemini API in a modular, scalable architecture

---

✨ Developed not just as a demo — but as a real-world tool to assist and empower visually impaired users.  
**Built with empathy. Shipped with tech. Ready for impact.**

