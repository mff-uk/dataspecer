# Actions
The Conceptual-Model-Editor (CME) utilize concept of actions to handle changes in the persistent and global state.
Actions centralize business code to one place instead of leaving it scattered all around the application.
In addition, actions can be called from different places of the CME providing us easy way to design and implement user friendly user interface.

An action encapsulate a business logic like create a class, show class on a canvas, etc..
All classes should be placed into a single directory and made available using React context.

## Commands
Actions are not distinct int he provided functionality.
For example, create class profile action also add a new profile to the canvas.
This functionality is shared with the add profile to canvas action.

There are several solutions to the issue:
- Allow actions to call one another.
- Duplicate the code inside the actions.
- Move the shared code into another part of the source code.

The first option would read to spaghetti-like code introducing making it hard to reason about the actions and update them.
The second option would make it hard to change functionality as we would need to keep track of all duplicity code.
We decide to go with the last option, extracting the shared functionality.

That is why we introduce commands.
A command represent a change to the state and can be called via the action.
A command is not allowed to call another command.
An action can call multiple commands.

Commands are placed under special directory in the action directory.
Unlike the actions, a command is not accessible via React context.
