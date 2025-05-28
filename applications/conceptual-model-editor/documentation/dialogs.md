# Dialogs
Dialogs are one of the main architecture units.

Each dialog should consists of following files:
- `-dialog-view.tsx`
  This file should export a React component rendering the dialog.
  The dialog must use `useMemo` for a controller.
- `-dialog-state.ts`
  Export a state used by the dialog.
- `-dialog-adapter.ts`
  Provides functionality to create a dialog state and to convert the state to other objects.
- `-dialog-controller.ts`
  Define interface for the controller and export hook function to use the controller.
- `-dialog.ts`
  Provide a function to create the dialog.
  For example we may need to set different labels for a dialog edit or create version.

Each dialog should be placed into its own directory.
