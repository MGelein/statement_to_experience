#include <Servo.h>

//Instantiate the servo
Servo servo;

#define TRIG_PIN 5
#define ECHO_PIN 6

float sum = 0;

byte pos = 0;
byte spd = 1;
int inc = spd;

float easedVal = 0;
float val; 

unsigned long timestamp = 0;

void setup() {
  //Attach to the correct pin
  servo.attach(3);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.begin(115200);
}

void loop() {
  val = pulse();
  easedVal += (val - easedVal) * 0.1;
  Serial.println(round(easedVal * 10));
  
  int leftOver = (millis() - timestamp) - 30;
  timestamp = millis();
  if(leftOver > 0) delay(leftOver);
}

/**
   Pulses the HC-SR04 Ultrasonic range sensor
*/
float pulse() {
  // Clears the trigPin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  float val = (pulseIn(ECHO_PIN, HIGH, 30000) * 0.034) / 2;//Max output of 500cm
  return val;
}
