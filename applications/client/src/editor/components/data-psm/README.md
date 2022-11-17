# React components for PSM tree visualization

PSM schema is visualized as a tree in the UI, where some entities are grouped on a single line to make the tree more readable. Association is an example as it points to a single object. Hence we can join these two entities on a single line.

Each row is rendered by `DataPsmBaseRow`, which has slots. Slots are places where you can insert other react components that will be rendered on the row in a specific place. For example, `DataPsmAssociationEndItem` sets its own slots (such as buttons, text, and icons) and calls `DataPsmClassItem` that adds additional buttons and text, and calls `DataPsmBaseRow` to render the row (as the row ends with a class).
