final int DRAG_POINT_SIZE = 20;
class DragPoint {
  PVector pos;
  boolean dragging = false;
  boolean hover = false;

  DragPoint(int x, int y) {
    pos = new PVector(x, y);
  }

  void render() {
    if (dragging) pos.set(mouseX, mouseY);
    hover = dist(pos.x, pos.y, mouseX, mouseY) < DRAG_POINT_SIZE / 2;
    strokeWeight(dragging ? 3 : hover ? 2 : 1);
    fill(dragging ? 255 : hover ? 200 : 150);
    stroke(0);
    float diam = DRAG_POINT_SIZE * (dragging ? 1 : 1.1);
    ellipse(pos.x, pos.y, diam, diam);
  }

  void startDrag() {
    dragging = true;
  }

  void stopDrag() {
    dragging = false;
  }
}

class DragSquare {
  DragPoint[] points = new DragPoint[4];

  DragSquare() {
    points[0] = new DragPoint(minimapSize + 20, 20);
    points[1] = new DragPoint(width - 20, 20);
    points[2] = new DragPoint(width - 20, height - 20);
    points[3] = new DragPoint(minimapSize + 20, height - 20);
  }

  void render() {
    stroke(255);
    strokeWeight(2);
    noFill();
    //Draw the 4 lines
    lineBetween(points[0], points[1]);
    lineBetween(points[1], points[2]);
    lineBetween(points[2], points[3]);
    lineBetween(points[3], points[0]);
    float xRat = pow(getXRatio(), perspectiveFactor);
    float yRat = pow(getYRatio(), perspectiveFactor);
    for(float fraction = 0.125f; fraction < 1; fraction+= 0.125){
      float fracY = pow(fraction, xRat);
      float fracX = pow(fraction, yRat);
      //Vertical lines
      PVector ptA = pointBetween(points[0].pos, points[1].pos, fracX);
      PVector ptB = pointBetween(points[3].pos, points[2].pos, fracX);
      //Horiztonal lines
      PVector ptC = pointBetween(points[1].pos, points[2].pos, fracY);
      PVector ptD = pointBetween(points[0].pos, points[3].pos, fracY);
      line(ptA.x, ptA.y, ptB.x, ptB.y);
      line(ptC.x, ptC.y, ptD.x, ptD.y);
    }
    //Draw the 4 points
    for (DragPoint p : points) {
      p.render();
    }
  }
  
  float getXRatio(){
    float distTop = dist(points[0].pos.x, points[0].pos.y, points[1].pos.x, points[1].pos.y);
    float distBottom = dist(points[3].pos.x, points[3].pos.y, points[2].pos.x, points[2].pos.y);
    return distBottom / distTop;
  }
  
  float getYRatio(){
    float distLeft = dist(points[0].pos.x, points[0].pos.y, points[3].pos.x, points[3].pos.y);
    float distRight = dist(points[1].pos.x, points[1].pos.y, points[2].pos.x, points[2].pos.y);
    return distRight / distLeft;
  }
  
  PVector pointBetween(PVector a, PVector b, float fraction){
    float x = map(fraction, 0, 1, a.x, b.x);
    float y = map(fraction, 0, 1, a.y, b.y);
    return new PVector(x, y);
  }
  
  color colorAtScaledPoint(float fracX, float fracY){
    PVector left = pointBetween(points[0].pos, points[3].pos, fracY);
    PVector right = pointBetween(points[1].pos, points[2].pos, fracY);
    PVector pos = pointBetween(left, right, fracX);
    return pixels[(int) (pos.x + (int) pos.y * width)];
  }
  
  void lineBetween(DragPoint a, DragPoint b){
    line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
  }

  void press() {
    for (DragPoint p : points) {
      if (p.hover) p.startDrag();
    }
  }

  void release() {
    for (DragPoint p : points) {
      p.stopDrag();
    }
  }
}
