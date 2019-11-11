class Segment{
  PVector base = new PVector();
  PVector end = new PVector();
  float l = 230;
  float a = 0;
  
  void render(){
    strokeWeight(4);
    stroke(255);
    line(base.x, base.y, end.x, end.y);
    circle(base.x, base.y, 10);
    circle(end.x, end.y, 10);
  }
  
  void subCoords(float x, float y){
    base.add(x, y);
    end.add(x, y);
  }
  
  void follow(PVector vec){
    PVector dir = PVector.sub(vec, base);
    end.set(vec);
    dir.rotate(PI);
    dir.setMag(l);
    a = dir.heading();
    base.set(PVector.add(end, dir));
  }  
}
