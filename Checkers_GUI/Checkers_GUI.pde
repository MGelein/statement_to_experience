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
  //Set the framerate lower, why waste power?
  frameRate(30);
}

/**
Runs at the framerate
**/
void draw() {
  //Set the background to the background image
  image(bgImage, 0, 0, width, height);
  //Now render the boardstate on top of the background
  renderBoardState(displayedBoardState);
  //Check if we need to do any network updates
  checkNetwork();
}
