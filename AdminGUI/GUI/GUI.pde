void setup(){
  size(1600, 900, P2D);
  frameRate(30);
  colorMode(HSB);
  rectMode(CENTER);
  loadUISettings();
}

void draw(){
  background(0);
  s1.render();  }

void mousePressed(){
  
}

void mouseReleased(){
  
}

float toPrecision(float val, int precision){
  float mult = pow(10, precision);
  return ((int)(mult * val)) / mult;
}
