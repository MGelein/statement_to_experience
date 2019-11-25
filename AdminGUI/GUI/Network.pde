boolean commandListValid = false;
boolean commandListUpdated = false;
StringList commands = new StringList();
final String SERVER = "http://localhost:3000/";
int lastLinActVal = 0;
int lastShoulderVal = 0;
int lastElbowVal = 0;
int lastMagnetVal = 0;
String commandToRemove = "";

void requestDeleteCommand(String name){
  commandToRemove = name;
  thread("deleteCommand");
}

void deleteCommand(){
  loadStrings(SERVER + "arm/command/delete/" + commandToRemove);
  commandListValid = false;
}

void requestCommandSave(String type){
  saveDialogOpened = false;
  if(type.equals("POS")) thread("savePosition");
  if(type.equals("LIN")) thread("savePosition");
  if(type.equals("MAG")) thread("savePosition");
}

void savePosition(){
  int shoulder = (int) shoulderSlider.getValue();
  int elbow = (int) elbowSlider.getValue();
  String command = "P(" + shoulder + "_" + elbow + ")";
  loadStrings(SERVER + "arm/command/save/" + saveCommandName + "/" + command);
  commandListValid = false;
  saveCommandName = "";
}

void saveLinAct(){
  int linAct = (int) linActSlider.getValue();
  String command = "L(" + linAct + ")";
  loadStrings(SERVER + "arm/command/save/" + saveCommandName + "/" + command);
  commandListValid = false;
  saveCommandName = "";
}

void saveMagnet(){
  int magnet = magnetToggle.value ? 1 : 0;
  String command = "M(" + magnet + ")";
  loadStrings(SERVER + "arm/command/save/" + saveCommandName + "/" + command);
  commandListValid = false;
  saveCommandName = "";
}

void requestCommandList(){
  commandListValid = true;
  thread("getCommandList");
}

void getCommandList(){
  commands.clear();
  String[] lines = loadStrings(SERVER + "arm/command/list/");
  for(String line : lines){
    commands.append(line.split("\t")[0]);
  }
  commandListUpdated = true;
}

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
}
