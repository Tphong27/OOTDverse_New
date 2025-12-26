import os
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load environment variables
env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# 2. Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Optional: Fallback to local check if needed
    pass

genai.configure(api_key=api_key)

# Model configuration
MODEL_NAME = 'gemini-flash-lastest' # Using for vision capabilities
model = genai.GenerativeModel(MODEL_NAME)
