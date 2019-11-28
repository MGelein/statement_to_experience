import cv2
import numpy as np
import requests

from Camera import Camera
from board_Recognition import board_Recognition

server_host = 'http://localhost:3000/'

# Source: https://github.com/rjgoodloe/ESE205-CVChess
camera = Camera(0)
rec = board_Recognition(camera)
board = rec.initialize_Board()

data = {}
row = 0
col = 0
for square in board.squares:
    # print(str(square.c1) + ', ' + str(square.c2) + ', ' + str(square.c3) + ', ' + str(square.c4))
    data[str(row) + ',' + str(col)] = [square.c1, square.c2, square.c3, square.c4]

    row += 1

    if row > 7:
        row = 0
        col += 1
  
# sending post request and saving response as response object 
r = requests.post(url = server_host + 'board-state/square-positions/', data = data) 
