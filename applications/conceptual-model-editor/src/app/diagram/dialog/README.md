# Dialog
We design dialogs to be usable via a context.
In other words dialog is rendered in one place of an application and controlled from anywhere using a context.
As a result, the context must provide initial value and control the dialog visibility.

For now, we keep the dialog in a single file.
Yet we may split it to:
- ".context" - The control context.
- "" - The dialog component.
- ".controller" - The context used by the dialog.
