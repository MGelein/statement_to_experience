ManagedList<Highlight> highlights = new ManagedList<Highlight>();

/**
This holds single instance of the class that will draw the highlght effect on the
board for the moves that have been played
**/
class Highlight{
  float animAngle = 0;
  int x, y;
  
  /**
  Creates a new hihglight at the provided board position
  **/
  Highlight(int x, int y){
    this.x = x;
    this.y = y;
  }
  
  /**
  Called to render
  **/
  void render(){
    pushMatrix();
    translate(boardOffset.x + x * CELL_SIZE, boardOffset.y + y * CELL_SIZE);
    animAngle += 0.3f;
    if(animAngle >= PI) {
      die();
    }else{
      stroke(255, 0, 0);
      strokeWeight(sin(animAngle) * 4 + 3);
      noFill();
      rect(0, 0, CELL_SIZE, CELL_SIZE);
    }
    popMatrix();
  }
  
  /**
  Removes this highlight when it is ready to be removed
  **/
  void die(){
    highlights.rem(this);
  }
  
}

/**
Renders all the highlights and and updates the managed list
**/
void renderHighlights(){
  //Update the list
  highlights.update();
  //Only render the first one in the list
  if(highlights.list.size() > 0) highlights.list.get(0).render();
}

/**
Queues a highlight animation for the provided tile
**/
void addHighlight(int x, int y){
  highlights.add(new Highlight(x, y));
}
