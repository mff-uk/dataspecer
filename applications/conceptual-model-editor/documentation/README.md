# Documentation
This is a developer documentation for the Conceptual-Model-Editor (CME)
The purpose of this document is to provide overview of design and code related decisions.

## Code style
There is ESLint, run `npm run lint` before every commit and make sure there are no errors!
You can commit with warning, but try to limit their number.

## Architecture
CME is, to certain extend, a simple client side application.
It loads data from Dataspecer backend and provide user a way to edit the data.
Yet, there is lot more to it then meets the eye.

The main components are:
- *DataSpecer binding* is an interface and a communication layer with DataSpecer service.
- *The visual editor* is responsible for the main component, the visual editor.
- *Dialogs* are the main way user edit the content.
- *Actions* represents operation that user can do.
  The ideas is to have all actions at one place.
  For example, 'show/hide' action can be executed from dialog, toolbar or in reaction to user prompt.

### Directories / Packages
This section contains comments relevant for developing code in certain packages.

### Package `action`
CME utilizes concept of actions to handle changes in the persistent and global state.
Actions can be called from different places of the CME providing us easy way improve user-experience.
Notes on action implementation:
- Each action must be in a separate file.
- An action should not call another action.
- Actions must act as error boundaries and handle possible errors in called code.

## Features
This section describe implementation detail, or plans, for selected features.

# Feature undo/redo [design]
