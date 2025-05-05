# Layouting

## Anchoring
User can (un)anchor chosen node using the ⚓ button.

{{% tutorial-image "images/projects/cme-and-layout/anchor-node-button.png" %}}

Anchoring node means that once we run force-directed algorithm, the anchored nodes are not moved when layouting is finished.

Other algorithms unfortunately move the node, the Elk layouting library doesn't support anchoring for others.
Sure we could just run the algorithm and then not update the anchored visual nodes in the visual model, but that's simply not
really useful, since the layouting algorithm moved it, so by having it stay on old place, the layout may be significantly worse.

User can tell if node is anchored by looking at the top right corner of node. If it contains the ⚓ icon, then the node is anchored.
As seen on the following image.


{{% tutorial-image "images/projects/cme-and-layout/anchored-node-example.png" %}}


The user can layout:
1. Whole visual model
2. Selection - Where selection means the selected nodes and selected edges going between the selected nodes

## Layouting algorithms

We split the talk about into 2 sections, quick guide and detailed explanation.

### I don't have time, just tell me what's good

#### Layouting of visual model

- First you should try `force-directed with clusters` with default settings
- If you are not satisfied, just try force-directed - if it looks better, you can bump up the number of runs, which may improve results.
Just note that the gain in layout quality isn't linear.
Meaning if you run the algorithm 1 time, 10 times and 100 times, then the layout after 10 runs may be actually 10 times better than running only once, but running 100 times definitely won't be 100 times better. After certain number it is just waste of time. I think that on mid-sized graphs 10-50 should be the range to look for.
- If you want to layout diagram in layers (hierarchy), use hierarchical
- If you want to make the diagram more spacy or remove overlaps use Node overlap removal algorithm.

#### Layouting of selection


When it comes to layout of selection, I personally think that the most useful ones are:

- Layered (hierarchical). For example when we combine it together with the extend selection feature, we
can find all generalization children, and layout them, so we can have tree of depth 1
- Node overlap algorithm, this can be also useful, for example when we run force-directed algorithm for the whole diagram
and some small part of the layouted model is overlapping, or too close to each other
- Sometimes It may be also useful to use force-directed algorithm, for example if we want node and its neighborhood to layout like star:

{{% tutorial-image "images/projects/cme-and-layout/star-layout-force-directed.png" %}}


### Detailed List of algorithms and when to use them

Layout solution is based on the ElkJS layouting library.

### Warnings
- Only force-directed algorithm (Elk Stress) takes into consideration anchors
- All algorithms remove existing edge layout on the layouted part
- The layouting of groups is not optimal, for reason why you can check the [technical documentation for layout package](https://github.com/mff-uk/dataspecer/tree/main/packages/layout).
