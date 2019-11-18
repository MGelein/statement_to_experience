final int HUE = 30;
color fgColor;
color bgColor;
float thickStroke;
float thinStroke = 2;
float fontSize;

void loadUIControls(){
  float sliderHeight = height - fontSize * 10;
  shoulderSlider = new Slider("Shoulder", fontSize * 5, fontSize * 7, 1000, 2000, sliderHeight);
  elbowSlider = new Slider("Elbow", fontSize * 14, fontSize * 7, 1000, 2000, sliderHeight);
  linActSlider = new Slider("Lin.Act", fontSize * 23, fontSize * 7, 1000, 2000, sliderHeight);
  
  float toggleSize = fontSize * 5;
  directToggle = new Toggle("Direct Comm.", fontSize * 32, fontSize * 7, toggleSize);
  magnetToggle = new Toggle("Elec.Magnet", fontSize * 40, fontSize * 7, toggleSize);
  
  float buttonHeight = fontSize * 5;
  float buttonWidth = fontSize * 5;
  saveButton = new Button("Save As", fontSize * 32, fontSize * 17, buttonWidth, buttonHeight, new ClickHandler(){
    public void press(){println("testing save button");}
  });
  
  servoLabel = new Label("Servo Controls", fontSize * 8, fontSize * 2.5f);
  buttonLabel = new Label("Robot Buttons", fontSize * 36, fontSize * 2.5f);
  presetLabel = new Label("Preset Editor", fontSize * 36, fontSize * 13);
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
    return min + (max - min) * position;
  }
  
  void render(){
    textSize(fontSize);
    if(!mousePressed) pressed = false;
    else if(mousePressed && isUnderMouse()) pressed = true;
    
    if(pressed){
      setValue((1 - constrain((mouseY - y) / trackLength, 0, 1)) * (max - min) + min);
    }
    
    noFill();  
    strokeWeight(thickStroke);
    stroke(pressed ? fgColor : bgColor, pressed ? 120: 255);
    line(x, y, x, y + trackLength);
    strokeWeight(thinStroke);
    stroke(fgColor, 120);
    rect(x, y + (trackLength - fontSize * 2f) / 2, fontSize * 8, trackLength + fontSize * 5f);
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