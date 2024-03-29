import cv2
import numpy as np
import requests
import tensorflow.keras
from PIL import Image
import time

from Camera import Camera
from board_Recognition import board_Recognition

from settings import *

def boot_camera():
    global cap
    cap = cv2.VideoCapture(camera_id)
    fourcc = cv2.VideoWriter_fourcc('M','J','P','G')
    cap.set(cv2.CAP_PROP_FOURCC, fourcc)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 3840)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 2160)

# Initialize Keras
np.set_printoptions(suppress=True)
model = tensorflow.keras.models.load_model('data/keras_model.h5')
data = np.ndarray(shape=(32, 224, 224, 3), dtype=np.float32)

# Retrieve square positions
server_host = 'http://localhost:3000/'

r = requests.get(url = server_host + 'board-state/square-positions/')
squares = r.json()

cap = cv2.VideoCapture(camera_id)
fourcc = cv2.VideoWriter_fourcc('M','J','P','G')
cap.set(cv2.CAP_PROP_FOURCC, fourcc)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 3840)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 2160)

boot_camera()

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
    ret, frame = cap.read()
    if ret:
        if frame.shape[0] != 1080 * scaling_factor or frame.shape[1] != 1920 * scaling_factor:
            print(frame.shape)
            boot_camera()
            
            continue

        skip_frame = False
        img = frame[crop_y1 * scaling_factor:crop_y2 * scaling_factor, crop_x1 * scaling_factor:crop_x2 * scaling_factor]

        # Inference
        i = 0
        for pos in white_pos:
            coords = [int(coord) for coord in squares[pos]]

            # Times 2 because the calibration is run on 1920x1080
            x1 = coords[0] * scaling_factor
            y1 = coords[1] * scaling_factor
            x2 = coords[6] * scaling_factor
            y2 = coords[7] * scaling_factor

            square_cv = img[y1:y2, x1:x2]
            try:
                square_img_raw = cv2.cvtColor(square_cv, cv2.COLOR_BGR2RGB)
                square_im_pil = Image.fromarray(square_img_raw)
                square_img = square_im_pil.resize((224, 224))

                image_array = np.asarray(square_img)

                normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1

                data[i] = normalized_image_array
                i += 1
            except:
                print('Failed to recognize a square.')
                skip_frame = True

                cv2.imshow('Image', img)
                cv2.imshow('Pre-crop', frame)
                
                break

        if skip_frame:
            continue

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

        try:
            r = requests.post(url = server_host + 'board-state/', data = post_data)

            # Save the square images as the training dataset
            if r.text.isdigit() and int(r.text) == 2 and save_training_data == True:                
                for pos in white_pos:
                    row, col = pos.split(',')
                    piece = board_state[int(row)][int(col)]

                    if piece != ' ':
                        coords = [int(coord) for coord in squares[pos]]

                        x1 = coords[0] * scaling_factor
                        y1 = coords[1] * scaling_factor
                        x2 = coords[6] * scaling_factor
                        y2 = coords[7] * scaling_factor

                        square_cv = img[y1:y2, x1:x2]

                        filename = str(int(time.time())) + '-' + pos + '.jpg'
                        cv2.imwrite('img/' + piece + '/' + filename, square_cv)



        except requests.exceptions.ConnectionError:
            print('Failed to send board state to the server.')

        key = cv2.waitKey(1)
        if key == ord('q'):
            break
    else:
        print('No frame received...')
        
        boot_camera()
    
video.release()
cv2.destroyAllWindows()