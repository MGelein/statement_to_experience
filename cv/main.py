import cv2
import numpy as np
import requests

from Camera import Camera
from board_Recognition import board_Recognition

server_host = 'http://localhost:3000/'
data = {
    "0": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    "1": [' ', ' ', 'b', ' ', ' ', ' ', ' ', ' '],
    "2": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    "3": [' ', ' ', 'w', ' ', ' ', ' ', ' ', ' '],
    "4": [' ', 'w', ' ', 'w', ' ', ' ', ' ', ' '],
    "5": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    "6": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    "7": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
}
  
# sending post request and saving response as response object 
r = requests.post(url = server_host + 'board-state/', data = data) 


# # Source: https://github.com/rjgoodloe/ESE205-CVChess
# camera = Camera(0)
# rec = board_Recognition(camera)
# board = rec.initialize_Board()

# for square in board.squares:
#     print(str(square.c1) + ', ' + str(square.c2) + ', ' + str(square.c3) + ', ' + str(square.c4))