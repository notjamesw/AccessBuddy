import serial
import webbrowser
import time
from serial.tools import list_ports
import os
import pyautogui
import subprocess
chrome_path = "/Applications/Google Chrome.app"



# Add a global variable to track if we're on the extension page
extension_page_active = False

def find_arduino_port():
    """Find the COM port for the Arduino"""
    ports = list(list_ports.comports())
    print("Available ports:")
    for port in ports:
        print(f"- {port.device}: {port.description}")
        if "Arduino" in port.description:
            return port.device
    return '/dev/cu.usbmodem21401'  # Default fallback

def setup_serial_connection(port):
    """Setup the serial connection with proper error handling"""
    try:
        # Close any existing connections
        try:
            temp_ser = serial.Serial(port)
            temp_ser.close()
        except:
            pass

        time.sleep(1)  # Brief pause
        
        # Open new connection
        ser = serial.Serial(port, 9600, timeout=1)
        print(f"Successfully connected to {port}")
        return ser
    except Exception as e:
        print(f"Error connecting to {port}: {e}")
        return None

def open_browser():
    """Open Chrome and use keyboard shortcuts to open extension"""
    global extension_page_active
    print("Attempting to open browser...")
    try:
        # Your specific Chrome path
        chrome_path = r"/Applications/Google Chrome.app"
        
        if not os.path.exists(chrome_path):
            raise Exception("Chrome not found! Please check if Chrome is installed.")
            
        subprocess.run(["open", "-a", chrome_path], check=True)
        print("Browser opened successfully.")
        time.sleep(2)  # Wait for Chrome to open
        
        # Use Chrome's keyboard shortcut to open extensions menu
        pyautogui.hotkey('ctrl', 'e')  # Opens Chrome menu
        time.sleep(0.5)
        
        # Set the flag to indicate we're on the extension page
        extension_page_active = True
        print("Chrome process started successfully")
    except Exception as e:
        extension_page_active = False
        print(f"Error: {str(e)}")

def toggle_mic():
    """Toggle microphone by pressing tab three times and enter"""
    global extension_page_active
    try:
        if not extension_page_active:
            print("Warning: Not on extension page. Please open extension first.")
            return
            
        print("Toggling microphone...")
        # Press tab three times
        for _ in range(3):
            pyautogui.press('tab')
            time.sleep(0.2)
        # Press enter
        pyautogui.press('enter')
        print("Microphone toggled")
    except Exception as e:
        print(f"Error toggling microphone: {str(e)}")

def main():
    global extension_page_active
    # Find and connect to Arduino
    port = find_arduino_port()
    ser = setup_serial_connection(port)
    
    if not ser:
        print("Failed to connect to Arduino. Please check the connection and try again.")
        return

    print("Listening for button press... (Press Ctrl+C to exit)")
    try:
        while True:
            if ser.in_waiting:
                line = ser.readline().decode('utf-8').strip()
                if line == "DOUBLE":
                    print("Double click detected! Opening browser...")
                    open_browser()
                elif line == "SINGLE":
                    if extension_page_active:
                        print("Single click detected! Toggling mic...")
                        toggle_mic()
                    else:
                        print("Warning: Please open extension first (double-click)")
                time.sleep(0.1)  # Small delay between reads
                    
    except KeyboardInterrupt:
        print("\nExiting program")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        extension_page_active = False
        if 'ser' in locals():
            ser.close()

if __name__ == "__main__":
    main()