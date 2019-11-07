//List of all the buttons in the UI
ArrayList<Button> buttons = new ArrayList<Button>();

/**
Simple text button that gives some simple interactivity
**/
class Button{
  //The text we have on the button
  String text = "";
  //The position of the top left of the button
  PVector pos;
  //The dimension of the button
  PVector dim;
  //The offset of the top left of the button
  PVector textOff = new PVector();
  //The size of the font on the button
  int fontSize = 32;
  //The two colors to draw the button in
  color backgroundColor = color(0, 180);
  color highlightColor = color(120, 180); 
  color foregroundColor = color(255);
  //If we have the mouse pressed down on it
  boolean pressed = false;
  //If we're hovering over it
  boolean hover = false;
  //The handler that we can override to give custom functionality to this button
  MouseHandler handler;
  
  Button(){  
    pos = new PVector();
    dim = new PVector();
  }
  
  Button(float x, float y, String s, MouseHandler mHandler){
    pos = new PVector(x, y);
    dim = new PVector();
    handler = mHandler;
    handler.parent = this;
    setText(s);
  }
  
  void setText(String s){
    text = s;
    recalcDim();
  }
  
  void recalcDim(){
    textSize(fontSize);
    float tw = textWidth(text);
    textOff.set(fontSize / 2, fontSize * 1.3f);
    dim.x = tw + fontSize;
    dim.y = fontSize * 2;
  }
  
  /**
  Called when this button nis pressed
  **/
  void press(){
    if(handler != null) handler.press();
    pressed = true;
  }
  
  /**
  Called when this button is released
  **/
  void release(){
    pressed = false;
  }
  
  /**
  Renders this button and checks if we're hovering
  **/
  void render(){
    //See if we're over the bounding box of the button
    hover = mouseX > pos.x && mouseX < pos.x + dim.x && mouseY > pos.y && mouseY < pos.y + dim.y;
    //We can't not hover and press at the same time
    if(!hover) pressed = false;
    pushMatrix();
    translate(pos.x, pos.y);
    //Render the background
    stroke(pressed ? backgroundColor : foregroundColor);
    strokeWeight(1);
    fill(pressed ? foregroundColor : hover ? backgroundColor: highlightColor);
    rect(0, 0, dim.x, dim.y);
    //Prepare the text for rendering
    fill(pressed ? backgroundColor: foregroundColor, hover ? 200: 255);
    textFont(mainFont);
    textSize(fontSize);
    text(text, textOff.x, textOff.y);
    popMatrix();
  }
}

/**
Used to implement special behaviour on press and release
**/
abstract class MouseHandler{
  Button parent;
  abstract void press();
}

/**
Add the buttons to the list of buttosn that need to be rendered and checked
**/
void prepareButtons(){  
  final Button simulateButton = new Button(30, boardOffset.y, "Simulate", new MouseHandler(){
    public void press(){
      runningSim = true;
      thread("startSim");
    }
  });
  buttons.add(simulateButton);
  final Button resetButton = new Button(30, boardOffset.y + 80, "Resign", new MouseHandler(){
    public void press(){
      thread("restartSim");
    }
  });
  buttons.add(resetButton);
}
