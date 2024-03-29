Slider shoulderSlider;
Slider elbowSlider;
Slider linActSlider;
Slider focusSlider;

Slider shoulderTrimSlider;
Slider elbowTrimSlider;
Slider linActTrimSlider;

Toggle directToggle;
Toggle magnetToggle;

Button saveAsButton;
Button saveLinActButton;
Button savePosButton;
Button saveMagnetButton;
Button saveTrimButton;

Button addShoulderButton;
Button subShoulderButton;
Button addElbowButton;
Button subElbowButton;
Button addLinActButton;
Button subLinActButton;

Label servoLabel;
Label buttonLabel;
Label presetLabel;
Label saveLabel;

void setup() {
  size(1600, 900, P2D);
  frameRate(30);
  colorMode(HSB);
  rectMode(CENTER);
  loadUISettings();
  loadUIControls();
}

void draw() {
  background(0);

  if (directToggle.value) sendDirect();
  if (!commandListValid) requestCommandList();
  if (commandListUpdated) updateCommandUI();

  if (saveDialogOpened) {
    renderSaveOverlay();
  } else {
    shoulderSlider.render();
    elbowSlider.render();
    linActSlider.render();
    
    shoulderTrimSlider.render();
    elbowTrimSlider.render();
    linActTrimSlider.render();
    saveTrimButton.render();
    
    addShoulderButton.render();
    subShoulderButton.render();
    addElbowButton.render();
    subElbowButton.render();
    addLinActButton.render();
    subLinActButton.render();

    directToggle.render();
    magnetToggle.render();

    saveAsButton.render();

    servoLabel.render();
    buttonLabel.render();
    presetLabel.render();

    for (Button btn : cmdButtons) {
      btn.render();
    }
  }

  if (focusSlider != null) {
    if (Key.isDown(UP)) focusSlider.setValue(focusSlider.getValue() + 5);
    if (Key.isDown(DOWN)) focusSlider.setValue(focusSlider.getValue() - 5);
  }
}

void addShoulder(int amt){
  shoulderSlider.setValue(shoulderSlider.getValue() + amt);
}

void addElbow(int amt){
  elbowSlider.setValue(elbowSlider.getValue() + amt);
}

void addLinAct(int amt){
  linActSlider.setValue(linActSlider.getValue() + amt);
}

float toPrecision(float val, int precision) {
  float mult = pow(10, precision);
  return ((int)(mult * val)) / mult;
}

void keyPressed() {
  Key.setState(keyCode, true);
  if (saveDialogOpened) {
    if (allowedChars.indexOf(key) != -1) {
      saveCommandName += key;
      saveCommandName = saveCommandName.trim();
    } else if (keyCode == ENTER) {
      //close the save dialog and send the request
    } else if (keyCode == BACKSPACE) {
      if (saveCommandName.length() < 1) return;
      saveCommandName = saveCommandName.substring(0, saveCommandName.length() - 1);
    }
  } else {
    if (key == 'm') magnetToggle.toggleValue();
    else if (key == 'd') directToggle.toggleValue();
    else if (key == 's')focusSlider = focusSlider == null ? shoulderSlider : null;
    else if (key == 'e')focusSlider = focusSlider == null ? elbowSlider : null;
    else if (key == 'l')focusSlider = focusSlider == null ? linActSlider : null;
  }
}

void keyReleased() {
  Key.setState(keyCode, false);
}
