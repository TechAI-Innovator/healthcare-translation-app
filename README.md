# 🩺 Healthcare Translation Web App with Generative AI

A real-time multilingual communication platform designed for healthcare environments. This app enables doctors and patients to speak different languages and still understand each other instantly — using voice input, generative AI translation, and speech synthesis.

---

## 🌐 Live Demos

- 🔗 [PythonAnywhere Deployment](https://techainnovator.pythonanywhere.com)
- 🔗 [Vercel Deployment](https://healthcare-translation-app-nine.vercel.app/)

---

## 🎥 Demo Video

📺 [Watch the demo](https://youtu.be/LBvh76OQXZM)
_A short walkthrough showcasing real-time translation, voice interaction, and multilingual capabilities._

---

## 🚀 Features

### 🔊 Real-Time Voice Translation
- Speak into the app and get translated speech in another language, in real-time.
- Tailored for **medical communication** — detects and responds only to health-related input.

### 🌍 Language Selection
- Choose input and output languages from a dynamic list.
- Easy language swapping feature for two-way communication.

### 🧠 AI-Powered Pipeline

1. **Speech Recognition:** Captures input using the **Web Speech API**.
2. **Transcription:** Converts speech to text.
3. **Medical Filter:** Detects whether speech is healthcare-related.
4. **Translation:** Performed by **Groq’s LLaMA 70B** model.
5. **Text-to-Speech:** Output is spoken back using the **Web SpeechSynthesis API**.

---

## 🛠️ Tech Stack

### ⚙️ Backend
- **Framework:** Flask
- **Functionality:** Handles translation logic, speech relevance checking, and routing
- **Deployment:** PythonAnywhere and Vercel (both run frontend + backend independently)

### 🖥️ Frontend
- **Languages:** HTML, CSS, JavaScript
- **Voice UI:** Uses JavaScript APIs to record speech, control TTS, and manage API calls
- **Responsiveness:** Mobile-first design with touch support

### 🤖 AI Components
- **Speech Recognition:** `Web Speech API`
- **Translation Engine:** `Groq LLaMA 70B`
- **TTS Output:** `SpeechSynthesis API`

---

## 🔐 Security & Privacy

- Real-time only — **no speech data is stored**
- Input is **sanitized** before processing
- Built-in **rate limiting** to prevent abuse
- Auto-restart if translation flow is interrupted

---

## 📱 Mobile-Friendly

- Fully responsive design
- Optimized for smartphones, tablets, and desktops

---

## 🔄 Future Enhancements

- Expand support to regional dialects and additional medical keywords
- Local/edge model execution for speed optimization
- EHR integration to log interactions (with consent)

---

## 👨‍💻 Author

Created by [Tech Innovator](https://github.com/techai-innovator)  
Driven to solve real-world problems with AI-powered solutions.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
