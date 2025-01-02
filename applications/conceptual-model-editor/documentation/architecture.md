# Architecture
The Conceptual-Model-Editor (CME) consists of several main components.

*DataSpecer binding* is an interface and a communication layer with DataSpecer service.

*The visual editor* is responsible for the main component, the visual editor.
The use of the interface allows for easy change of the underlying editor implementation.

*Dialogs* are the main way user edit the content.
That is why we separate them to a component.

*Actions* represents operation that user can do.
The ideas is to have all business functionality on one place.
This allow us to call actions from different contexts and places.
For example, 'show/hide' action can be executed from dialog, toolbar or in reaction to user prompt.
In addition, actions allows us centralized undo/redo implementation.
