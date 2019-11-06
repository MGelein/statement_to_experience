DragSquare dragSquare;
PImage board;
int minimapSize = 0;
int minimapRes = 2;
float sizeFactor = 1;
float perspectiveFactorX= 1f;
float perspectiveFactorY = 1f;
boolean upPressed, downPressed, leftPressed, rightPressed;
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
  perspectiveFactorY += (upPressed ? 0.02f : downPressed ? -0.02f: 0);
  perspectiveFactorX += (leftPressed ? 0.08f : rightPressed ? -0.08f: 0);
  
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
  if(keyCode == UP) upPressed = true;
  if(keyCode == DOWN) downPressed = true;
  if(keyCode == LEFT) leftPressed = true;
  if(keyCode == RIGHT) rightPressed = true;
}

void keyReleased(){
  if(keyCode == UP) upPressed = false;
  if(keyCode == DOWN) downPressed = false;
  if(keyCode == LEFT) leftPressed = false;
  if(keyCode == RIGHT) rightPressed = false;
}

void mousePressed(){
  dragSquare.press();
}

void mouseReleased(){
  dragSquare.release();
}
