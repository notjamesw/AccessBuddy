import string
import time
import cv2
import numpy as np
import pyautogui
import easyocr
import Levenshtein
from flask import Flask, jsonify, request
import os
import base64
from PIL import Image
from speechbrain.inference import EncoderDecoderASR

port = 3000
app = Flask(__name__)

current_directory = os.path.dirname(__file__)  
img_path = os.path.join(current_directory, "../temp/image.png")

reader = easyocr.Reader(["en"], gpu=False)

def convert_speech_to_text():
    asr_model = EncoderDecoderASR.from_hparams(
        source="speechbrain/asr-conformer-transformerlm-librispeech", 
        savedir="../temp/pretrained_models/asr-transformer-transformerlm-librispeech")
    text = asr_model.transcribe_file("../temp/output.wav")
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
    img_path = "/Users/inderjeet/Downloads/SoCalHackathon2024/temp/image.png"
    os.makedirs(os.path.dirname(img_path), exist_ok=True)  # Ensure directory exists
    screenshot = pyautogui.screenshot()
    screenshot = screenshot.resize((512, 512))  # Resize to 512x512
    screenshot = screenshot.convert("RGB")  # Ensure RGB mode
    screenshot.save(img_path, "PNG")  # Save as PNG
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


@app.route("/analyze_screen", methods=["GET"])
def analyze_screen():
    try:
        shotScreen()
        if not os.path.exists(img_path):
            return jsonify(isSuccess=False, error="Screenshot failed to save.")
        print("Image captured successfully.")
        return jsonify(isSuccess=True)
    except Exception as e:
        print(f"Error during screenshot: {str(e)}")
        return jsonify(isSuccess=False, error=str(e))

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

if __name__ == "__main__":
    print(f"Flask Server Running on: http://localhost:{port}")
    app.run(port=port)
