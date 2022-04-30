# artifacts

This directory contains the source code for the **artifacts button** and **displaying and downloading generated artifacts**.

## How to add another generator

1. Add menu item to the [`GenerateArtifactsMenu`](./generate-artifacts-menu.tsx) component.
2. Modify the [`SingleArtifactPreview`](./multiple-artifacts-preview.tsx) component if the generated artifact has new, different format than other already existing artifacts.
