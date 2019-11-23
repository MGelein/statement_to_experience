final String SERVER = "http://localhost:3000/";
int lastLinActVal = 0;
int lastShoulderVal = 0;
int lastElbowVal = 0;
int lastMagnetVal = 0;

void sendDirect(){
  if(frameCount % 10 == 0){
    thread("networkSendAll");
  }
}

void networkSendAll(){
  int linActVal = (int) linActSlider.getValue();
  int shoulderVal = (int) shoulderSlider.getValue();
  int elbowVal = (int) elbowSlider.getValue();
  int magnetVal = magnetToggle.value ? 1 : 0;
  if(lastLinActVal == linActVal && shoulderVal == lastShoulderVal && lastElbowVal == elbowVal && magnetVal == lastMagnetVal) return;
  lastLinActVal = linActVal;
  lastShoulderVal = shoulderVal;
  lastElbowVal = elbowVal;
  lastMagnetVal = magnetVal;
  String posCmd = "arm/direct/P(" + shoulderVal + "_" + elbowVal + ")";
  String linCmd = "arm/direct/L(" + linActVal + ")";
  String magCmd = "arm/direct/M(" + magnetVal + ")";
  loadStrings(SERVER + posCmd);
  loadStrings(SERVER + linCmd);
  loadStrings(SERVER + magCmd);
  println("Sent @" + frameCount);
}
