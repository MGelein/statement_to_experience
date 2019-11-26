import cv2

class Camera:

	def __init__(self, id):
		self.cap = cv2.VideoCapture(id) # video capture source camera (Here webcam of laptop) 

	def takePicture(self):
		ret,frame = self.cap.read() # return a single frame in variable `frame`

		x1 = 80
		x2 = 560
		y1 = 0
		y2 = 480
		crop = frame[y1:y2, x1:x2]

		return crop
