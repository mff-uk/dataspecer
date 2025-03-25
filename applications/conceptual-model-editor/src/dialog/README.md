# Dialog
In order to make dialog extensible and testable we employ a MVC inspired design.
Every dialog must consists of tree components:
- State
- Controller
- Dialog

## Component: State
Stored in "-dialog-state.ts" file.
This file contains state definition as well as state factory methods.

## Component: Controller
Stored in "-dialog-controller.ts" file.
This file contains definition of the controller as well as the implementation.

## Component: Dialog
Stored in "-dialog.ts" file.
This file contain definition of the user-interface.

## Base dialogs
A shared functionality should be located in the "base-" folders.
Those folders should contain definition of State and Controller.
