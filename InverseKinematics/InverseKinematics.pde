Segment seg1;
Segment seg2;
final int CELL_SIZE = 40;
PVector target = new PVector(CELL_SIZE + 20, CELL_SIZE + 20);
PVector easeTarget = target.copy();

void setup(){
  size(512, 512);
  seg1 = new Segment();
  seg2 = new Segment();
}

void draw(){
  background(0);
  
  PVector diff = PVector.sub(target, easeTarget);
  diff.limit(3);
  easeTarget.add(diff);
  
  seg1.follow(easeTarget);
  seg2.follow(seg1.base);
  float offX = (CELL_SIZE * 9.5) - seg2.base.x;
  float offY = (CELL_SIZE * 9.5) - seg2.base.y;
  seg1.subCoords(offX, offY);
  seg2.subCoords(offX, offY);
  
  //First render the board
  noStroke();
  for(int x = 0; x < 8; x++){
    for(int y = 0; y < 8; y++){
      if(y % 2 == 0){
        fill(x % 2 == 0 ? 200: 40);
      }
      else{ 
        fill(x % 2 == 0 ? 40: 200);
      }
      square(x * 40 + 40, y * 40 + 40, 40);
    }
  }
  noFill();
  strokeWeight(1);
  stroke(255, 0, 0);
  square(target.x - 20, target.y - 20, CELL_SIZE);
  //now render the arm
  seg1.render();
  seg2.render();
}

void mousePressed(){
  target.set(int(mouseX / CELL_SIZE) * CELL_SIZE + 20, int(mouseY / CELL_SIZE) * CELL_SIZE + 20);
}
