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

let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = true;
recognition.continuous = true;

let finalTranscript = ""; // Store finalized transcription
let debounceTimer = null; // Timer for limiting API calls

startRecordingBtn.addEventListener("click", function () {
    if (startRecordingBtn.dataset.recording === "false") {
        recognition.lang = inputLangSelect.value; // Set recognition language
        recognition.start();
        startRecordingBtn.innerHTML = "⏹️ Stop Recording";
        startRecordingBtn.dataset.recording = "true";
        recordingStatus.classList.remove("hidden");
    } else {
        recognition.stop();
        startRecordingBtn.innerHTML = "🎤 Start Recording";
        startRecordingBtn.dataset.recording = "false";
        recordingStatus.classList.add("hidden");
    }
});

// Function to send text to backend for real-time translation with debouncing
async function sendToBackendForTranslation(text) {
    let inputLang = inputLangSelect.value;
    let outputLang = outputLangSelect.value;

    if (!text) return;

    try {
        let response = await fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text, source_lang: inputLang, target_lang: outputLang }),
        });

        let data = await response.json();
        translatedText.textContent = data.translated_text || "Translation failed";
    } catch (error) {
        translatedText.textContent = "Error in translation";
    }
}

// Function to handle transcription and trigger translation
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

    // Debounce translation requests to avoid excessive API calls
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        sendToBackendForTranslation(finalTranscript + interimTranscript);
    }, 500);
};

// Restart recognition on end (for continuous real-time experience)
recognition.onend = function () {
    if (startRecordingBtn.dataset.recording === "true") {
        setTimeout(() => recognition.start(), 500); // Small delay before restarting
    }
};

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
