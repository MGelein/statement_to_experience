//The size of every cell on the board.
final int CELL_SIZE = 64;
//The size that a piece should be as a factor of cell size
final float PIECE_SIZE = 0.8f;
float edgeSize = -1;
//The offset that is cached on how much the top left of the board needs to be translated
PVector boardOffset = new PVector();
//Sets the color of the edge
color edgeColor = color(157, 112, 53);
color edgeHighlight = color(181, 140, 86);
color edgeLowlight = color(100, 63, 25);
//The boardState we're currently display
BoardState displayedBoardState = new BoardState();


/**
Renders the current state of the board. Does a lot of vector drawing
**/
void renderBoardState(BoardState b) {
  //See if we need to  recalculate the edgesize
  if(edgeSize < 0) edgeSize = boardOffset.y * .5f;
  pushMatrix();
  //Now translate to the top left of the board
  translate(boardOffset.x, boardOffset.y);
  drawBoard();
  noStroke();
  strokeWeight(CELL_SIZE / 15);
  for (BoardCell[] row : b.board) {
    pushMatrix();
    for (BoardCell cell : row) {
      //Draw background
      noStroke();
      fill(cell.col == BoardColor.White ? 255 : 0);
      rect(0, 0, CELL_SIZE, CELL_SIZE);
      //Draw piece if there is a piece
      if (cell.piece != null) {
        //First draw the fill
        noStroke();
        int baseColor = cell.piece.col == BoardColor.Black ? 40 : 240;
        fill(baseColor);
        ellipse(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * PIECE_SIZE, CELL_SIZE * PIECE_SIZE);
        if(cell.piece.isKing){
          stroke(80);
          ellipse(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * PIECE_SIZE * 0.6f, CELL_SIZE * PIECE_SIZE * 0.6f);
        }
        
        //Then draw the edge
        stroke(max(baseColor - 30, 0));
        ellipse(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * PIECE_SIZE * 0.925f, CELL_SIZE * PIECE_SIZE *  0.925f);
        stroke(min(baseColor + 15, 255));
        arc(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * 0.925f * PIECE_SIZE, CELL_SIZE * PIECE_SIZE * 0.925f, PI - QUARTER_PI * 0.5f, PI + HALF_PI + QUARTER_PI * .5f);
      }
      translate(0, CELL_SIZE);
    }
    popMatrix();
    translate(CELL_SIZE, 0);
  }
  noFill();
  popMatrix();
}

/**
Draws the board background, basically just the 'wooden' edge and its highlights
**/
void drawBoard(){
  //Draw the first background layer
  noStroke();
  fill(edgeColor);
  float boardEdgeSize = CELL_SIZE * BOARD_SIZE + edgeSize;
  square(-edgeSize, -edgeSize, boardEdgeSize + edgeSize  );
  //Draw the two edge shadows and highlights
  stroke(edgeLowlight);
  line(boardEdgeSize, -edgeSize, boardEdgeSize, boardEdgeSize);
  line(-edgeSize, boardEdgeSize, boardEdgeSize, boardEdgeSize);
  stroke(edgeHighlight);
  line(-edgeSize, -edgeSize, boardEdgeSize, -edgeSize);
  line(-edgeSize, -edgeSize, -edgeSize, boardEdgeSize);
  //Now draw the inner ones
  boardEdgeSize -= (edgeSize - 1);
  stroke(edgeLowlight);
  line(-1, -1, -1, boardEdgeSize);
  line(-1, -1, boardEdgeSize, 1);
  stroke(edgeHighlight);
  line(-1, boardEdgeSize, boardEdgeSize, boardEdgeSize);
  line(boardEdgeSize, -1, boardEdgeSize, boardEdgeSize);
}
