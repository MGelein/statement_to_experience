//If we have updated the networkBoardState since last time
boolean hasNetworkUpdate = false;
//The state of the board according to the network
BoardState networkBoardState;
//The last timestamp of the last frame in millis()
int lastMillis = 0;
//The amount of millis since last network update
int lastUpdate = 0;

/**
This is run every frame to check if we need to send another request to the
network to find out what the current state of the board is
**/
void checkNetwork(){
  int currentTime = millis();
  //If we did not experience a integer overflow
  if(currentTime > lastMillis){
    lastUpdate += (currentTime - lastMillis);
    if(lastUpdate > 1000){
      lastUpdate -= 1000;
      thread("updateBoardState");
    }
    lastMillis = currentTime;
  }else{
    //Reset the time after overflow, start counting anew
    lastMillis = currentTime;
  }
  
  //Only update the displayedBoardState if we have a new update from the network
  if(hasNetworkUpdate){
    hasNetworkUpdate = false;
    displayedBoardState = networkBoardState;
  }
}

/**
Tries to get a board state from the localhost server
**/
void updateBoardState(){
  String[] response = loadStrings("http://localhost:3000/board/csv");
  //If the endpoint is not online right now, ignore and return
  if(response == null) return;
  //Parse into a board state
  networkBoardState = createBoardState(response);
  //We need to update after receiving this data
  hasNetworkUpdate = true;
}

BoardState createBoardState(String[] lines){
  BoardState b = new BoardState();
  int x = 0;
  int y = 0;
  for(String line : lines){
    //Skip any lines that are not as long as the board size
    if(line.length() < BOARD_SIZE) continue;
    x = 0;
    for(int i = 0; i < line.length(); i++){
      char cell = line.charAt(i);
      //Depending on the type of cell, do a thing
      if(cell == ' '){
        //Do nothing, skip this one
      }else if(cell == 'w' || cell == 'W'){
        b.board[x][y].piece = new Piece(BoardColor.White, cell == 'W');
      }else if(cell == 'b' || cell == 'B'){
        b.board[x][y].piece = new Piece(BoardColor.Black, cell == 'B');
      }
      x++;
    }
    y++;
  }
  return b;
}
