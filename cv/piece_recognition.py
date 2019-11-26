import tensorflow.keras
from PIL import Image
import numpy as np
import cv2

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the model
model = tensorflow.keras.models.load_model('data/keras_model.h5')

# Create the array of the right shape to feed into the keras model
# The 'length' or number of images you can put into the array is
# determined by the first position in the shape tuple, in this case 1.
data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)

video = cv2.VideoCapture(0)

while True:
    ret, frame = video.read()
    cv2.imshow("Webcam", frame)

    # Make sure to resize all images to 224, 224 otherwise they won't fit in the array
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    im_pil = Image.fromarray(img)
    image = im_pil.resize((224, 224))

    image_array = np.asarray(image)

    # Normalize the image
    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1

    # Load the image into the array
    data[0] = normalized_image_array

    # run the inference
    prediction = model.predict(data)
    print(prediction)

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
video.release()
cv2.destroyAllWindows()

