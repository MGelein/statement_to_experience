import cv2

class Camera:

	def __init__(self, id):
		camera_id = 0

		self.cap = cv2.VideoCapture(camera_id)

		fourcc = cv2.VideoWriter_fourcc('M','J','P','G')
		self.cap.set(cv2.CAP_PROP_FOURCC, fourcc)

		self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
		self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

	def takePicture(self):
		ret, frame = self.cap.read() # return a single frame in variable `frame`

		return frame
