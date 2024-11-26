# cim search

This directory contains the source code for the **set root button** and **the dialog for searching the class**. It is used at the very beginning of the schema construction when the user needs to select the root. Later in the process, searching is not required.

The content of the search dialog is chosen based on the curretly selected adapter.
If the `WikidataAdapter` is selected, the `WikidataSearchDialogContent` is used, in all other cases, the default search dialog is used.
