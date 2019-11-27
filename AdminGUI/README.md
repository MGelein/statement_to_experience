# Robot Arm Admin GUI
This document explains some of the functionality of the UI to control the RobotArm directly.

## GUI Controls
On screen there are several controls, let's talk about what each of them do:
- __Three sliders__: The three sliders each control one of the three servos in the robot arm, if direct control is enabled this immediately changes the servos. You can highlight each of the servo's by pressing its hotkey `S` for shoulder, `E` for elbow and `L` for linear actuator. If a slider is highlighted you can also move it with the UP and DOWN arrows.
- __Direct Comm.__: If this is enabled any change made in the sliders or the magnet button will be immediately reflected in the actual physical arm. Shortcut key = `D`.
- __Elec. Magnet__: Allows you to toggle the electrical magnet attached to the linear actuator. Shortcut key = `M`.
- 

## Saving Presets
Once you have set the sliders to something you like you can save this preset by clicking the 'Save As' button. Now another screen
will popup, asking you what part of this setting you want to save. This can either be:
- The magnet: you only save the magnet settings this way, probably useless at this point in the project
- The linear actuator: you only save the linear actuator settings, probably very useful if we need to set the specific linAct settings across the board.
- The position setting: you save the shoulder and elbow settings.
You can give the preset any name containg only lowercase, uppercase and digits. 