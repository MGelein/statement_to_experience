//If we have updated the networkBoardState since last time
boolean hasNetworkUpdate = false;
//The state of the board according to the network
BoardState networkBoardState;
//The last timestamp of the last frame in millis()
int lastMillis = 0;
//The amount of millis since last network update
int lastUpdate = 0;
//Amount of time in ms between each update request to the server
final int UPDATE_MS = 100;
//If we're currently running the sim
boolean runningSim = false;
//the server ip adress
final String SERVER_IP = "http://localhost:3000";
//The location we need to send the move from
int fromX, fromY;
int toX, toY;
//The log of responses from the server
ArrayList<String> logLines = new ArrayList<String>();
//List of log lines to be added
ArrayList<String> newLog = new ArrayList<String>();
//Amount of logs in the side window
final int LOG_SIZE = 15;
//The amount of moves there were in the last update of the moves list
int lastMoveAmt = 0;
//If this is the first check we do, we don't need to do any ugly highlights
boolean firstCheck = true;

void addLog(String desc, String[] response) {
  StringBuilder b = new StringBuilder();
  for (String line : response) {
    b.append(line);
  }
  newLog.add(desc + ": " + b.toString());
}

/**
 Sends a signal to the server that the player move has ended
 **/
void endTurn() {
  String[] response = loadStrings(SERVER_IP + "/board/move/end/");
  addLog("END GAME", response);
}

/**
 Prepares this move for sending to the server, starts a thread for this move request,
 returns if this move was event sent to the server
 **/
boolean sendMove(PVector from, PVector to) {
  fromX = (int) (from.x / CELL_SIZE);
  fromY = (int) (from.y / CELL_SIZE);
  if (fromX < 0 || fromX >= BOARD_SIZE || fromY < 0 || fromY >= BOARD_SIZE) return false;
  BoardCell source = displayedBoardState.board[fromX][fromY];
  if (source.col == BoardColor.White) return false;
  if (source.piece == null) return false;
  toX = (int) (to.x / CELL_SIZE);
  toY = (int) (to.y / CELL_SIZE);
  if (toX < 0 || toX >= BOARD_SIZE || toY < 0 || toY >= BOARD_SIZE) return false;
  BoardCell target = displayedBoardState.board[toX][toY];
  if (target.col == BoardColor.White) return false;
  if (target.piece != null) return false;
  //Start the thread and communicate we are sending this to server
  thread("communicateMove");
  return true;
}

/**
 Sends the move to the server
 **/
void communicateMove() {
  String[] responses = loadStrings(SERVER_IP + "/board/move/" + fromY + "." + fromX + "/" + toY + "." + toX);
  addLog("MOVE", responses);
}

/**
 This is run every frame to check if we need to send another request to the
 network to find out what the current state of the board is
 **/
void checkNetwork() {
  int currentTime = millis();
  //If we did not experience a integer overflow
  if (currentTime > lastMillis) {
    lastUpdate += (currentTime - lastMillis);
    if (lastUpdate > UPDATE_MS) {
      lastUpdate -= UPDATE_MS;
      thread("updateBoardState");
      thread("updateMoveList");
    }
    lastMillis = currentTime;
  } else {
    //Reset the time after overflow, start counting anew
    lastMillis = currentTime;
  }

  //Only update the displayedBoardState if we have a new update from the network
  if (hasNetworkUpdate) {
    hasNetworkUpdate = false;
    displayedBoardState = networkBoardState;
  }
}

/**
 Ready to update the list of moves
 **/
void updateMoveList() {
  String[] response = loadStrings(SERVER_IP + "/board/moves/csv/");
  if (response.length != lastMoveAmt) {
    if (!firstCheck) {
      for (int i = lastMoveAmt; i < response.length; i++) {
        String line = response[i].toLowerCase();
        //Ignore whites moves, we don't need to highlight those
        if (line.charAt(0) == 'w') continue;
        //Only add highligt for blackmoves
        parseHighlightMove(line);
      }
    } else {
      firstCheck = false;
    }
    lastMoveAmt = response.length;
  }
}

/**
 Parses a single move and turns it into a highlight
 **/
void parseHighlightMove(String l) {
  l = l.replaceAll("[ b:w\\(\\)]", "");
  String[] parts = l.split("to");
  for (String p : parts) {
    parseHighlightCoord(p.split(","));
  }
}

/**
 Parses a single highlight coord and checks if it even needs to be added to the 
 list of highlight effects
 **/
void parseHighlightCoord(String[] parts) {
  if (parts.length < 2) return;
  int y = parseInt(parts[0]);
  int x = parseInt(parts[1]);
  //Only check for doubles if there is actually something to check
  if (highlights.list.size() > 0) {
    Highlight lastHighlight = highlights.list.get(highlights.list.size() - 1);
    //Do nothing if this is also the last added highligt, prevents the structure of "From A to B and then from B to C"
    if (lastHighlight.x == x && lastHighlight.y == y) return;
  }
  addHighlight(x, y);
}

/**
 Tries to get a board state from the localhost server
 **/
void updateBoardState() {
  String[] response = loadStrings(SERVER_IP + "/board/csv");
  //If the endpoint is not online right now, ignore and return
  if (response == null) return;
  //Parse into a board state
  networkBoardState = createBoardState(response);
  //We need to update after receiving this data
  hasNetworkUpdate = true;
}

BoardState createBoardState(String[] lines) {
  BoardState b = new BoardState();
  int x = 0;
  int y = 0;
  for (String line : lines) {
    //First check if this line starts with 'turn'
    if (line.toLowerCase().startsWith("turn")) {
      currentPlayer = null;
      if (line.toLowerCase().indexOf('b') > -1) currentPlayer = BoardColor.Black;
      else if (line.toLowerCase().indexOf('w') > -1) currentPlayer = BoardColor.White;
      continue;
    } else if (line.toLowerCase().startsWith("overlay")) {
      setOverlay(line);
      continue;
    }
    //Skip any lines that are not as long as the board size
    if (line.length() != BOARD_SIZE) continue;
    x = 0;
    for (int i = 0; i < line.length(); i++) {
      char cell = line.charAt(i);
      //Depending on the type of cell, do a thing
      if (cell == ' ') {
        //Do nothing, skip this one
      } else if (cell == 'w' || cell == 'W') {
        b.board[x][y].piece = new Piece(BoardColor.White, cell == 'W');
      } else if (cell == 'b' || cell == 'B') {
        b.board[x][y].piece = new Piece(BoardColor.Black, cell == 'B');
      }
      if (x >= BOARD_SIZE) continue;
      x++;
    }
    if (y >= BOARD_SIZE) continue;
    y++;
  }
  return b;
}

/**
 Starts the sim by sending a request to the server
 **/
void startSim() {
  String[] response = loadStrings(SERVER_IP + "/board/simulate");
  addLog("RUN SIMULATION", response);
}

/**
 Sends a request to restart the sim
 **/
void restartSim() {
  String[] response = loadStrings(SERVER_IP + "/board/restart");
  addLog("RESET BOARD", response);
}
