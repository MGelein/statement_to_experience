import cv2
import numpy as np
import requests
from PIL import Image
import time

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

while True:
    ret, frame = cap.read()
    if ret:
        if frame.shape[0] != 2160 or frame.shape[1] != 3840:
            print(frame.shape)
            cap = cv2.VideoCapture(camera_id)
            
            continue

        skip_frame = False
        img = frame[crop_y1:crop_y2, crop_x1:crop_x2]

        topleft = [int(coord) for coord in squares['0,0']]
        # topright = [int(coord) for coord in squares['0,7']]
        # bottomleft = [int(coord) for coord in squares['7,0']]
        # bottomright = [int(coord) for coord in squares['7,7']]

        ctr = np.array(topleft).reshape((-1,1,2)).astype(np.int32)
        cv2.drawContours(img, [ctr], 0, (0,0,255), 3)
        cv2.imshow('position', img)

        key = cv2.waitKey(1)
        if key == ord('q'):
            break
    else:
        print('No frame received...')
        cap.release()
        cap.open(camera_id)
    
video.release()
cv2.destroyAllWindows()