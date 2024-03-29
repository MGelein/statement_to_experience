//The size of every cell on the board.
final int CELL_SIZE = 80;
//The size that a piece should be as a factor of cell size
final float PIECE_SIZE = 0.8f;
float edgeSize = -1;
//The offset that is cached on how much the top left of the board needs to be translated
PVector boardOffset = new PVector();
//Sets the color of the edge
color edgeColor = color(20);
color edgeHighlight = color(100);
color edgeLowlight = color(0);
//The boardState we're currently display
BoardState displayedBoardState = new BoardState();
//The selection pos
PVector selPos = new PVector(-1000, -1000);
//The position we're moving from
PVector srcPos = new PVector(-1000, -1000);
//The position we're moving to
PVector targetPos = new PVector(-1000, -1000);
//The text that is draw over the game
String overlay = "";
//The scalefactor of the overlay
float overlayScaleFactor = 0;
//The thickness of the src selected line
float srcThickness = 2;
//The angle of the sinusoid animation
float srcAngle = 0;

/**
 Sets the text overlay, leave empty to reset overlay
 **/
void setOverlay(String line) {
  if (line.trim().length() < 2) overlay = "";
  switch(line.replaceAll("Overlay: ", "").toLowerCase().trim()) {
  case "draw":
    overlay = "It's a draw!";
    break;
  case "lost":
    overlay = "You lost!";
    break;
  case "won":
    overlay = "You won!";
    break;
  default:
    overlay = "";
    break;
  }
}

/**
 Checks if we even need to render the overlay, and if so, does so
 **/
void renderOverlay() {
  //Ignore empty overlay
  if (overlay.length() < 2) {
    overlayScaleFactor *= 0.5f;
    if (overlayScaleFactor < 0.01) return;
  } else {
    overlayScaleFactor += (1 - overlayScaleFactor) * 0.5f;
  }
  textFont(boldFont);
  textSize(64 * overlayScaleFactor);
  float tw = textWidth(overlay);
  //First render outer shadow
  strokeWeight(1);
  stroke(255, 120 * overlayScaleFactor);
  fill(0, 120 * overlayScaleFactor);
  rect(width / 2 - tw / 2 - 42 * overlayScaleFactor, height / 2 - 126, (tw + 84) * overlayScaleFactor, 148 * overlayScaleFactor);
  stroke(255 * overlayScaleFactor);
  strokeWeight(3);
  fill(0, 200 * overlayScaleFactor);
  rect(width / 2 - tw / 2 - 32, height / 2 - 116, (tw + 64) * overlayScaleFactor, 128 * overlayScaleFactor);
  fill(255, 255 * overlayScaleFactor);
  text(overlay, width / 2 - tw / 2, height / 2 - 32);
}

/**
 Renders the current state of the board. Does a lot of vector drawing
 **/
void renderBoardState(BoardState b) {
  //See if we need to  recalculate the edgesize
  if (edgeSize < 0) edgeSize = boardOffset.y * .5f;
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
      fill(cell.col == BoardColor.White ? 0 : 255);
      rect(0, 0, CELL_SIZE, CELL_SIZE);
      //Draw piece if there is a piece
      if (cell.piece != null) {
        //First draw the fill
        noStroke();
        int baseColor = cell.piece.col == BoardColor.Black ? 80 : 240;
        fill(baseColor);
        ellipse(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * PIECE_SIZE, CELL_SIZE * PIECE_SIZE);
        if (cell.piece.isKing) {
          stroke(160);
          ellipse(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE * PIECE_SIZE * 0.6f, CELL_SIZE * PIECE_SIZE * 0.6f);
        }

        //Then draw the edge
        noFill();
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
  //Change the srcThickness
  srcAngle += 0.25f;
  srcThickness = 5 + sin(srcAngle) * 3;

  //If we want to show the selected pos
  if (selPos.x >= 0) renderBoardSquareEdge(b, selPos, 2);
  if (srcPos.x >= 0) renderBoardSquareEdge(b, srcPos, srcThickness);
}

/**
 Renders an edge around a specific square
 **/
void renderBoardSquareEdge(BoardState b, PVector pos, float sw) {
  if(currentPlayer != BoardColor.White) return;
  int tX = (int) (pos.x / CELL_SIZE);
  int tY = (int) (pos.y / CELL_SIZE);
  if (tX < 0 || tX >= BOARD_SIZE || tY < 0 || tY >= BOARD_SIZE) return;
  BoardCell c = b.board[tX][tY];
  Piece p = c.piece;
  boolean isSrc = pos.equals(srcPos);
  //Ignore white squares
  if (c.col == BoardColor.White) return;
  if (isSrc) {
    if (p == null || p.col == BoardColor.Black) {
      srcPos.set(-1000, -1000);
      return;
    } else {
      stroke(0, 255, 0);
    }
  } else {
    if (srcPos.x < 0) {
      //No source has been set, so we are only allowed to select a white piece
      if(p == null || p.col == BoardColor.Black){
        return;
      }else{
        stroke(0, 255, 0);
      }
    } else {
      //If the source position has been set, we're looking for a destination
      if (p == null) {
        stroke(0, 255, 0);
      } else {
        stroke(255, 0, 0);
      }
    }
  }
  //Now we can do the actual drawing
  pushMatrix();
  translate(boardOffset.x, boardOffset.y);
  noFill();
  strokeWeight(sw);
  square(pos.x, pos.y, CELL_SIZE);
  popMatrix();
}

/**
 Returns the piece at a certain position on the board
 **/
Piece getPiece(BoardState b, int x, int y) {
  if (x >= BOARD_SIZE || x < 0 || y >= BOARD_SIZE || y < 0) return null;
  return b.board[x][y].piece;
}

/**
 Draws the board background, basically just the 'wooden' edge and its highlights
 **/
void drawBoard() {
  //Draw the first background layer
  noStroke();
  fill(edgeColor);
  strokeWeight(2);
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

/**
 Renders the turn indicator, showing who has to make a move now
 **/
void renderTurnIndicator() {
  String turnLabel = currentPlayer == BoardColor.White ? "Turn: White" : currentPlayer == null ? "Turn: --" : "Turn: Black";
  String label = currentPlayer == BoardColor.White ? "Waiting for you..." : currentPlayer == null ? "Waiting for restart..." : "Waiting for AI...";
  pushMatrix();
  translate(30, height - boardOffset.y - 30);
  fill(0);
  textFont(boldFont);
  textSize(24);  
  text(turnLabel, 0, 0);
  translate(2, 2);
  fill(255);
  text(turnLabel, 0, 0);
  translate(-2, 30);
  //Draw the text
  fill(0);
  textFont(mainFont);
  textSize(24);
  text(label, 0, 0);
  translate(2, 2);
  fill(255);
  text(label, 0, 0);
  popMatrix();
}

/**
 Draws the rect that holds all the UI components
 **/
void renderUIBG() {
  stroke(255);
  strokeWeight(1);
  fill(0, 100);
  rect(20, boardOffset.y - 20, boardOffset.x - 60, height - boardOffset.y);

  //Render all the buttons
  for (Button b : buttons) b.render();

  //Renders the indicator that shows who has to play now
  renderTurnIndicator();
}

/**
 Loads and desaturates the BG image
 **/
void prepareBG() {
  bgImage = loadImage("bg.jpg");
  bgImage.loadPixels();
  float desaturation = 0.2f;
  for (int i = 0; i < bgImage.pixels.length; i++) {
    bgImage.pixels[i] = lerpColor(bgImage.pixels[i], color(brightness(bgImage.pixels[i]) * 0.5f), desaturation);
  }
  bgImage.updatePixels();
}

/**
 Moves the log lines from the threaded arraylist to the rendering list
 **/
void updateLog() {
  for (String l : newLog) {
    logLines.add(0, l);
  }
  newLog.clear();
  while (logLines.size() > LOG_SIZE) {
    logLines.remove(LOG_SIZE - 1);
  }
}

/**
 Renders the log of response we got for the moves
 **/
void renderLog() {
  //First update the log
  updateLog();
  //Now render it 
  stroke(255);
  strokeWeight(1);
  fill(0, 100);
  pushMatrix();
  translate(width - boardOffset.x + 40, boardOffset.y - 20);
  rect(0, 0, boardOffset.x - 60, height - boardOffset.y);
  textFont(boldFont);
  textSize(24);
  fill(255);
  text("Server Response: ", 10, 30);
  translate(10, 50);
  textFont(mainFont);
  textSize(16);
  for (String logLine : logLines) {
    text(logLine, 0, 0, boardOffset.x - 60, 80);
    if (textWidth(logLine) > boardOffset.x - 60) {
      translate(0, 30);
    };
    translate(0, 20);
  }
  popMatrix();
}
