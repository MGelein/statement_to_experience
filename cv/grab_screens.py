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

start = 150
i = start

white_pos = [
    '0,1', '0,3', '0,5', '0,7',
    '1,0', '1,2', '1,4', '1,6',
    '2,1', '2,3', '2,5', '2,7',
    '3,0', '3,2', '3,4', '3,6',
    '4,1', '4,3', '4,5', '4,7',
    '5,0', '5,2', '5,4', '5,6',
    '6,1', '6,3', '6,5', '6,7',
    '7,0', '7,2', '7,4', '7,6',
]

while True:
    if i >= start + 50:
        break

    ret, frame = cap.read()

    img = frame[crop_y1:crop_y2, crop_x1:crop_x2]

    for pos in white_pos:
        # Mask out a single square
        coords = [int(coord) for coord in squares[pos]]

        # * 2 because the calibration is run on 1080p
        x1 = coords[0] * 2
        y1 = coords[1] * 2
        x2 = coords[6] * 2
        y2 = coords[7] * 2

        square = img[y1:y2, x1:x2]

        row = int(pos.split(',')[0])
        piece = ''

        if row >= 5:
            piece = 'b'
        else if row >= 3:
            piece = 'e'
        else:
            piece = 'w'

        print('Saving ' + str(i) + '...')
        cv2.imwrite('img/' + str(piece) + '/' + str(i) + '.png', square)
        cv2.imshow('square', square)

    i += 1

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
cap.release()
cv2.destroyAllWindows()