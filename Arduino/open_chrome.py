import subprocess

# Path to Chrome application
chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Path to your unpacked Chrome extension
extension_path = "../"

# Launch Chrome with the extension loaded
subprocess.Popen([chrome_path, f"--load-extension={extension_path}"])