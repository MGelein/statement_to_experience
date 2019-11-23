Slider shoulderSlider;
Slider elbowSlider;
Slider linActSlider;

Toggle directToggle;
Toggle magnetToggle;

Button saveButton;

Label servoLabel;
Label buttonLabel;
Label presetLabel;

void setup(){
  size(1600, 900, P2D);
  frameRate(30);
  colorMode(HSB);
  rectMode(CENTER);
  loadUISettings();
  loadUIControls();
}

void draw(){
  background(0);
  
  shoulderSlider.render();
  elbowSlider.render();
  linActSlider.render();
  
  directToggle.render();
  magnetToggle.render();
  
  saveButton.render();
  
  servoLabel.render();
  buttonLabel.render();
  presetLabel.render();
  
  if(directToggle.value) sendDirect();
}

float toPrecision(float val, int precision){
  float mult = pow(10, precision);
  return ((int)(mult * val)) / mult;
}
