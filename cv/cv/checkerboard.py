import numpy as np
import cv2 
from checkerboard import detect_checkerboard

# prepare object points, like (0,0,0), (1,0,0), (2,0,0) ....,(6,5,0)
# objp = np.zeros((7*7,3), np.float32)
# objp[:,:2] = np.mgrid[0:7, 0:7].T.reshape(-1 , 2)

# # Arrays to store object points and image points from all the images.
# objpoints = [] # 3d points in real world space
# imgpoints = [] # 2d points in image plane.

# # Step through the list and search for chessboard corners
img = cv2.imread('img/3.jpg')
# gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# # Find the chessboard corners
# ret, corners = cv2.findChessboardCorners(gray, (7,7), None)

corners, score = detect_checkerboard(img, (8, 8))

print(corners)
print(score)

# objpoints.append(objp)
# imgpoints.append(corners)

# # Draw and display the corners
# cv2.drawChessboardCorners(img, (7,7), corners, ret)
# #write_name = 'corners_found'+str(idx)+'.jpg'
# #cv2.imwrite(write_name, img)

# small = cv2.resize(img, (800, 800)) 

# while True:
#     cv2.imshow('frame', small)

#     key = cv2.waitKey(0)
#     if key == 27:
#         cv2.destroyAllWindows()
#         break