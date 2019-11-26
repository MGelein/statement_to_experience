import cv2
import numpy as np

from Camera import Camera
from board_Recognition import board_Recognition


img = cv2.imread("../cv/img/1.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Source: https://github.com/rjgoodloe/ESE205-CVChess
camera = Camera(0)
rec = board_Recognition(camera)
rec.initialize_Board()

# sm = cv2.resize(img, (500, 500))

# cv2.imshow("linesDetected", sm)

# cv2.waitKey(0)
# cv2.destroyAllWindows()