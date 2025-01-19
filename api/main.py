# File: api/main.py

import string
import time
import cv2
import numpy as np
import pyautogui
import easyocr
import Levenshtein
from flask import Flask, jsonify, request
from vosk import Model, KaldiRecognizer
import os
import base64
from PIL import Image
from speechbrain.inference import EncoderDecoderASR
from fuzzywuzzy import fuzz
import sounddevice as sd
import numpy as np
import wave
import requests
import google.generativeai as genai

from threading import Thread
import json

from openai import OpenAI


global_matched_command = None

port = 3000
from flask_cors import CORS  # Import CORS




app = Flask(__name__)
CORS(app)
img_path = "../temp/image.png"
reader = easyocr.Reader(["en"], gpu=False)  


COMMANDS = {
    "scroll up": "scroll_up",
    "scroll down": "scroll_down",
    "open tab": "open_tab",
    "close tab": "close_tab",
    "press enter": "press_enter",
    "analyze screen": "analyze_screen",
    "search": "search_term"  # New command for searching
}



# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def process_audio_command(command):
    """
    Processes a user command by sending it to OpenAI API and matching it against predefined commands.
    Logs the input command, OpenAI's matched command, and the action taken.
    """
    global global_matched_command  # Use the global variable
    prompt = f"""
You are an assistant. Match the user's command to one of these predefined commands:
{', '.join(COMMANDS.keys())}.

The match must be exact and logical based on the input. If no match is found, return "search".

User Command: "{command}"
"""

    try:
        # Send the prompt to OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an assistant mapping user commands to predefined actions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=50,
            temperature=0  # Deterministic behavior
        )

        # Extract the result correctly
        matched_command = response.choices[0].message.content.strip()
        global_matched_command = matched_command  # Update the global variable

        # Log the input command and matched command
        print(f"[LOG] User Command: {command.strip()}")
        print(f"[LOG] Matched Command: {matched_command}")

        # Ensure the matched command is valid
        print(COMMANDS.keys())
        if matched_command in COMMANDS.keys():
            print(f"[LOG] Executing Command: {matched_command}")

            # Execute the matched command
            if matched_command == "scroll up":
                smooth_scroll(amount=100, duration=1)
                global_matched_command = "scroll_up"
                return "Scrolled up"
            elif matched_command == "scroll down":
                smooth_scroll(amount=-100, duration=1)
                global_matched_command = "scroll_down"
                return "Scrolled down"
            elif matched_command == "open tab":
                pyautogui.keyDown("command")
                pyautogui.press("t")
                pyautogui.keyUp("command")
                global_matched_command = "open_tab"
                return "Opened new tab"
            elif matched_command == "close tab":
                pyautogui.keyDown("command")
                pyautogui.press("w")
                pyautogui.keyUp("command")
                global_matched_command = "close_tab"
                return "Closed current tab"
            elif matched_command == "press enter":
                pyautogui.press("enter")
                global_matched_command = "press_enter"
                return "Pressed Enter"
            elif matched_command == "start recording":
                global_matched_command = "start_recording"
                return "Started recording"
            elif matched_command == "stop recording":
                global_matched_command = "stop_recording"
                return "Stopped recording"
            elif matched_command == "analyze screen":
                global_matched_command = "analyze_screen"
                return analyze_screen()
                
            else:
                global_matched_command="search"
                extractProduct(command)
        else:
            print(f"[LOG] Unrecognized Command: {command.strip()}")
            return f"Unrecognized command: {command.strip()}"

    except Exception as e:
        print(f"Error processing command with OpenAI: {e}")
        return f"Error processing command: {str(e)}"

GEMINI_API_URL = "https://api.gemini.com/v1/upload"  # Replace with the actual Gemini API endpoint
GEMINI_API_KEY = "AIzaSyCewVeJM1NcaNRpoK30h-FJoPfGpCr5n10"

COMMANDS = {
    "scroll up": "scroll_up",
    "scroll down": "scroll_down",
    "open tab": "open_tab",
    "close tab": "close_tab",
    "press enter": "press_enter",
    "analyze screen": "analyze_screen",
    "search": "search_term",
}


def upload_to_gemini(image_path):
    """
    Uploads an image to the Gemini API and returns the uploaded file URL.
    """
    headers = {"Authorization": f"Bearer {GEMINI_API_KEY}"}
    try:
        with open(image_path, "rb") as img_file:
            files = {"file": img_file}
            response = requests.post(GEMINI_API_URL, headers=headers, files=files)

        if response.status_code == 200:
            response_data = response.json()
            print(f"Gemini API Response: {response_data}")
            return response_data.get("url")  # Adjust based on the API's response structure
        else:
            print(f"Gemini API Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error uploading to Gemini: {e}")
        return None


def analyze_image_with_openai(base64_image):
    """
    Analyzes an image using OpenAI's GPT model.
    """
    retries = 3
    backoff = 1
    for attempt in range(retries):
        try:
            data_url = f"data:image/png;base64,{base64_image}"
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an assistant analyzing and describing images."},
                    {"role": "user", "content": "Describe the image content briefly."},
                    {"role": "user", "content": data_url}
                ],
                max_tokens=100,
                temperature=0.5,
            )
            result = response.choices[0].message.content.strip()
            print(f"OpenAI Response: {result}")
            return result
        except Exception as e:
            if "rate_limit_exceeded" in str(e):
                print(f"Rate limit exceeded, retrying in {backoff} seconds...")
                time.sleep(backoff)
                backoff *= 2
            else:
                print(f"Error analyzing image with OpenAI: {e}")
                return f"Error analyzing image: {str(e)}"
    return "Error: Failed after multiple attempts."


GEMINI_API_KEY = "AIzaSyCewVeJM1NcaNRpoK30h-FJoPfGpCr5n10"
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
img_path = "../temp/image.png"

# Initialize Gemini Model



def shot_screen():
    """
    Capture the screen, process the right half of the image, and save it.
    """
    try:
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(img_path), exist_ok=True)

        # Take a screenshot
        screenshot = pyautogui.screenshot()
        screenshot = screenshot.convert("RGB")  # Ensure RGB mode

        # Crop to the right half of the image
        width, height = screenshot.size
        right_half = screenshot.crop((width // 2, 0, width, height))

        # Resize the image for efficiency
        right_half = right_half.resize((512, 512), Image.Resampling.LANCZOS)

        # Save the processed image
        right_half.save(img_path, "PNG")
        print(f"Screenshot saved to {img_path}")
    except Exception as e:
        print(f"Error capturing screenshot: {e}")
        raise


def encode_image(image_path):
    """
    Encode the image at the given path to a base64 string.
    """
    try:
        with open(image_path, "rb") as img_file:
            base64_string = base64.b64encode(img_file.read()).decode("utf-8")
            print(f"Base64 Image Size: {len(base64_string)}")
            return base64_string
    except Exception as e:
        print(f"Error encoding image: {e}")
        raise


def analyze_image_with_gemini(base64_image, prompt):
    model_gem = genai.GenerativeModel(model_name="gemini-1.5-pro")
    """
    Use the Gemini API to analyze the image and generate text content.
    """
    try:
        # Make a GenerateContent request to Gemini
        response = model_gem.generate_content(
            [
                {"mime_type": "image/png", "data": base64_image},
                prompt
            ]
        )

        # Extract and return the result
        result = response.text
        print(f"Gemini API Response: {result}")
        return result
    except Exception as e:
        print(f"Error analyzing image with Gemini: {e}")
        return f"Error analyzing image: {str(e)}"


@app.route("/analyze_screen", methods=["GET"])
def analyze_screen():
    """
    Capture the screen, process the image, and analyze it using Gemini API.
    """
    try:
        # Capture the screen and save the processed image
        shot_screen()

        # Ensure the image exists
        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Image file not found at path: {img_path}")

        # Encode the image as a base64 string
        base64_image = encode_image(img_path)

        # Define the prompt for analysis
        prompt = "Describe the objects and activities in this image."

        # Analyze the image using Gemini API
        result = analyze_image_with_gemini(base64_image, prompt)

        # Return the analysis result
        return jsonify(isSuccess=True, result=result)
    except FileNotFoundError as e:
        return jsonify(isSuccess=False, error=str(e)), 500
    except Exception as e:
        return jsonify(isSuccess=False, error=str(e)), 500

def extractProduct(command):
    """
    Extracts the product name from the user's command using GPT and searches for it in a new tab.
    """
    # Define the custom prompt for GPT to extract the product name
    prompt = f"""
    You are an intelligent assistant. Extract the product name or search term from the user's command.
    The user's command may contain phrases like "search for", "look up", or similar.
    ONLY return the product name or search term, and nothing else.

    User Command: "{command.strip()}"
    """

    try:
        # Send the custom prompt to GPT
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an assistant that extracts search terms."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=50,
            temperature=0  # Deterministic behavior
        )

        # Extract the product name from the response
        product_name = response.choices[0].message.content.strip()
        print(f"[LOG] Extracted Product: {product_name}")

        # Perform the search
        if product_name:
            perform_search(product_name)
            return f"Searching for: {product_name}"
        else:
            return "Failed to extract product name."

    except Exception as e:
        print(f"Error extracting product name with GPT: {e}")
        return f"Error: {str(e)}"


def perform_search(query):
    """
    Performs the search by opening a new tab, typing the query, and pressing Enter.
    """
    # Open a new tab
    pyautogui.keyDown("command")
    pyautogui.press("t")
    pyautogui.keyUp("command")

    # Allow time for the new tab to open
    time.sleep(1)

    # Type the search query
    pyautogui.write(query)

    # Press Enter to execute the search
    pyautogui.press("enter")

    print(f"[LOG] Performed search for: {query}")





vosk_model_path = "../vosk-model-small-en-us-0.15"

# Load the Vosk model
model = Model(vosk_model_path)

def convert_speech_to_text():
    global audio_file_path
    print("Starting speech-to-text with Vosk...")

    # Open the recorded audio file
    with wave.open(audio_file_path, "rb") as wf:
        # Ensure the audio file is mono and has the correct sample rate
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
            raise ValueError("Audio file must be mono, 16-bit, and 16kHz.")
        
        recognizer = KaldiRecognizer(model, wf.getframerate())
        recognizer.SetWords(True)
        text = ""

        # Read the audio in chunks and perform recognition
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break

            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                text += result.get("text", "") + " "

        # Process the final part of the audio
        final_result = json.loads(recognizer.FinalResult())
        text += final_result.get("text", "")

    print(f"Recognized Text: {text}")
    return text





def smooth_scroll(amount, duration=1):
    steps = 25
    step_duration = duration / steps
    step_amount = amount // steps if amount != 0 else 1
    for _ in range(steps):
        pyautogui.scroll(step_amount)
        time.sleep(step_duration)

def levenshtein_similarity(a, b):
    distance = Levenshtein.distance(a, b)
    max_len = max(len(a), len(b))
    return 1 - distance / max_len if max_len > 0 else 0

def preprocess_sentence(sentence):
    sentence = sentence.lower()
    translator = str.maketrans("", "", string.punctuation)
    sentence = sentence.translate(translator)
    return sentence.strip()

def encode_image(image_path):
    """Encodes an image as a base64 string."""
    with open(image_path, "rb") as img_file:
        base64_string = base64.b64encode(img_file.read()).decode("utf-8")
        print(f"Base64 Image Size: {len(base64_string)}")
        return base64_string

def shotScreen():
    global img_path  # Ensure the global variable is used

    # Create the directory for the image if it doesn't exist
    os.makedirs(os.path.dirname(img_path), exist_ok=True)

    # Take a screenshot
    screenshot = pyautogui.screenshot()
    screenshot = screenshot.convert("RGB")  # Ensure RGB mode

    # Crop to the right half of the image
    width, height = screenshot.size
    right_half = screenshot.crop((width // 2, 0, width, height))

    # Resize to reduce size
    right_half = right_half.resize((512, 512), Image.Resampling.LANCZOS)

    # Save the image
    right_half.save(img_path, "PNG")
    print(f"Screenshot saved to {img_path}")

# Function to encode an image as a base64 string
def encode_image(image_path):
    try:
        with open(image_path, "rb") as img_file:
            base64_string = base64.b64encode(img_file.read()).decode("utf-8")
            print(f"Base64 Image Size: {len(base64_string)}")
            return base64_string
    except Exception as e:
        print(f"Error encoding image: {e}")
        raise

# Function to analyze the image using OpenAI
import time

def analyze_image_with_openai(base64_image):
    retries = 3
    backoff = 1  # Start with 1 second
    for attempt in range(retries):
        try:
            data_url = f"data:image/png;base64,{base64_image}"

            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an assistant analyzing and describing images."},
                    {"role": "user", "content": "Describe the image content briefly."},
                    {"role": "user", "content": data_url}
                ],
                max_tokens=100,
                temperature=0.5
            )

            result = response.choices[0].message.content.strip()
            print(f"OpenAI Response: {result}")
            return result
        except Exception as e:
            if "rate_limit_exceeded" in str(e):
                print(f"Rate limit exceeded, retrying in {backoff} seconds...")
                time.sleep(backoff)
                backoff *= 2  # Exponential backoff
            else:
                print(f"Error analyzing image with OpenAI: {e}")
                return f"Error analyzing image: {str(e)}"
    return "Error: Failed after multiple attempts."
    

def shotScreen():
    global img_path  # Ensure the global variable is used

    # Create the directory for the image if it doesn't exist
    os.makedirs(os.path.dirname(img_path), exist_ok=True)

    # Take a screenshot
    screenshot = pyautogui.screenshot()
    screenshot = screenshot.convert("RGB")  # Ensure RGB mode

    # Crop to the right half of the image
    width, height = screenshot.size
    right_half = screenshot.crop((width // 2, 0, width, height))

    # Resize to reduce size
    right_half = right_half.resize((512, 512), Image.Resampling.LANCZOS)

    # Save the image
    right_half.save(img_path, "PNG")
    print(f"Screenshot saved to {img_path}")

def click_word(
    target_word,
    confidence_threshold=0.5,
    delay_before_capture=0,
    delay_before_click=0,
    scaling_factor=2.0,
):
    time.sleep(delay_before_capture)
    screenshot = pyautogui.screenshot()
    image_rgb = np.array(screenshot)
    results = reader.readtext(image_rgb)

    target_bboxes = []
    for bbox, text, score in results:
        p1 = preprocess_sentence(text)
        p2 = preprocess_sentence(target_word)
        similarity = levenshtein_similarity(p1, p2)
        if similarity >= confidence_threshold and score >= confidence_threshold:
            target_bboxes.append(bbox)

    if not target_bboxes:
        print(f"'{target_word}' not found with confidence >= {confidence_threshold}.")
        return

    # Click each bounding box that matched
    for bbox in target_bboxes:
        x_coords = [pt[0] for pt in bbox]
        y_coords = [pt[1] for pt in bbox]
        cx_screenshot = int(sum(x_coords) / len(x_coords))
        cy_screenshot = int(sum(y_coords) / len(y_coords))

        cx_screen = int(cx_screenshot / scaling_factor)
        cy_screen = int(cy_screenshot / scaling_factor)

        time.sleep(delay_before_click)
        pyautogui.moveTo(x=cx_screen, y=cy_screen)
        pyautogui.click()
        print(f"Clicked on '{target_word}' at ({cx_screen}, {cy_screen})")


@app.route("/write_text", methods=["POST"])
def write_text():
    q = request.args.get("q", "")
    pyautogui.write(q)
    return jsonify(isSuccess=True)

@app.route("/press_key", methods=["POST"])
def press_key():
    q = request.args.get("q", "")
    pyautogui.press(q)
    return jsonify(isSuccess=True)

@app.route("/click_request", methods=["POST"])
def click_on_request():
    q = request.args.get("q", "")
    click_word(q, delay_before_capture=0, delay_before_click=0)
    return jsonify(q=q, isSuccess=True)

@app.route("/open", methods=["POST"])
def new_tab():
    # Mac example:
    pyautogui.keyDown("command")
    pyautogui.press("n")
    pyautogui.keyUp("command")
    return jsonify(isSuccess=True)

@app.route("/navigate_page", methods=["POST"])
def navigate_page():
    data = request.get_json() or {}
    zed = data.get("zed", "").lower()
    try:
        if zed in ["forward", "redo"]:
            # Mac
            pyautogui.keyDown("command")
            pyautogui.press("right")
            pyautogui.keyUp("command")
        elif zed in ["backward", "back"]:
            pyautogui.keyDown("command")
            pyautogui.press("left")
            pyautogui.keyUp("command")
        return jsonify(isSuccess=True)
    except Exception as e:
        return jsonify(isSuccess=False, error=str(e)), 500

@app.route("/scroll", methods=["POST"])
def scroll_page():
    data = request.get_json() or {}
    direction = data.get("direction", "down")
    amount = data.get("amount", 50)
    try:
        if direction == "up":
            smooth_scroll(amount)
        else:
            smooth_scroll(-amount)
        return jsonify(isSuccess=True, direction=direction, amount=amount)
    except Exception as e:
        return jsonify(isSuccess=False, error=str(e)), 500


@app.route("/speech_to_text", methods=["POST"])
def speech_to_text():
    try:
        text = convert_speech_to_text()
        return jsonify(isSuccess=True, text=text)
    except Exception as e:
        return jsonify(isSuccess=False, error=str(e)), 500

is_recording = False
audio_frames = []
sample_rate = 44100  # Standard sampling rate
audio_file_path = "../temp/output.wav"

def audio_callback(indata, frames, time, status):
    global audio_frames
    if status:
        print(f"Audio Input Error: {status}")
    # Ensure the audio data is 16-bit PCM
    audio_frames.append(indata.copy())
    

# Start recording endpoint
# Start recording endpoint
@app.route("/start_recording", methods=["POST"])
def start_recording():
    global is_recording, audio_frames
    try:
        is_recording = True
        audio_frames = []  # Reset the audio frames

        # Start a thread to record audio
        def record_audio():
            global is_recording, audio_frames
            time.sleep(2.3)  # Wait for one second before starting the recording
            with sd.InputStream(samplerate=16000, channels=1, dtype='int16', callback=audio_callback):
                while is_recording:
                    sd.sleep(100)

        Thread(target=record_audio, daemon=True).start()
        print("Recording started...")
        return jsonify(isSuccess=True, message="Recording started.")
    except Exception as e:
        return jsonify(isSuccess=False, error=str(e)), 500

@app.route("/stop_recording", methods=["POST"])
def stop_recording():
    global is_recording, audio_frames, audio_file_path, global_matched_command
    try:
        is_recording = False
        print("Recording stopped. Saving audio...")

        # Save audio to a .wav file
        with wave.open(audio_file_path, "wb") as wf:
            wf.setnchannels(1)  # Mono audio
            wf.setsampwidth(2)  # 16-bit audio (2 bytes per sample)
            wf.setframerate(16000)  # 16kHz sample rate
            wf.writeframes(b"".join(audio_frames))
        print(f"Audio saved to {audio_file_path}")

        # Process the recorded audio file
        text = convert_speech_to_text()
        print(f"Transcribed Text: {text}")

        # Reset the global matched command
        global_matched_command = None

        # Process the command using process_audio_command
        command_result = process_audio_command(text)

        # Retrieve the matched command type from the global variable
        command_type = global_matched_command

        # Default to unknown if no valid command is matched
        if command_type is None or command_type not in COMMANDS.keys():
            command_type = "unknown"

        print(f"Command Result: {command_result}")
        print(f"Command Type: {global_matched_command}")

        # Ensure command_result is a string
        if not isinstance(command_result, str):
            command_result = str(command_result)

        # Construct the JSON response
        response = {
            "isSuccess": True,
            "result": command_result,
            "command": command_type
        }

        print(f"JSON Response: {response}")
        return jsonify(response)
    except Exception as e:
        error_response = {"isSuccess": False, "error": str(e)}
        print(f"Error Response: {error_response}")
        return jsonify(error_response), 500



    

if __name__ == "__main__":
    print(f"[Cain] Running on: http://localhost:{port}")
    app.run(port=port)