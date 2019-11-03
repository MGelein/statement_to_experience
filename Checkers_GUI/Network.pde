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
    String[] cells = line.split("");
    for(String cell : cells){
      //b.board[x][y].piece = 
      x++;
    }
    y++;
  }
  return b;
}
