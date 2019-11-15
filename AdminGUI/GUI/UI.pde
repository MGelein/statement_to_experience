final int HUE = 80;
color fgColor;
color bgColor;
float thickStroke;
float thinStroke = 2;
float fontSize;

void loadUISettings(){
  fgColor = color(HUE, 255, 255);
  bgColor = color(HUE, 125, 50);
  fontSize = height / 50f;
  textSize(fontSize);
  thinStroke = height / 450f;
  thickStroke = thinStroke * 3f;
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
    rect(x, y + (trackLength - fontSize * 2f) / 2, fontSize * 6, trackLength + fontSize * 5f);
    line(x, y, x, y + trackLength);
    
    stroke(fgColor);
    fill(bgColor);
    rect(x, y - fontSize * 2.5f, fontSize * 6, fontSize * 2f);
    strokeWeight(thinStroke * (pressed ? 2 : 1));
    rect(x, y + trackLength * position, fontSize * 4, fontSize * 1.5f);
    fill(fgColor);
    
    String label = toPrecision(getValue(), 1) + "";
    text(label, x - textWidth(label) / 2, y + trackLength * position + fontSize * .3f);
    text(name, x - textWidth(name) / 2, y - fontSize * 2);
  }
}
