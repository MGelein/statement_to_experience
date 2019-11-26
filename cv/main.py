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
data = np.ndarray(shape=(32, 224, 224, 3), dtype=np.float32)

# Retrieve square positions
server_host = 'http://localhost:3000/'

r = requests.get(url = server_host + 'board-state/square-positions/')
squares = r.json()

crop_x1 = 80
crop_x2 = 560
crop_y1 = 0
crop_y2 = 480

video = cv2.VideoCapture(1)

ix_to_piece = ['b', 'w', ' ']

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
    ret, frame = video.read()
    img = frame[crop_y1:crop_y2, crop_x1:crop_x2]

    # Inference
    i = 0
    for pos in white_pos:
        coords = [int(coord) for coord in squares[pos]]

        x1 = coords[0]
        y1 = coords[1]
        x2 = coords[6]
        y2 = coords[7]

        square_cv = img[y1:y2, x1:x2]
    
        square_img_raw = cv2.cvtColor(square_cv, cv2.COLOR_BGR2RGB)
        square_im_pil = Image.fromarray(square_img_raw)
        square_img = square_im_pil.resize((224, 224))

        image_array = np.asarray(square_img)

        normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1

        data[i] = normalized_image_array
        i += 1

    output = model.predict(data)
    predictions = [ix_to_piece[np.argmax(pred)] for pred in output]

    board_state = np.full((8, 8), ' ')
    i = 0
    for pos in white_pos:
        row, col = pos.split(',')
        board_state[int(row)][int(col)] = predictions[i]
        i += 1

    post_data = {
        "0": board_state[0],
        "1": board_state[1],
        "2": board_state[2],
        "3": board_state[3],
        "4": board_state[4],
        "5": board_state[5],
        "6": board_state[6],
        "7": board_state[7],
    }

    r = requests.post(url = server_host + 'board-state/', data = post_data) 

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
video.release()
cv2.destroyAllWindows()