import cv2
import numpy as np

def hor_vert_lines(lines):
    """
    A line is given by rho and theta. Given a list of lines, returns a list of
    horizontal lines (theta=90 deg) and a list of vertical lines (theta=0 deg).
    """
    h = []
    v = []
    for distance, angle in lines:
        if angle < np.pi / 4 or angle > np.pi - np.pi / 4:
            v.append([distance, angle])
        else:
            h.append([distance, angle])
    return h, v

def intersections(h, v):
    """
    Given lists of horizontal and vertical lines in (rho, theta) form, returns list
    of (x, y) intersection points.
    """
    points = []
    for d1, a1 in h:
        for d2, a2 in v:
            A = np.array([[np.cos(a1), np.sin(a1)], [np.cos(a2), np.sin(a2)]])
            b = np.array([d1, d2])
            point = np.linalg.solve(A, b)
            points.append(point)
    return np.array(points)

img = cv2.imread("img/4.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# min_y = 100
# max_y = 600
# min_x = 50
# max_x = 420
# crop_img = img[min_y:max_y, min_x:max_x]

kernel_size = 3
blur_gray = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)

edges = cv2.Canny(blur_gray, 75, 150)
lines = cv2.HoughLinesP(edges, 1, np.pi/180, 30, maxLineGap=250)

diff_eps = 10
hor_vert_lines = []
for line in lines:
    x1, y1, x2, y2 = line[0]

    if abs(x1 - x2) < diff_eps or abs(y1 - y2) < diff_eps:
        hor_vert_lines.append(line)
        cv2.line(img, (x1, y1), (x2, y2), (0, 0, 128), 1)

# lines = np.reshape(lines, (-1, 2))
# hor_vert_lines = hor_vert_lines(lines)

# for line in np.concatenate(hor_vert_lines):
#     x1, y1, x2, y2 = line[0]
#     cv2.line(img, (x1, y1), (x2, y2), (0, 0, 128), 1)


# intersections = intersections(hor_vert_lines)

# for point in intersections:

sm = cv2.resize(img, (500, 500))

cv2.imshow("linesDetected", sm)

cv2.waitKey(0)
cv2.destroyAllWindows()