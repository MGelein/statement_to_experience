//The size of every cell on the board.
final int CELL_SIZE = 64;
//The size that a piece should be as a factor of cell size
final float PIECE_SIZE = 0.8f;
//The offset that is cached on how much the top left of the board needs to be translated
PVector boardOffset = new PVector();
//The boardState we're currently display
BoardState displayedBoardState = new BoardState();

/**
Renders the current state of the board. Does a lot of vector drawing
**/
void renderBoardState(BoardState b) {
  pushMatrix();
  translate(boardOffset.x, boardOffset.y);
  noStroke();
  strokeWeight(CELL_SIZE / 20);
  for (BoardCell[] row : b.board) {
    pushMatrix();
    for (BoardCell cell : row) {
      //Draw background
      noStroke();
      fill(cell.col == BoardColor.White ? 255 : 0);
      rect(0, 0, CELL_SIZE, CELL_SIZE);
      //Draw piece if there is a piece
      if (cell.piece != null) {
        stroke(80);
        fill(cell.piece.col == BoardColor.Black ? 40 : 240);
        ellipse(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * PIECE_SIZE, CELL_SIZE * PIECE_SIZE);
        if(cell.piece.isKing){
          ellipse(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * PIECE_SIZE * 0.6f, CELL_SIZE * PIECE_SIZE * 0.6f);
        }
      }
      translate(0, CELL_SIZE);
    }
    popMatrix();
    translate(CELL_SIZE, 0);
  }
  noFill();
  stroke(80);
  rect(-BOARD_SIZE * CELL_SIZE, 0, BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
  popMatrix();
}
