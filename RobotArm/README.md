# Arduino Arm Control
The Arduino will accept the following commands over Serial connection with 115200 baud rate:
- `H()`, no arguments. Saves the current position of the servos as HOME in EEPROM. Next time it boots, it will immediately try to be at that position.
- `A(INT)`, sets the maximum speed that we can move per update in LINEAR mode.
- `M(INT)`, enables the magnet pin on any number higher than 0.
- `L(INT)`, sets the provided number as the targetnumber for the linear actuator, this moves the servo.
- `P(INT INT)`, sets the provided targetnumbers for both the shoulder and elbow servos (in order). 
- `T(INT INT INT)`, sets the trim, or offset, of the three servos, in order: shoulder, elbow, linear actuator.

The Arduino returns "OK" when a move has been completed, which is instantaneous in the case of every move except for `L` and `P`, which both 
control servos and thus require more time. 

Multiple arguments between the brackets can be divided by either spaces or underlines. Commands MUST be closed by either a closing parenthesis
or a semicolon. The opening parenthesis between the initial command letter and the first number can be ANY symbol, but for clarity either of the following
formats is recommended:
- `P 1500 1500;`
- `P(1500 1500)`
- `P(1500_1500)`
- `P_1500_1500;`