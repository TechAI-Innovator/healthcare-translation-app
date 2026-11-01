// Language Selection and Swap
const inputLangSelect = document.getElementById("input-lang");
const outputLangSelect = document.getElementById("output-lang");
const swapButton = document.getElementById("swap-languages");

// Function to disable selected input language in the output dropdown
function updateOutputOptions() {
    let selectedInput = inputLangSelect.value;
    Array.from(outputLangSelect.options).forEach(option => {
        option.disabled = option.value === selectedInput;
    });

    if (outputLangSelect.value === selectedInput) {
        outputLangSelect.value = Array.from(outputLangSelect.options).find(opt => !opt.disabled).value;
    }
}

// Update output options when input language changes
inputLangSelect.addEventListener("change", updateOutputOptions);

// Swap button logic
swapButton.addEventListener("click", function () {
    let temp = inputLangSelect.value;
    inputLangSelect.value = outputLangSelect.value;
    outputLangSelect.value = temp;
    updateOutputOptions();
});

// Speech Recognition (Voice-to-Text)
const startRecordingBtn = document.getElementById("start-recording");
const transcribedText = document.getElementById("transcribed-text");
const translatedText = document.getElementById("translated-text");
const recordingStatus = document.getElementById("recording-status");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let restartTimer = null;

let finalTranscript = ""; // Store finalized transcription
let debounceTimer = null; // Timer for limiting API calls

function setRecordingState(isRecording, message = "") {
    startRecordingBtn.dataset.recording = String(isRecording);
    startRecordingBtn.innerHTML = isRecording ? "⏹️ Stop Recording" : "🎤 Start Recording";
    recordingStatus.textContent = message || (isRecording ? "🔴 Recording..." : "");
    recordingStatus.classList.toggle("hidden", !isRecording && !message);
}

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;

    startRecordingBtn.addEventListener("click", function () {
        if (startRecordingBtn.dataset.recording === "false") {
            const recognitionLanguages = { en: "en-US", es: "es-ES", fr: "fr-FR" };
            recognition.lang = recognitionLanguages[inputLangSelect.value] || inputLangSelect.value;
            try {
                recognition.start();
                setRecordingState(true);
            } catch (error) {
                setRecordingState(false, "Could not start speech recognition. Please try again.");
                console.error("Could not start speech recognition:", error);
            }
        } else {
            clearTimeout(restartTimer);
            setRecordingState(false);
            recognition.stop();
        }
    });

    recognition.onresult = function (event) {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + " ";
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        transcribedText.textContent = finalTranscript + interimTranscript;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            sendToBackendForTranslation(finalTranscript + interimTranscript);
        }, 500);
    };

    recognition.onerror = function (event) {
        const messages = {
            "not-allowed": "Microphone access is blocked. Allow microphone access in your browser settings.",
            "service-not-allowed": "Speech recognition is unavailable. Check your browser settings.",
            "audio-capture": "No microphone was detected. Check your microphone and try again.",
            network: "Speech recognition needs a network connection. Check your connection and try again.",
            "language-not-supported": "Speech recognition does not support the selected language.",
            "no-speech": "No speech detected. Speak clearly near your microphone."
        };

        if (event.error === "no-speech") {
            setRecordingState(true, messages[event.error]);
            return;
        }
        if (event.error === "aborted" && startRecordingBtn.dataset.recording === "false") {
            return;
        }

        setRecordingState(false, messages[event.error] || `Speech recognition failed (${event.error}). Please try again.`);
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = function () {
        if (startRecordingBtn.dataset.recording === "true") {
            restartTimer = setTimeout(() => {
                if (startRecordingBtn.dataset.recording !== "true") return;
                try {
                    recognition.start();
                } catch (error) {
                    setRecordingState(false, "Speech recognition stopped unexpectedly. Please start again.");
                    console.error("Could not restart speech recognition:", error);
                }
            }, 500);
        }
    };
} else {
    startRecordingBtn.disabled = true;
    setRecordingState(false, "Speech recognition is not supported by this browser. Try a supported browser.");
}

// Function to send text to backend for real-time translation with debouncing
async function sendToBackendForTranslation(text) {
    let inputLang = inputLangSelect.value;
    let outputLang = outputLangSelect.value;
    text = text.trim();

    if (!text || !/[\p{L}\p{N}]/u.test(text)) return;

    try {
        let response = await fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text, source_lang: inputLang, target_lang: outputLang }),
        });

        const data = await response.json();
        if (!response.ok) {
            translatedText.textContent = data.error || `Translation failed (${response.status}).`;
            return;
        }
        translatedText.textContent = data.translated_text || "Translation failed";
    } catch (error) {
        translatedText.textContent = "Could not reach the translation service. Check your connection and server.";
        console.error("Translation request failed:", error);
    }
}

// Clear Text functionality
document.getElementById("clear-text").addEventListener("click", function () {
    finalTranscript = "";
    transcribedText.textContent = "";
    translatedText.textContent = "";
    this.innerHTML = "✖ Clear";
});

// Text-to-Speech (Playback)
document.getElementById("playback").addEventListener("click", function () {
    let speech = new SpeechSynthesisUtterance(translatedText.textContent);
    speech.lang = outputLangSelect.value;
    window.speechSynthesis.speak(speech);
    this.innerHTML = "🔊 Playing...";

    setTimeout(() => {
        this.innerHTML = "🔊 Playback";
    }, 3000);
});

// Initialize the output language restriction on page load
updateOutputOptions();


window.addEventListener('load', () => {
    AOS.init({
        duration: 2500,
        once: false, // animations repeat
        offset: 100,
        easing: 'ease-in-out',
        delay: 100
    });

    AOS.refresh();

    const header = document.querySelector('.typewriter');
    let hasTyped = false; // prevent retyping

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasTyped) {
                // Get character length of header
                const charCount = header.textContent.trim().length;

                // Dynamically set width and animation steps
                header.style.width = `${charCount}ch`;
                header.style.animation = `typing 3.5s steps(${charCount}, end), blink 0.75s step-end infinite`;

                header.classList.add('animate');
                hasTyped = true;
                observer.unobserve(header);
            }
        });
    }, {
        threshold: 0.5
    });

    if (header) {
        observer.observe(header);
    }
});
