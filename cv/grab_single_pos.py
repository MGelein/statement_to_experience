import cv2
import numpy as np
import requests

from Camera import Camera
from board_Recognition import board_Recognition

from settings import *

# Retrieve square positions
server_host = 'http://localhost:3000/'

r = requests.get(url = server_host + 'board-state/square-positions/')
squares = r.json()

cap = cv2.VideoCapture(camera_id)
fourcc = cv2.VideoWriter_fourcc('M','J','P','G')
cap.set(cv2.CAP_PROP_FOURCC, fourcc)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 3840)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 2160)

start = 170
i = start

while True:
    if i >= start + 10:
        break

    ret, frame = cap.read()

    img = frame[crop_y1 * scaling_factor:crop_y2 * scaling_factor, crop_x1 * scaling_factor:crop_x2 * scaling_factor]

    # Mask out a single square
    coords = [int(coord) for coord in squares['0,1']]

    # * 2 because the calibration is run on 1080p
    x1 = coords[0] * scaling_factor
    y1 = coords[1] * scaling_factor
    x2 = coords[6] * scaling_factor
    y2 = coords[7] * scaling_factor

    square = img[y1:y2, x1:x2]

    print('Saving ' + str(i) + '...')
    cv2.imwrite('img/w/' + str(i) + '.png', square)
    cv2.imshow('square', square)

    i += 1

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
cap.release()
cv2.destroyAllWindows()