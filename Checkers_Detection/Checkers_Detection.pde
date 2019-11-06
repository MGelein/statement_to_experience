DragSquare dragSquare;
PImage board;
int minimapSize = 0;
float sizeFactor = 1;
float perspectiveFactor = 1f;

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
  background(0);
  image(board, minimapSize, 0, board.width * sizeFactor, board.height * sizeFactor);
  
  //Draw the mipmap
  loadPixels();
  for(int x = 0; x < minimapSize; x++){
    for(int y = 0; y < minimapSize; y++){
      float fracX = x / (minimapSize * 1.0f);
      float fracY = y / (minimapSize * 1.0f);
      pixels[min(pixels.length - 1, x + y * width)] = dragSquare.colorAtScaledPoint(fracX, fracY);
    }
  }
  updatePixels();
  
  //And finally render the dragsquare on top of it all
  dragSquare.render();
  
  fill(0);
  rect(width - 70, height - 20, 70, 20);
  fill(255);
  text((int) frameRate + " fps", width - 65, height - 5);
}

void mousePressed(){
  dragSquare.press();
}

void mouseReleased(){
  dragSquare.release();
}
