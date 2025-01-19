import cv2
from matplotlib import pyplot as plt
import easyocr

img_path = "../temp/image.png"
threshold = 0.9

# Load the image
image = cv2.imread(img_path)

if image is None:
    raise ValueError(f"Image not found at path: {img_path}")

reader = easyocr.Reader(["en"])
results = reader.readtext(image)

for result in results:
    bbox, text, score = result

    # Optional: Filter based on confidence score
    if score < threshold:
        continue  # Skip low-confidence detections

    # Convert bbox points to integer tuples
    pt1 = tuple(map(int, bbox[0]))
    pt2 = tuple(map(int, bbox[2]))

    # Draw rectangle
    cv2.rectangle(image, pt1, pt2, (0, 255, 0), 2)

    # Optionally, you can put the detected text above the rectangle
    # cv2.putText(image, text, (pt1[0], pt1[1] - 10),
    #             cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

# Convert BGR (OpenCV format) to RGB (Matplotlib format)
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

plt.figure(figsize=(10, 10))
plt.imshow(image_rgb)
plt.axis("off")  # Hide axis
plt.show()
