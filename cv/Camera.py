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

		# x1 = int(170 * 3)
		# x2 = int(460 * 3)
		# y1 = int(9 * 2.25)
		# y2 = int(378 * 2.25)
	
		# crop = frame[y1:y2, x1:x2]

		return frame
