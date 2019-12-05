import cv2
import numpy as np
import requests

from Camera import Camera
from board_Recognition import board_Recognition

server_host = 'http://localhost:3000/'

# Source: https://github.com/rjgoodloe/ESE205-CVChess
camera = Camera(0)
img = camera.takePicture()

w = img.shape[1] / 8
h = img.shape[0] / 8

while True:
    for row in range(8):
        for col in range(8):
            x1 = int(col * w)
            x2 = int(col * w + w)
            y1 = int(row * h)
            y2 = int(row * h + h)

            square = img[y1:y2, x1:x2]
            cv2.rectangle(img, (x1, y1), (x2, y2), (255,0,0), 2)

    cv2.imshow('image', img)

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
cv2.destroyAllWindows()