import cv2
import numpy as np
import requests

from Camera import Camera
from board_Recognition import board_Recognition

# Retrieve square positions
server_host = 'http://localhost:3000/'

r = requests.get(url = server_host + 'board-state/square-positions/')
squares = r.json()

crop_x1 = 80
crop_x2 = 560
crop_y1 = 0
crop_y2 = 480

video = cv2.VideoCapture(1)

start = 0
i = start

while True:
    if i >= 50:
        break

    ret, frame = video.read()
    img = frame[crop_y1:crop_y2, crop_x1:crop_x2]

    # Mask out a single square
    coords = [int(coord) for coord in squares['0,1']]

    x1 = coords[0]
    y1 = coords[1]
    x2 = coords[6]
    y2 = coords[7]

    square = img[y1:y2, x1:x2]

    print('Saving ' + str(i) + '...')
    cv2.imwrite('img/e/' + str(i) + '.png', square)

    i += 1

    # key=cv2.waitKey(1)
    # if key == ord('q'):
    #         break
    
video.release()
cv2.destroyAllWindows()