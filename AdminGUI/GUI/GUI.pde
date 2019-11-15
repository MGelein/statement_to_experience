Slider shoulderSlider;
Slider elbowSlider;
Slider linActSlider;
Toggle directToggle;
Toggle magnetToggle;

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
}

float toPrecision(float val, int precision){
  float mult = pow(10, precision);
  return ((int)(mult * val)) / mult;
}
