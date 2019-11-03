/**
 Represents a single board state
 **/
class BoardState {
  //2D array that holds all the boardcells, there is no length checking so be careful
  BoardCell[][] board = new BoardCell[BOARD_SIZE][BOARD_SIZE];

  /**
   Instantiates a new and empty board. Manipulate the board using the board
   array or the methods provided in this boardstate
   **/
  BoardState() {
    for (int x = 0; x < BOARD_SIZE; x++) {
      for (int y = 0; y < BOARD_SIZE; y++) {
        BoardColor cellColor;
        if (y % 2 == 0) {
          cellColor = x % 2 == 0 ? BoardColor.White : BoardColor.Black;
        } else {
          cellColor =  x % 2 != 0 ? BoardColor.White : BoardColor.Black;
        }
        board[x][y] = new BoardCell(cellColor);
      }
    }
  }
}

/**
A single cell on the board can hold a piece, has a color and a position
**/
class BoardCell {
  BoardColor col = BoardColor.Black;
  Piece piece = null;

  BoardCell(BoardColor col) {
    this.col = col;
  }
}

/**
Every piecce has a color and can be a king
**/
class Piece {
  BoardColor col = BoardColor.Black;
  boolean isKing = false;
  
  Piece(BoardColor col, boolean isKing) {
    this.col = col;
    this.isKing = isKing;
  }
}

//Two possible colors on the board
enum BoardColor {
  Black, White
}
