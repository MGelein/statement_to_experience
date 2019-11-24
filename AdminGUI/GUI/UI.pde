int HUE = 30;
color fgColor;
color bgColor;
float thickStroke;
float thinStroke = 2;
float fontSize;
ArrayList<Button> cmdButtons = new ArrayList<Button>();
boolean saveDialogOpened = true;
final String allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
String saveCommandName = "";
boolean showCursor = false;

void renderSaveOverlay(){
  fill(0, 120);
  noStroke();
  rect(0, 0, width, height);
  
  fill(fgColor);
  String label = "What part to save?";
  textSize(fontSize);
  float tw = textWidth(label);
  text(label, width / 2 - tw / 2, 200);
  
  String saveName = "SAVE NAME: " + saveCommandName;
  tw = textWidth(saveName);
  text(saveName + (showCursor ? "_" : ""), width / 2 - tw / 2, 300);
  
  saveLabel.render();  
  saveButton.render();  
  //Toggle the cursor on/off, for the blinking effect
  if(frameCount % 30 == 0) showCursor = !showCursor;
}

void updateCommandUI(){
  commandListUpdated = false;
  cmdButtons.clear();
  //Re-render all the buttons here
  float x = width / 2 + fontSize * 6;
  float xInc = fontSize * 9;
  float y = fontSize * 7;
  float yInc = fontSize * 4;
  for(String command: commands){
    CMDButton btn = new CMDButton(command, x, y);
    cmdButtons.add(btn);
    x += xInc;
    if(x > width - xInc) {
      x -= 4 * xInc;
      y += yInc;
    }
  }
}

void loadUIControls(){
  float sliderHeight = height - fontSize * 10;
  shoulderSlider = new Slider("Shoulder", fontSize * 5, fontSize * 7, 600, 2300, sliderHeight);
  shoulderSlider.setValue(1500);
  elbowSlider = new Slider("Elbow", fontSize * 14, fontSize * 7, 600, 2200, sliderHeight);
  elbowSlider.setValue(1500);
  linActSlider = new Slider("Lin.Act", fontSize * 23, fontSize * 7, 800, 2300, sliderHeight);
  linActSlider.setValue(1200);
  
  float toggleSize = fontSize * 5;
  directToggle = new Toggle("Direct Comm.", fontSize * 32, fontSize * 7, toggleSize);
  magnetToggle = new Toggle("Elec.Magnet", fontSize * 40, fontSize * 7, toggleSize);
  
  float buttonHeight = fontSize * 5;
  float buttonWidth = fontSize * 5;
  saveAsButton = new Button("Save As", fontSize * 32, fontSize * 17, buttonWidth, buttonHeight, new ClickHandler(){
    public void press(){
      saveDialogOpened = true;
    }
  });
  saveButton = new Button("Save", width / 2, height - 100, buttonWidth, buttonHeight, new ClickHandler(){
    public void press(){
      requestCommandSave();
    }
  });
  
  servoLabel = new Label("Servo Controls", fontSize * 8, fontSize * 2.5f);
  buttonLabel = new Label("Robot Buttons", fontSize * 36, fontSize * 2.5f);
  presetLabel = new Label("Preset Editor", fontSize * 36, fontSize * 13);
  saveLabel = new Label("Save Dialog", width / 2, 100);
}

void loadUISettings(){
  fgColor = color(HUE, 255, 255);
  bgColor = color(HUE, 125, 50);
  fontSize = height / 50f;
  textSize(fontSize);
  thinStroke = height / 450f;
  thickStroke = thinStroke * 3f;
}

abstract class ClickHandler{
  abstract void press();
}

class Label{
  String name;
  float x, y;
  
  Label(String name, float x, float y){
    this.x = x;
    this.y = y;
    this.name = name;
  }
  
  void render(){
    textSize(fontSize * 1.5f);
    stroke(fgColor);
    fill(fgColor);
    strokeWeight(thinStroke);
    float tw = textWidth(name);
    line(x - tw / 2, y, x + tw / 2, y);
    text(name, x - tw / 2, y);
  }
}

class CMDButton extends Button{
  CMDButton(String name, float x, float y){
    super(name, x, y, fontSize * 8, fontSize * 3, null);
    final String label = name;
    clickHandler = new ClickHandler(){
      public void press(){
        if(saveDialogOpened) return;
        loadStrings(SERVER + "arm/command/exec/" + label);
      }
    };
  }
}

class Button{
  float x, y;
  float h, w;
  String name;
  boolean pressed, hover;
  ClickHandler clickHandler;
  
  Button(String name, float x, float y, float w, float h, ClickHandler handler){
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    clickHandler = handler;
  }
  
  boolean isUnderMouse(){
    float hh = h / 2;
    float hw = w / 2;
    return mouseX > x - hw && mouseX < x + hw && mouseY > y - hh && mouseY < y + hh;
  }
  
  void render(){
    textSize(fontSize);
    hover = isUnderMouse();
    if(!mousePressed) pressed = false;
    if(mousePressed && hover && !pressed){
      pressed = true;
      if(clickHandler != null) clickHandler.press();
    }
    
    fill(pressed ? fgColor : bgColor, hover ? 120 : 255);
    stroke(fgColor, hover ? 200 : 255);
    strokeWeight(thinStroke);
    rect(x, y, w, h);
    fill(fgColor);
    text(name, x - textWidth(name) / 2, y + fontSize * .3f);
  }
}

class Slider{
  String name;
  float x, y;
  float min, max;
  float trackLength;
  float position;
  float value;
  boolean pressed;
  
  Slider(String name, float x, float y, float min, float max, float trackLength){
    this.name = name;
    this.x = x;
    this.y = y;
    this.min = min;
    this.max = max;
    this.trackLength = trackLength;
  }
  
  boolean isUnderMouse(){
    float hh = fontSize * 0.75f;
    float hw = fontSize * 2f;
    float ps = trackLength * position;
    return mouseX > x - hw && mouseX < x + hw && mouseY > y  - hh + ps && mouseY < y + hh + ps;
  }
  
  void setValue(float val){
    position = 1 - constrain(map(val, min, max, 0, 1), 0, 1);
  }
  
  float getValue(){
    return min + (max - min) * (1 - position);
  }
  
  
  void render(){
    textSize(fontSize);
    if(!mousePressed) pressed = false;
    else if(mousePressed && isUnderMouse()) pressed = true;
    
    if(pressed) position = constrain(mouseY - y, 0, trackLength) / trackLength;
    
    noFill();  
    strokeWeight(thickStroke);
    stroke(pressed ? fgColor : bgColor, pressed ? 120: 255);
    line(x, y, x, y + trackLength);
    strokeWeight(focusSlider == this ? thickStroke : thinStroke);
    stroke(fgColor, 120);
    rect(x, y + (trackLength - fontSize * 2f) / 2, fontSize * 8, trackLength + fontSize * 5f);
    strokeWeight(thinStroke);
    line(x, y, x, y + trackLength);
    
    stroke(fgColor);
    fill(bgColor);
    rect(x, y - fontSize * 2.5f, fontSize * 8, fontSize * 2f);
    strokeWeight(thinStroke * (pressed ? 2 : 1));
    rect(x, y + trackLength * position, fontSize * 6, fontSize * 2f);
    fill(fgColor);
    
    String label = toPrecision(getValue(), 1) + "";
    text(label, x - textWidth(label) / 2, y + trackLength * position + fontSize * .4f);
    text(name, x - textWidth(name) / 2, y - fontSize * 2.2);
  }
}

class Toggle{
  float x, y;
  boolean value;
  String name;
  float size;
  boolean pressed;
  
  Toggle(String name, float x, float y, float size){
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
  }
  
  boolean isUnderMouse(){
    float s2 = size / 2;
    return mouseX > x - s2 && mouseX < x + s2 && mouseY > y  - s2 && mouseY < y + s2;
  }
  
  void toggleValue(){
    value = !value;
  }
  
  void render(){
    textSize(fontSize);
    if(!mousePressed) pressed = false;
    if(mousePressed && isUnderMouse() && !pressed){
      toggleValue();
      pressed = true;
    }
    
    strokeWeight(thinStroke);
    stroke(fgColor);
    fill(bgColor);
    rect(x, y, size, size);
    
    fill(fgColor);
    text(name, x - textWidth(name) / 2, y - size / 2 - fontSize * .5f);
    
    String label = value ? "ON": "OFF";
    if(value){
      rect(x, y, size * .7f, size * .7f);
      fill(bgColor);
    }
    text(label, x - textWidth(label) / 2, y + fontSize * .3f);
  }
}
