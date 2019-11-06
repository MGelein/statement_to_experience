DragSquare dragSquare;
PImage board;
int minimapSize = 0;
int minimapRes = 2;
float sizeFactor = 1;
float perspectiveFactor = 1f;
boolean upPressed = false;
boolean downPressed = false;
//costs ton of resources to calculate
boolean usePerspectiveCorrectionColor = true;

void settings(){
  board = loadImage("board3.jpg");
  if(board.width + board.height > 1920){
    minimapSize = board.height / 2;
    size(minimapSize + board.width / 2, board.height / 2);
    sizeFactor = .5f;
  }else{
    minimapSize = board.height;
    size(minimapSize + board.width, board.height);
  }
}

void setup(){
  dragSquare = new DragSquare();
}

void draw(){
  if(upPressed){
    perspectiveFactor += 0.01f;
  }else if(downPressed){
    perspectiveFactor -= 0.01f;
  }
  
  background(0);
  image(board, minimapSize, 0, board.width * sizeFactor, board.height * sizeFactor);
  
  //Draw the mipmap
  loadPixels();
  for(int x = 0; x < minimapSize; x+= minimapRes){
    for(int y = 0; y < minimapSize; y+= minimapRes){
      float fracX = x / (minimapSize * 1.0f);
      float fracY = y / (minimapSize * 1.0f);
      color c = dragSquare.colorAtScaledPoint(fracX, fracY);
      for(int posX = 0; posX < minimapRes; posX++){
        for(int posY = 0; posY < minimapRes; posY++){
          pixels[min(pixels.length - 1, (x + posX) + (y + posY) * width)] = c;
        }
      }
    }
  }
  updatePixels();
  
  //And finally render the dragsquare on top of it all
  dragSquare.render();
  
  stroke(255);
  line(minimapSize, 0, minimapSize, height);
  stroke(0);
  line(minimapSize + 1, 0, minimapSize + 1, height);
  
  fill(0);
  rect(width - 70, height - 20, 70, 20);
  fill(255);
  text((int) frameRate + " fps", width - 65, height - 5);
}

void keyPressed(){
  if(keyCode == UP){
    upPressed = true;
  }else if(keyCode == DOWN){
    downPressed = true;
  }
}

void keyReleased(){
  if(keyCode == UP){
    upPressed = false;
  }else if(keyCode == DOWN){
    downPressed = false;
  }
}

void mousePressed(){
  dragSquare.press();
}

void mouseReleased(){
  dragSquare.release();
}
