/**
 * The code for the Robot Arm, this controls the servos and electro magnet
 * Messages are received over the Serial port.
 * 
 * We follow the following format:
 * M(SHOULDER ELBOW LINACT MAGNET) //move
 * T(SHOULDER ELBOW LINACT) //set trim
 * A(VALUE) //set acceleration
 */
#include <Servo.h> 

const int MAX_SHOULDER = 2300;
const int MIN_SHOULDER = 600;
const int MAX_ELBOW = 2200;
const int MIN_ELBOW = 600;
const int MAX_LINACT = 2300;
const int MIN_LINACT = 800;

//The pins for each of the externals
const int MAGNET_PIN = 12;
const int SHOULDER_PIN = 3;
const int ELBOW_PIN = 6;
const int LINACT_PIN = 9;

//The variables used for the acceleration
int acc = 1;

//The trim values for each of the servos, this is in microseconds
int trimShoulder = 0;
int trimElbow = 0;
int trimLinAct = 0;

//The target values for each of the positions
int targetShoulder = 1500;
int targetElbow = 1500;
int targetLinAct = 1500;
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
const byte NONE = 0;
const byte MOVE = 1;
const byte ACC = 2;
const byte TRIM = 3;
byte commandMode = NONE;
byte numsRead = 0;
bool firstMove = false;

int accumulator = 0;
int elapsed = 0;
unsigned long lastFrame = 0;
unsigned long now = 0;
unsigned long frameCount = 0;

/**
 * Runs once when the power is turned on
 */
void setup() {
  //Attach the servos to the correct pins, maybe detach as soon as there is nothing to do anymore
  shoulder.attach(SHOULDER_PIN);
  elbow.attach(ELBOW_PIN);
  linAct.attach(LINACT_PIN);

  //Setup the first move
  targetShoulder = 1200;
  targetElbow = 1200;
  targetLinAct = 800;
  firstMove = true;
  
  //Set up serial connection
  Serial.begin(115200);
  //Set up the pins in the correct pin mode
  pinMode(MAGNET_PIN, OUTPUT);
}

/**
 * Runs as often as possible
 */
void loop() {
  //Check if we're done moving
  if(targetShoulder == msShoulder && targetElbow == msElbow && targetLinAct == msLinAct){
    if(!moveDone){
      moveDone = true;
      Serial.println("OK");
      //Write microseconds to each for the last time to finish this move
      shoulder.writeMicroseconds(targetShoulder + trimShoulder);
      elbow.writeMicroseconds(targetElbow + trimElbow);
      linAct.writeMicroseconds(targetLinAct + trimLinAct);
      if(firstMove){
        firstMove = false;
        targetShoulder = 1500;
        targetElbow = 1500;
        targetLinAct = 1500;
      }
    }
  }else{
    //We're not done moving, so set this flag
    moveDone = false;

    //Calculate the current difference
    diffShoulder = targetShoulder - msShoulder;
    diffElbow = targetElbow - msElbow;
    diffLinAct = targetLinAct - msLinAct;

    //Now move towards the target for each of the servos
    if(diffShoulder > acc) msShoulder += acc;
    else if(diffShoulder < -acc) msShoulder -= acc;
    else msShoulder += diffShoulder;
    
    if(diffElbow > 2 * acc) msElbow += 2 * acc;
    else if(diffElbow < -2 * acc) msElbow -= 2 * acc;
    else msElbow += diffElbow;
    
    if(diffLinAct > 4 * acc) msLinAct += 4 * acc;
    else if(diffLinAct < - 4 * acc) msLinAct -= 4 * acc;
    else msLinAct += diffLinAct;

    //Write the new position to the servos
    shoulder.writeMicroseconds(msShoulder + trimShoulder);
    elbow.writeMicroseconds(msElbow + trimElbow);
    linAct.writeMicroseconds(msLinAct + trimLinAct);
  }

  frameCount ++;
  now = millis();
  elapsed = now - lastFrame;
  accumulator += elapsed;
  lastFrame = now;
  if(accumulator > 1000){
    accumulator -= 1000;
    Serial.print("FPS ");
    Serial.print(String(frameCount));
    Serial.print("\t");
    Serial.print(msShoulder);
    Serial.print("\t");
    Serial.print(msElbow);
    Serial.print("\t");
    Serial.println(msLinAct);
    frameCount = 0;
  }
  
  //Check if any bytes can be read from the serial monitor
  if(Serial.available() > 0){
    parseSerial();
  }

  //Add a tiny bit of delay to allow for serial to buffer and stuff
  delay(5);
}

/**
 * Parse the serial input, try to find the command format
 */
void parseSerial(){
  //If no command mode has been set yet
  if(commandMode == NONE){
    char c = Serial.read();
    if(c == 'M'){
      commandMode = MOVE;
      Serial.read();
    }else if(c == 'T'){
      commandMode = TRIM;
      Serial.read();
    }else if(c == 'A'){
      commandMode = ACC;
      Serial.read();
    }
  }else{
    //We are already in a command mode, first check if we need to close this command
    if(Serial.peek() == ')'){
      logReceivedCommand();
      commandMode = NONE;
      numsRead = 0;
      Serial.read();
      return;
    }

    //If we make it to here, we can at least parse the num
    int num = Serial.parseInt();
    numsRead ++;
    if(commandMode == MOVE){
      if(numsRead == 1){
        targetShoulder = num;
        targetShoulder = constrain(targetShoulder, MIN_SHOULDER, MAX_SHOULDER);
      }else if(numsRead == 2){
        targetElbow = num;
        targetElbow = constrain(targetElbow, MIN_ELBOW, MAX_ELBOW);
      }else if(numsRead == 3){
        targetLinAct = num;
        targetLinAct = constrain(targetLinAct, MIN_LINACT, MAX_LINACT);
      }else if(numsRead == 4){
        //Write the magnet to the correct state immediately
        digitalWrite(MAGNET_PIN, num > 0 ? HIGH : LOW);
        magnetState = num;
      }
    }else if(commandMode == TRIM){
      if(numsRead == 1){
        trimShoulder = num;
      }else if(numsRead == 2){
        trimElbow = num;
      }else if(numsRead == 3){
        trimLinAct = num;
      }
    }else if(commandMode == ACC){
      if(numsRead == 1){
        acc = num;
      }
    }
  }
}

/**
 * This shows the received command in the Serial
 */
void logReceivedCommand(){
  if(commandMode == MOVE){
    Serial.print("MOVE S(");
    Serial.print(String(targetShoulder));
    Serial.print(") E(");
    Serial.print(String(targetElbow));
    Serial.print(") L(");
    Serial.print(String(targetLinAct));
    Serial.print(") M(");
    Serial.println(magnetState > 0 ? "HIGH)" : "LOW)");
  }else if(commandMode == ACC){
    Serial.print("ACC ");
    Serial.println(String(acc));
    Serial.println("OK");
  }else if(commandMode == TRIM){
    Serial.print("TRIM S(");
    Serial.print(String(trimShoulder));
    Serial.print(") E(");
    Serial.print(String(trimElbow));
    Serial.print(") L(");
    Serial.print(String(trimLinAct));
    Serial.println(")");
    Serial.println("OK");
  }
}
