final int CELL_SIZE = 64;
final float PIECE_SIZE = 0.8f;
PVector boardOffset = new PVector();

BoardState boardState = new BoardState();

void setup() {
  size(1280, 720);
  boardOffset.set((width - CELL_SIZE * BOARD_SIZE) / 2, (height - CELL_SIZE * BOARD_SIZE) / 2);
  frameRate(30);
}

void draw() {
  background(200);
  renderBoardState(boardState);
}

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
  rect(-8 * CELL_SIZE, 0, 8 * CELL_SIZE, 8 * CELL_SIZE);
  popMatrix();
}
