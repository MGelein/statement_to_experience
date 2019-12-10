import cv2

class Camera:

	def __init__(self, id):
		self.cap = cv2.VideoCapture(id)

		fourcc = cv2.VideoWriter_fourcc('M','J','P','G')
		self.cap.set(cv2.CAP_PROP_FOURCC, fourcc)

		# Calibration has to be 1080p, doesnt work with 4K
		self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
		self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

	def takePicture(self):
		ret, frame = self.cap.read() # return a single frame in variable `frame`

		crop_x1 = int(170 * 3)
		crop_x2 = int(430 * 3)
		crop_y1 = int(7 * 3)
		crop_y2 = int(265 * 3)
	
		crop = frame[crop_y1:crop_y2, crop_x1:crop_x2]

		return crop
