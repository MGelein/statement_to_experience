import cv2

camera_id = 0
cap = cv2.VideoCapture(camera_id)
fourcc = cv2.VideoWriter_fourcc('M','J','P','G')
cap.set(cv2.CAP_PROP_FOURCC, fourcc)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 3840)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 2160)

while True:
    ret, frame = cap.read()
    cv2.imshow('img', frame)

    key=cv2.waitKey(1)
    if key == ord('q'):
            break
    
cap.release()
cv2.destroyAllWindows()