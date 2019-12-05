import cv2
import numpy as np
import requests

from Camera import Camera
from board_Recognition import board_Recognition

# Retrieve square positions
server_host = 'http://localhost:3000/'

r = requests.get(url = server_host + 'board-state/square-positions/')
squares = r.json()

crop_x1 = int(180 * 6)
crop_x2 = int(445 * 6)
crop_y1 = int(17 * 6)
crop_y2 = int(275 * 6)

camera_id = 1
cap = cv2.VideoCapture(camera_id)
fourcc = cv2.VideoWriter_fourcc('M','J','P','G')
cap.set(cv2.CAP_PROP_FOURCC, fourcc)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 3840)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 2160)

start = 150
i = start

while True:
    if i >= start + 50:
        break

    ret, frame = cap.read()

    img = frame[crop_y1:crop_y2, crop_x1:crop_x2]

    # Mask out a single square
    coords = [int(coord) for coord in squares['3,4']]

    # * 2 because the calibration is run on 1080p
    x1 = coords[0] * 2
    y1 = coords[1] * 2
    x2 = coords[6] * 2
    y2 = coords[7] * 2

    square = img[y1:y2, x1:x2]

    print('Saving ' + str(i) + '...')
    cv2.imwrite('img/b/' + str(i) + '.png', square)
    cv2.imshow('square', square)

    i += 1

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
cap.release()
cv2.destroyAllWindows()