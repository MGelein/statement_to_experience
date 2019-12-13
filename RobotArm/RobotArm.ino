/**
   The code for the Robot Arm, this controls the servos and electro magnet
   Messages are received over the Serial port.

   We follow the following format:
   P(SHOULDER ELBOW)//set the position of each of the joints
   L(LINACT)//set the linear actuator to a certain position
   M(MAGNET)//set the magnet on or off
   T(SHOULDER ELBOW LINACT) //set trim
   A(VALUE) //set acceleration
*/
#include <Servo.h>

void(* resetFunc) (void) = 0;

bool easing = false;

const int COMMAND_TIMEOUT = 100;
const int MAX_SHOULDER = 2300;
const int MIN_SHOULDER = 600;
const int MAX_ELBOW = 2200;
const int MIN_ELBOW = 900;
const int MAX_LINACT = 2400;
const int MIN_LINACT = 800;
const float EASE_FACTOR = .02f;
const int HOME_SHOULDER_ADDR = 0;
const int HOME_ELBOW_ADDR = 16;
const int HOME_LINACT_ADDR = 32;

//The pins for each of the externals
const int MAGNET_PIN = 12;
const int SHOULDER_PIN = 3;
const int ELBOW_PIN = 6;
const int LINACT_PIN = 9;
const int LDR_PIN = A0;

//The variables used for the acceleration
int baseAcc = 2;
const int ELBOW_MULT = 1;
const int LINACT_MULT = 4;
int elbowAcc = baseAcc * ELBOW_MULT;
int linactAcc = baseAcc * LINACT_MULT;

//Used for ldr timing
int ldrThreshold = 10;
int lowTime = 0;
bool sendReset = false;
const int RESET_TIMEOUT = 3000;

//The trim values for each of the servos, this is in microseconds
int trimShoulder = 0;
int trimElbow = 0;
int trimLinAct = 0;

//The target values for each of the positions
int targetShoulder = 1500;
int targetElbow = 1500;
int targetLinAct = 1500;
//Halfwaypoint is the midpoint between starting and ending position, this is where easing strategies change
int halfwayShoulder = 1500;
int halfwayElbow = 1500;
int halfwayLinAct = 1500;
//Change is the total change in this move, this is calculated when the move is parsed
int changeShoulder = 0;
int changeElbow = 0;
int changeLinAct = 0;
//Diff is the current amount of difference between position and target
int diffShoulder = 0;
int diffElbow = 0;
int diffLinAct = 0;
//Flag to see if we're done moving yet
bool moveDone = false;

//The positions of each of the servos and magnet
int msShoulder = 1500;
int msElbow = 1500;
int msLinAct = 1500;
int magnetState = LOW;

//The servos used in this robot
Servo shoulder;
Servo elbow;
Servo linAct;

//Variables used in the parsing of the commands
const byte CMD_NONE = 0;
const byte CMD_MAGNET = 1;
const byte CMD_ACC = 2;
const byte CMD_TRIM = 3;
const byte CMD_POS = 4;
const byte CMD_LIN = 5;
byte commandMode = CMD_NONE;
byte numsRead = 0;
bool firstMove = false;
bool randomLedStatus = false;

const int FPS_INTERVAL = 1000;
int accumulator = 0;
unsigned long lastFrame = 0;
unsigned long now = 0;
unsigned long frameCount = 0;
unsigned long startTimeCommand = 0;

/**
   Runs once when the power is turned on
*/
void setup() {
  //Attach the servos to the correct pins, maybe detach as soon as there is nothing to do anymore
  shoulder.attach(SHOULDER_PIN);
  elbow.attach(ELBOW_PIN);
  linAct.attach(LINACT_PIN);
  msShoulder = 807;
  msElbow = 1424;
  msLinAct = 800;

  //Setup the first move
  targetShoulder = msShoulder;
  halfwayShoulder = (msShoulder + targetShoulder) / 2;
  targetElbow = msElbow;
  halfwayElbow = (msElbow + targetElbow) / 2;
  targetLinAct = msLinAct;
  halfwayLinAct = (msLinAct + targetLinAct) / 2;
  firstMove = true;

  updateServos();

  //Set up serial connection
  Serial.begin(19200);
  Serial.println("--- ARDUINO STARTUP ---");
  //Set up the pins in the correct pin mode
  pinMode(MAGNET_PIN, OUTPUT);
  pinMode(LDR_PIN, INPUT);
}

/**
   Runs as often as possible
*/
void loop() {
  //Check if we're done moving
  if (targetShoulder == msShoulder && targetElbow == msElbow && targetLinAct == msLinAct) {
    endMove();
  } else {
    //We're not done moving, so set this flag
    moveDone = false;

    //Calculate the current difference
    diffShoulder = targetShoulder - msShoulder;
    diffElbow = targetElbow - msElbow;
    diffLinAct = targetLinAct - msLinAct;

    if (easing) {
      msShoulder += getEaseMovement(msShoulder, diffShoulder, halfwayShoulder, changeShoulder);
      msElbow += getEaseMovement(msElbow, diffElbow, halfwayElbow, changeElbow);
      msLinAct += getEaseMovement(msLinAct, diffLinAct, halfwayLinAct, changeLinAct);
    } else {
      //Now move towards the target for each of the servos
      msShoulder += getLinMovement(diffShoulder, baseAcc);
      msElbow += getLinMovement(diffElbow, elbowAcc);
      msLinAct += getLinMovement(diffLinAct, linactAcc);
    }
    updateServos();
  }

  //frameCount ++;
  now = millis();
  //accumulator += now - lastFrame;
  checkLDR(now - lastFrame);
  lastFrame = now;
  //if (accumulator > FPS_INTERVAL) logFPS();

  //Check if any bytes can be read from the serial monitor
  if (Serial.available() > 0) {
    parseSerial(Serial.readStringUntil('\n'));
  }

  //Add a tiny bit of delay to allow for serial to buffer and stuff
  delay(5);
}

void checkLDR(int deltaTime){
  int val = analogRead(LDR_PIN);
  if(val < ldrThreshold){
    lowTime += deltaTime;
  }else{
    lowTime = 0;
    sendReset = false;
  }

  if(lowTime > RESET_TIMEOUT && !sendReset){
    Serial.println("resign");
    sendReset = true;
  }
}

void updateServos() {
  constrain(msShoulder, MIN_SHOULDER, MAX_SHOULDER);
  constrain(msElbow, MIN_ELBOW, MAX_ELBOW);
  constrain(msLinAct, MIN_LINACT, MAX_LINACT);

  //Write the new position to the servos
  shoulder.writeMicroseconds(msShoulder + trimShoulder);
  elbow.writeMicroseconds(msElbow + trimElbow);
  linAct.writeMicroseconds(msLinAct + trimLinAct);
}

int getEaseMovement(int ms, int diff, int halfwaypoint, int change) {
  int spd = (int) (diff * EASE_FACTOR);
  return spd == 0 ? (diff > 0 ? 1 : -1) : spd;
}

int getLinMovement(int diff, int acc) {
  if (diff > acc) return acc;
  else if (diff < -acc) return -acc;
  else return diff;
}

/**
   This is called if we are at the target position. The first time this function is called
   we print confirmation
*/
void endMove() {
  if (!moveDone) {
    moveDone = true;
    sayOk();
  }
}

/**
   Once every interval this posts the FPS and current angle data to the serial port
*/
void logFPS() {
  accumulator -= FPS_INTERVAL;
//  Serial.print("fps ");
//  Serial.print(String(frameCount / (FPS_INTERVAL / 1000)));
//  Serial.print("\t");
//  Serial.println(analogRead(LDR_PIN));
  frameCount = 0;
}

/**
   Parse the serial input, try to find the command format
*/
void parseSerial(String line) {
  if (line.length() < 4) return;
  line.toUpperCase();
  char c = line.charAt(0);
  int braceStart = line.indexOf('(');
  int braceEnd = line.indexOf(')');
  String content = line.substring(braceStart + 1, braceEnd);
//  Serial.print(c);
//  Serial.print("\t");
//  Serial.println(content);

  if (c == 'M' || c == 'm') {
    commandMode = CMD_MAGNET;
  } else if (c == 'T' || c == 't') {
    commandMode = CMD_TRIM;
  } else if (c == 'A' || c == 'a') {
    commandMode = CMD_ACC;
  } else if (c == 'P' || c == 'p') {
    commandMode = CMD_POS;
  } else if (c == 'L' || c == 'l') {
    commandMode = CMD_LIN;
  } else if (c == 'R' || c == 'r') {
    resetFunc();
  }

  int num, num2, num3;
  //Now that we have set commandmode, let's parse the rest of the command
  if (commandMode == CMD_POS) {
    int splitIndex = content.indexOf('_');
    num = content.substring(0, splitIndex).toInt();
    num2 = content.substring(splitIndex + 1).toInt();
    targetShoulder = num;
    changeShoulder = (targetShoulder - msShoulder) / 2;
    targetShoulder = constrain(targetShoulder, MIN_SHOULDER, MAX_SHOULDER);
    halfwayShoulder = (msShoulder + targetShoulder) / 2;
    targetElbow = num2;
    changeElbow = (targetElbow - msElbow) / 2;
    targetElbow = constrain(targetElbow, MIN_ELBOW, MAX_ELBOW);
    halfwayElbow = (msElbow + targetElbow) / 2;
    moveDone = false;
  } else if (commandMode == CMD_LIN) {
    num = content.toInt();
    targetLinAct = num;
    changeLinAct = (targetLinAct - msLinAct) / 2;
    targetLinAct = constrain(targetLinAct, MIN_LINACT, MAX_LINACT);
    halfwayLinAct = (msLinAct + targetLinAct) / 2;
    moveDone = false;
  } else if (commandMode == CMD_MAGNET) {
    num = content.toInt();
    //Write the magnet to the correct state immediately
    digitalWrite(MAGNET_PIN, num > 0 ? HIGH : LOW);
    magnetState = num;
  } else if (commandMode == CMD_TRIM) {
    int iUnderscore1 = content.indexOf('_');
    int iUnderscore2 = content.lastIndexOf('_');    
    num = content.substring(0, iUnderscore1).toInt();
    num2 = content.substring(iUnderscore1 + 1, iUnderscore2).toInt();
    num3 = content.substring(iUnderscore2 + 1).toInt();
    trimShoulder = num;
    trimElbow = num2;
    trimLinAct = num3;
  } else if (commandMode == CMD_ACC) {
    num = content.toInt();
    baseAcc = num;
    elbowAcc = baseAcc * ELBOW_MULT;
    linactAcc = baseAcc * LINACT_MULT;
  }
  endCommandMode();
}

void endCommandMode() {
  logReceivedCommand();
  commandMode = CMD_NONE;
}

/**
   This shows the received command in the Serial
*/
void logReceivedCommand() {
  if (commandMode == CMD_POS) {
    Serial.print("position s(");
    Serial.print(String(targetShoulder));
    Serial.print(") e(");
    Serial.print(String(targetElbow));
    Serial.println(")");
  } else if (commandMode == CMD_LIN) {
    Serial.print("linact l(");
    Serial.print(String(targetLinAct));
    Serial.println(")");
  } else if (commandMode == CMD_MAGNET) {
    Serial.print("magnet m(");
    Serial.println(magnetState > 0 ? "HIGH)" : "LOW)");
    sayOk();
  } else if (commandMode == CMD_ACC) {
    Serial.print("acceleration ");
    Serial.println(String(baseAcc));
    sayOk();
  } else if (commandMode == CMD_TRIM) {
    Serial.print("trim s(");
    Serial.print(String(trimShoulder));
    Serial.print(") e(");
    Serial.print(String(trimElbow));
    Serial.print(") l(");
    Serial.print(String(trimLinAct));
    Serial.println(")");
    sayOk();
  }
}

void sayOk() {
  Serial.println("OK");
}
