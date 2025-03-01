from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import time
import re
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from langchain_groq import ChatGroq

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

# Initialize rate limiter to prevent abuse
limiter = Limiter(get_remote_address, app=app, default_limits=["5 per second"])

# Get Groq API key from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq model
llm = ChatGroq(
    model="mixtral-8x7b-32768",  # Groq AI model
    temperature=0.3,  # Lower temperature for accuracy in medical context
    max_tokens=1000,
    timeout=30,
    max_retries=2,
    api_key=GROQ_API_KEY
)

# Function to sanitize user input
def sanitize_text(text):
    """Removes potentially dangerous characters from user input."""
    return re.sub(r"[^\w\s,.?!]", "", text)

@app.route("/translate", methods=["POST"])
@limiter.limit("10 per minute")  # Limit to 10 requests per minute per user
def translate():
    data = request.json
    text = sanitize_text(data.get("text", "").strip())
    source_lang = data.get("source_lang", "en")
    target_lang = data.get("target_lang", "es")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # **Refined Medical Translation Prompt**
    prompt = f"""
    You are a professional medical assistant specializing in translating conversations 
    between doctors and patients. Your task is to accurately translate the given dialogue 
    from {source_lang} to {target_lang} while maintaining clarity and medical accuracy.

    **Rules:**
    1. Return ONLY the translated text.
    2. Do NOT include any prefixes like "Patient/Doctor:" or "Paciente/Médico:".
    3. Do NOT include explanations, formatting, or extra details.
    4. The output should be a natural conversation translation.
    5. Be mindful of medical terminology and jargon.
    6. Use proper grammar and punctuation.
    7. Do not respond to dialogues that are not medical-related.
    8. If the dialogue is too long, summarize it and translate the summary.

    Here is the dialogue to translate:
    "{text}"

    Translation:
    """

    try:
        # Generate medical translation using Groq AI model
        response = llm.invoke(prompt)

        # Ensure response format is correct
        translated_text = response.content.strip() if hasattr(response, "content") else response.get("text", "").strip()

        print(f"Generated response length: {len(translated_text)} characters")  # Debugging statement
        return jsonify({"translated_text": translated_text})
    
    except Exception as e:
        print("Internal server error occurred")  # Log internally
        return jsonify({"error": "Internal server error"}), 500  # Do not expose system details

if __name__ == "__main__":
    app.run(debug=True) 