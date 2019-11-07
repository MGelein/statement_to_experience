  //How many cells should be along the side of the board, use 10 for classic and 8 for american and english checkers
final int BOARD_SIZE = 8;
//The image that we'll display in the background, loaded from the data folder
PImage bgImage;
//The spacenbar key
final int SPACE = 32;
//Sets the current player in the game
BoardColor currentPlayer = BoardColor.White;

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
  //Render the mouse overlay and handle clicks
  if(isOnBoard(mouseX, mouseY)){
    int x = mouseX - (int) boardOffset.x;
    int y = mouseY - (int) boardOffset.y;
    x /= CELL_SIZE;
    y /= CELL_SIZE;
    selPos.set(x * CELL_SIZE, y * CELL_SIZE);
  }else{
    //Hide the selected pos
    selPos.set(-1000, -1000);
  }
  
  //Check if we need to end the turn
  if(Key.isDownOnce(SPACE)) thread("endTurn");
  
  //Renders the indicator that shows who has to play now
  renderTurnIndicator();
  
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
  //Try and set the srcPos or send the target pos
  if(isOnBoard(mouseX, mouseY)){
    int x = mouseX - (int) boardOffset.x;
    int y = mouseY - (int) boardOffset.y;
    x /= CELL_SIZE;
    y /= CELL_SIZE;
    //If the src pos has not been set
    if(srcPos.x < 0) srcPos.set(x * CELL_SIZE, y * CELL_SIZE);
    else{
      targetPos.set(x * CELL_SIZE, y * CELL_SIZE);
      //Now that we have set the targetpos, send the coords to the server
      sendMove(srcPos, targetPos);
      //And reset the send positions
      srcPos.set(-1000, -1000);
      targetPos.set(-1000, -1000);
    }
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

/**
Registers a keypress with the lib
**/
void keyPressed(){
  Key.setState(keyCode, true);
}

/**
Registers a key release with the lib
**/
void keyReleased(){
  Key.setState(keyCode, false);
}

/**
Returns if the mouse is on the board
**/
boolean isOnBoard(int x, int y){
  if(x >= boardOffset.x && x <= boardOffset.x + CELL_SIZE * BOARD_SIZE){
    if(y >= boardOffset.y && y <= boardOffset.y + CELL_SIZE * BOARD_SIZE){
      return true;
    }
  }
  return false;
}
