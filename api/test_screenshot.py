import pyautogui
from PIL import Image

def shotScreen():
    img_path = "../temp/test_image.jpg"
    screenshot = pyautogui.screenshot()
    screenshot = screenshot.convert("RGB")  # Ensure JPEG compatibility
    screenshot.save(img_path, "JPEG", quality=85)
    print(f"Screenshot saved to {img_path}")

if __name__ == "__main__":
    shotScreen()