/**
 * The code for the Robot Arm, this controls the servos and electro magnet
 * Messages are received over the Serial port.
 * 
 * We follow the following format:
 * M(SHOULDER ELBOW LINACT MAGNET) //move
 * T(SHOULDER ELBOW LINACT) //set trim
 * A(VALUE) //set acceleration
 */

//The pins for each of the externals
const int MAGNET_PIN = 12;
const int SHOULDER_PIN = 3;
const int ELBOW_PIN = 6;
const int LINACT_PIN = 9;

//The variables used for the acceleration
int acc = 5;

//The trim values for each of the servos, this is in microseconds
int trimShoulder = 0;
int trimElbow = 0;
int trimLinAct = 0;

//The target values for each of the positions
int targetShoulder = 1500;
int targetElbow = 1500;
int targetLinAct = 1500;

//The positions of each of the servos and magnet
int msShoulder = 1500;
int msElbow = 1500;
int msLinAct = 1500;
int magnetState = LOW;

//The servos used in this robot
Servo shoulder;
Servo eblow;
Servo linAct;

//Variables used in the parsing of the commands
const byte NONE = 0;
const byte MOVE = 1;
const byte ACC = 2;
const byte TRIM = 3;
byte commandMode = NONE;
byte numsRead = 0;

int accumulator = 0;
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
  
  //Set up serial connection
  Serial.begin(115200);
  //Set up the pins in the correct pin mode
  //pinMode(MAGNET_PIN, OUTPUT);
  //pinMode(SHOULDER_PIN, OUTPUT);
  //pinMode(ELBOW_PIN, OUTPUT);
  pinMode(LINACT_PIN, OUTPUT);
}

/**
 * Runs as often as possible
 */
void loop() {


  frameCount ++;
  now = millis();
  accumulator += now - lastFrame;
  lastFrame = now;
  if(accumulator > 1000){
    accumulator -= 1000;
    Serial.print(String(frameCount));
    Serial.println(" fps");
    frameCount = 0;
  }
  
  //Check if any bytes can be read from the serial monitor
  if(Serial.available() > 0){
    parseSerial();
  }
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
      }else if(numsRead == 2){
        targetElbow = num;
      }else if(numsRead == 3){
        targetLinAct = num;
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
