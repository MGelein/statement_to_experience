//How many cells should be along the side of the board, use 10 for classic and 8 for american and english checkers
final int BOARD_SIZE = 10;
//The image that we'll display in the background, loaded from the data folder
PImage bgImage;

/**
Runs once and handles setup
**/
void setup() {
  //The frame will be 1280x720, we can alternatively render fullscreen
  size(1280, 720, P2D);
  //The boardoffset is calculated on the fly based on the cell size and board size
  boardOffset.set((width - CELL_SIZE * BOARD_SIZE) / 2, (height - CELL_SIZE * BOARD_SIZE) / 2);
  //Load the bg jpg
  bgImage = loadImage("bg.jpg");
  //Prepare the buttons for the UI that we will need
  prepareButtons();
  //Set the framerate lower, why waste power?
  frameRate(30);
}

/**
Runs at the framerate
**/
void draw() {
  //First clear the background
  background(0);
  //Set the background to the background image
  image(bgImage, 0, 0, width, height);
  //Now render the boardstate on top of the background
  renderBoardState(displayedBoardState);
  //Render all the buttons
  for(Button b: buttons) b.render();
  //Check if we need to do any network updates
  checkNetwork();
}

/**
Sends a signal to all important components that the mouse is pressed
**/
void mousePressed(){
  for(Button b: buttons){
    if(b.hover) b.press();
  }
}

/**
Sends a signal to all important components that the mouse is released
**/
void mouseReleased(){
  for(Button b: buttons){
    if(b.hover) b.release();
  }
}
