import serial
import webbrowser
import time

# Configure the serial port (change 'COM3' to your Arduino's port)
# On Windows it's typically 'COM3', 'COM4', etc.
# On Mac/Linux it's typically '/dev/ttyUSB0' or '/dev/ttyACM0'
ser = serial.Serial('/dev/cu.usbmodem11401', 9600, timeout=1)

# Your desired URL
BROWSER_URL = "https://www.example.com"  # Replace with your URL

def open_browser():
    webbrowser.open("chrome-extension://fbopkicdkienolnpapbicadniknoaobj/index.html")

try:
    while True:
        if ser.in_waiting:
            line = ser.readline().decode('utf-8').strip()
            if line == "PRESSED":
                print("Button pressed! Opening browser...")
                open_browser()
                time.sleep(1)  # Prevent multiple opens

except KeyboardInterrupt:
    print("\nExiting program")
    ser.close()