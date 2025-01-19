import serial
import subprocess
import time

# Serial port configuration
ser = serial.Serial("/dev/ttyUSB0", 9600)  # Replace with your actual serial port

# Global states
recording = False
last_press_time = 0
chrome_running = False

# Paths
python_path = "/Users/inderjeet/anaconda3/envs/py310/bin/python3"
chrome_script_path = "/Users/inderjeet/Downloads/nwhacks2025/open_chrome.py"

def handle_single_press():
    global recording
    if not recording:
        print("Recording started")
        # Add your microphone start code here
        recording = True
    else:
        print("Recording stopped")
        # Add your microphone stop code here
        recording = False

def handle_double_press():
    global last_press_time, chrome_running
    current_time = time.time()
    if current_time - last_press_time <= 2:  # Double press detected
        if not chrome_running:
            print("Chrome extension opened")
            subprocess.Popen([python_path, chrome_script_path])
            chrome_running = True
        else:
            print("Chrome extension already running")
    last_press_time = current_time

def main():
    while True:
        if ser.in_waiting > 0:
            data = ser.readline().decode().strip()
            if data == "BUTTON_PRESSED":
                handle_single_press()
            elif data == "DOUBLE_PRESS":
                handle_double_press()

if __name__ == "__main__":
    main()