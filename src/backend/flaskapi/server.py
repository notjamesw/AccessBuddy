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

port = 3000
app = Flask(__name__)