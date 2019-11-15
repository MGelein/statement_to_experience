import cv2

class Camera:

	def __init__(self, id):
		self.cap = cv2.VideoCapture(id) # video capture source camera (Here webcam of laptop) 

	def takePicture(self):
		ret,frame = self.cap.read() # return a single frame in variable `frame`

		return frame
