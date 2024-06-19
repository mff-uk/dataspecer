# Future improvements

## Context menus

The developer working on this project is not a great modeller. So it happens that it's been to close to the deadline when he realized that context menus should and could have been done with the help of Reactflow Context menu support instead of needing to implement it himself. That's one item on our future improvement list.

## Edge renderings

Multiple relationships between two classes overlap each other. The research group decided that for the first version of conceptual model editor this is a bearable drawback. We hope to ship future version with an ability to modify how edges get routed.

## Mobile version

dscme was not built with the idea to use it on mobile devices. We understand that some modellers want to work on the go, future versions of `dscme` might support mobile devices 🤷‍♂️.

## Very large models

If you provide a model that has thousands of concepts, it might take us a while to process it. Most of all, rendering the thousand of classes to the model list is not beautiful, some improvements might come for that in the future.

## Multi-person editing

One of our plans is for `dscme` to enable multi-person editing by having all the models on the backend. We're just a FE app now, real-time synchronization is not straight forward.

## Application visuals

We are using [tailwind.css](https://tailwindcss.com/) for styling `dscme`. From developer point of view, the workflow is 10/10 but since the main developer is not a UI designer, the visuals of `dscme` seem like they were designed by a child 👶. It might look different if we used some UI library.
