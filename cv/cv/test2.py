#! /usr/bin/env python
# -*- coding: utf-8 -*-
"""
Created on 18/12/14
@author: Sammy Pfeiffer
From http://docs.opencv.org/trunk/doc/py_tutorials/py_calib3d/py_calibration/py_calibration.html#calibration
Extra info:
http://docs.opencv.org/2.4.10/modules/calib3d/doc/camera_calibration_and_3d_reconstruction.html?highlight=calibratecamera#cv2.calibrateCamera
I love this guy "OpenCV error messages suck":
https://adventuresandwhathaveyou.wordpress.com/2014/03/14/opencv-error-messages-suck/
Get pose:
http://docs.opencv.org/trunk/doc/py_tutorials/py_calib3d/py_pose/py_pose.html
"""

import numpy as np
import cv2
import glob
import math
import pickle

def _pdist(p1, p2):
    """
    Distance bwt two points. p1 = (x, y), p2 = (x, y)
    """
    return math.sqrt(math.pow(p1[0] - p2[0], 2) + math.pow(p1[1] - p2[1], 2))

def draw(img, corners, imgpts):
    corner = tuple(corners[0].ravel())
    cv2.line(img, corner, tuple(imgpts[0].ravel()), (255,0,0), 5)
    cv2.line(img, corner, tuple(imgpts[1].ravel()), (0,255,0), 5)
    cv2.line(img, corner, tuple(imgpts[2].ravel()), (0,0,255), 5)
    return img

# termination criteria
criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)

n_rows = 7
n_cols = 7
n_cols_and_rows = (n_cols, n_rows) #originally (7,6) # 4,5 same results
n_rows_and_cols = (n_rows, n_cols)


img = cv2.imread('img/4.jpg')
gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

# Find the chess board corners
ret, corners = cv2.findChessboardCorners(gray, n_rows_and_cols,None)

# If found, add object points, image points (after refining them)
if ret == True:
    print("  found " + str(len(corners)) + " corners.")

    # Draw and display the corners
    cv2.drawChessboardCorners(img, n_rows_and_cols, corners, ret)

    cv2.imshow('img',img)

    cv2.waitKey(0)
    cv2.destroyAllWindows()
else:
    print('Chessboard not found')