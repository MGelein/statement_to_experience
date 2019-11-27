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
#include <EEPROM.h>

bool easing = false;

const int MAX_SHOULDER = 2300;
const int MIN_SHOULDER = 600;
const int MAX_ELBOW = 2200;
const int MIN_ELBOW = 900;
const int MAX_LINACT = 1500;
const int MIN_LINACT = 800;
const int EASE_FACTOR = 10;//increase to ease slower, decrease to ease faster
const int HOME_SHOULDER_ADDR = 0;
const int HOME_ELBOW_ADDR = 16;
const int HOME_LINACT_ADDR = 32;

//The pins for each of the externals
const int MAGNET_PIN = 12;
const int SHOULDER_PIN = 3;
const int ELBOW_PIN = 6;
const int LINACT_PIN = 9;

//The variables used for the acceleration
int baseAcc = 2;
const int ELBOW_MULT = 2;
const int LINACT_MULT = 4;
int elbowAcc = baseAcc * ELBOW_MULT;
int linactAcc = baseAcc * LINACT_MULT;

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
const byte CMD_EASE = 6;
conts byte CMD_HOME = 7;
byte commandMode = CMD_NONE;
byte numsRead = 0;
bool firstMove = false;

const int FPS_INTERVAL = 1000;
int accumulator = 0;
unsigned long lastFrame = 0;
unsigned long now = 0;
unsigned long frameCount = 0;

/**
   Runs once when the power is turned on
*/
void setup() {
  //Attach the servos to the correct pins, maybe detach as soon as there is nothing to do anymore
  shoulder.attach(SHOULDER_PIN);
  elbow.attach(ELBOW_PIN);
  linAct.attach(LINACT_PIN);
  //Load home settings from EEPROM
  EEPROM.get(HOME_SHOULDER_ADDR, msShoulder);
  EEPROM.get(HOME_ELBOW_ADDR, msElbow);
  EEPROM.get(HOME_LINACT_ADDR, msLinAct);

  //Setup the first move
  targetShoulder = msShoulder;
  halfwayShoulder = (msShoulder + targetShoulder) / 2;
  targetElbow = msElbow;
  halfwayElbow = (msElbow + targetElbow) / 2;
  targetLinAct = msLinAct;
  halfwayLinAct = (msLinAct + targetLinAct) / 2;
  firstMove = true;

  //Set up serial connection
  Serial.begin(115200);
  //Set up the pins in the correct pin mode
  pinMode(MAGNET_PIN, OUTPUT);
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

    //Write the new position to the servos
    shoulder.writeMicroseconds(msShoulder + trimShoulder);
    elbow.writeMicroseconds(msElbow + trimElbow);
    linAct.writeMicroseconds(msLinAct + trimLinAct);
  }

  frameCount ++;
  now = millis();
  accumulator += now - lastFrame;
  lastFrame = now;
  if (accumulator > FPS_INTERVAL) logFPS();

  //Check if any bytes can be read from the serial monitor
  if (Serial.available() > 0) parseSerial();

  //Add a tiny bit of delay to allow for serial to buffer and stuff
  delay(10);
}

int getEaseMovement(int ms, int diff, int halfwaypoint, int change) {
  if ((diff > 0 && ms > halfwaypoint) || (diff < 0 && ms < halfwaypoint)) {
    int spd = diff / EASE_FACTOR;
    return spd == 0 ? diff : spd;
  } else {
    return map(halfwaypoint - ms, change, 0, baseAcc, change / EASE_FACTOR);
  }
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
    Serial.println("OK");
  }
}

/**
   Once every interval this posts the FPS and current angle data to the serial port
*/
void logFPS() {
  accumulator -= FPS_INTERVAL;
  Serial.print("FPS ");
  Serial.print(String(frameCount / 5));
  Serial.print("\t\t");
  Serial.print(msShoulder);
  Serial.print("\t");
  Serial.print(msElbow);
  Serial.print("\t");
  Serial.println(msLinAct);
  frameCount = 0;
}

/**
   Parse the serial input, try to find the command format
*/
void parseSerial() {
  //If no command mode has been set yet
  if (commandMode == CMD_NONE) {
    char c = Serial.read();
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
    } else if (c == 'E' || c == 'e') {
      commandMode = CMD_EASE;
    } else if (c == 'H' || c == 'h') {
      commandMode = CMD_HOME;
    }
    //If we just found the start of a command, ignore the next char (whether it is a opening bracket or a space)
    if (commandMode != CMD_NONE) Serial.read();
  } else {
    //We are already in a command mode, first check if we need to close this command
    if (Serial.peek() == ')' || Serial.peek() == ';') {
      logReceivedCommand();
      commandMode = CMD_NONE;
      numsRead = 0;
      Serial.read();
      return;
    }

    //If we make it to here, we can at least parse the num
    int num = Serial.parseInt();
    numsRead ++;
    if (commandMode == CMD_POS) {
      if (numsRead == 1) {
        targetShoulder = num;
        changeShoulder = (targetShoulder - msShoulder) / 2;
        targetShoulder = constrain(targetShoulder, MIN_SHOULDER, MAX_SHOULDER);
        halfwayShoulder = (msShoulder + targetShoulder) / 2;
      } else if (numsRead == 2) {
        targetElbow = num;
        changeElbow = (targetElbow - msElbow) / 2;
        targetElbow = constrain(targetElbow, MIN_ELBOW, MAX_ELBOW);
        halfwayElbow = (msElbow + targetElbow) / 2;
      }
    } else if (commandMode == CMD_LIN) {
      if (numsRead == 1) {
        targetLinAct = num;
        changeLinAct = (targetLinAct - msLinAct) / 2;
        targetLinAct = constrain(targetLinAct, MIN_LINACT, MAX_LINACT);
        halfwayLinAct = (msLinAct + targetLinAct) / 2;
      }
    } else if (commandMode == CMD_MAGNET) {
      if (numsRead == 1) {
        //Write the magnet to the correct state immediately
        digitalWrite(MAGNET_PIN, num > 0 ? HIGH : LOW);
        magnetState = num;
      }
    } else if (commandMode == CMD_TRIM) {
      if (numsRead == 1) {
        trimShoulder = num;
      } else if (numsRead == 2) {
        trimElbow = num;
      } else if (numsRead == 3) {
        trimLinAct = num;
      }
    } else if (commandMode == CMD_ACC) {
      if (numsRead == 1) {
        baseAcc = num;
        elbowAcc = num * ELBOW_MULT;
        linactAcc = num * LINACT_MULT;
      }
    } else if (commandMode == CMD_EASE) {
      if (numsRead == 1) {
        easing = num > 0 ? true : false;
      }
    } else if(commandMode == CMD_HOME){
      saveHome();
    }
  }
}

void saveHome(){
  EEPROM.put(HOME_SHOULDER_ADDR, targetShoulder);
  EEPROM.put(HOME_ELBOW_ADDR, targetElbow);
  EEPROM.put(HOME_LINACT_ADDR, targetLinAct);
}

/**
   This shows the received command in the Serial
*/
void logReceivedCommand() {
  if (commandMode == CMD_POS) {
    Serial.print("POSITION S(");
    Serial.print(String(targetShoulder));
    Serial.print(") E(");
    Serial.print(String(targetElbow));
    Serial.println(")");
  } else if (commandMode == CMD_LIN) {
    Serial.print("LINACT L(");
    Serial.print(String(targetLinAct));
    Serial.println(")");
  } else if (commandMode == CMD_MAGNET) {
    Serial.print("MAGNET M(");
    Serial.println(magnetState > 0 ? "HIGH)" : "LOW)");
    Serial.println("OK");
  } else if (commandMode == CMD_ACC) {
    Serial.print("ACCELERATION ");
    Serial.println(String(baseAcc));
    Serial.println("OK");
  } else if (commandMode == CMD_TRIM) {
    Serial.print("TRIM S(");
    Serial.print(String(trimShoulder));
    Serial.print(") E(");
    Serial.print(String(trimElbow));
    Serial.print(") L(");
    Serial.print(String(trimLinAct));
    Serial.println(")");
    Serial.println("OK");
  } else if(commandMode == CMD_EASE){
    Serial.print("EASING ");
    Serial.println(easing ? "ON" : "OFF");
  } else if(commandMode == CMD_HOME){
    Serial.println("SET HOME");
  }
}
