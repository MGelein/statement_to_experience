import cv2
import numpy as np
import requests
import tensorflow.keras
from PIL import Image

from Camera import Camera
from board_Recognition import board_Recognition

# Initialize Keras
np.set_printoptions(suppress=True)
model = tensorflow.keras.models.load_model('data/keras_model.h5')
data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)

# Retrieve square positions
server_host = 'http://localhost:3000/'

r = requests.get(url = server_host + 'board-state/square-positions/')
squares = r.json()

crop_x1 = 80
crop_x2 = 560
crop_y1 = 0
crop_y2 = 480

video = cv2.VideoCapture(1)

while True:
    ret, frame = video.read()
    img = frame[crop_y1:crop_y2, crop_x1:crop_x2]

    coords = [int(coord) for coord in squares['0,1']]

    x1 = coords[0]
    y1 = coords[1]
    x2 = coords[6]
    y2 = coords[7]

    square = img[y1:y2, x1:x2]
    cv2.imshow("Square", square)

    # Inference
    square_img_raw = cv2.cvtColor(square, cv2.COLOR_BGR2RGB)
    square_im_pil = Image.fromarray(square_img_raw)
    square_img = square_im_pil.resize((224, 224))

    image_array = np.asarray(square_img)

    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1

    data[0] = normalized_image_array
    prediction = model.predict(data)

    print(prediction)

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
video.release()
cv2.destroyAllWindows()




# data = {
#     "0": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
#     "1": [' ', ' ', 'b', ' ', ' ', ' ', ' ', ' '],
#     "2": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
#     "3": [' ', ' ', 'w', ' ', ' ', ' ', ' ', ' '],
#     "4": [' ', 'w', ' ', 'w', ' ', ' ', ' ', ' '],
#     "5": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
#     "6": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
#     "7": [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
# }
  
# r = requests.post(url = server_host + 'board-state/', data = data) 


# # Source: https://github.com/rjgoodloe/ESE205-CVChess
# camera = Camera(0)
# rec = board_Recognition(camera)
# board = rec.initialize_Board()

# for square in board.squares:
#     print(str(square.c1) + ', ' + str(square.c2) + ', ' + str(square.c3) + ', ' + str(square.c4))