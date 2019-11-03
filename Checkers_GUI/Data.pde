final int BOARD_SIZE = 10;

class BoardState{
  BoardCell[][] board = new BoardCell[BOARD_SIZE][BOARD_SIZE];
  
  BoardState(){
    for(int x = 0; x < BOARD_SIZE; x++){
      for(int y = 0; y < BOARD_SIZE; y++){
        board[x][y] = new BoardCell(x, y, getCellColor(x, y));
      }
    }
  }
}

BoardColor getCellColor(int x, int y){
  if(y % 2 == 0){
    return x % 2 == 0 ? BoardColor.White : BoardColor.Black;
  }else{
    return x % 2 != 0 ? BoardColor.White : BoardColor.Black;
  }
}

class BoardCell{
  BoardColor col = BoardColor.Black;
  Piece piece = null;
  Int2D pos = new Int2D();
  
  BoardCell(int x, int y, BoardColor col){
    this.col = col;
    pos.set(x, y);
    if(col == BoardColor.Black){
      if(y <= 3){
        piece = new Piece(BoardColor.Black);
      }else if(y >= BOARD_SIZE - 4){
        piece = new Piece(BoardColor.White);
      }
    }
  }
}

class Piece{
  BoardColor col = BoardColor.Black;
  boolean isKing = false;
  
  Piece(BoardColor col){
    this.col = col;
    isKing = random(1) < .5f;
  }
}

enum BoardColor{
  Black, White
}

class Int2D{
  int x, y;
  
  Int2D(){
    set(0, 0);
  }
  
  Int2D(int x, int y){
    set(x, y);
  }
  
  void set(int x, int y ){
    this.x = x;
    this.y = y;
  }
  
}
