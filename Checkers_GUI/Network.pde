boolean hasNetworkUpdate = false;
BoardState lastBoardState;

/**
Tries to get a board state from the localhost server
**/
void updateBoardState(){
  String[] response = loadStrings("http://localhost:3000/board/csv");
  //If the endpoint is not online right now, ignore and return
  if(response == null) return;
  //Parse into a board state
  lastBoardState = createBoardState(response);
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
