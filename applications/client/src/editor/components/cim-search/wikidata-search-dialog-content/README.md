# The Wikidata search dialog

To use the `WikidataSearchDialogContent` one must define the `WikidataAdapterContext` to enable API calls to the Wikidata ontology API service. 

The search dialog is rather simple.
A user inputs a text search query and clicks the search button.
A user can also define a boost for widely used classes.
Also, a user can input a filter that contains properties that the class **must** contain.

Entity detail dialogs are used to enable users to select the class as a root or as a property to the filter.
All classes inside the dialog can be selected as a root.
During the property addition to the filter, the a property can be added to the filter directly from the dialog.

- A class search user inputs:
  - The searching is started by clicking on the search button. That is done in order not to overload the server. Especially with the methods using the language models for embeddings.
  - A free text input:
    - The text must have a maximum length since the language models can fail when provided with a long text.
    - It can contain keywords or sentences.
  - A slider to boost the widely used classes:
    - The slider defines a percentage of the final result score that is assigned to the boost query. Lets call it `boost_weight`
    - Internally, it is a convex combination: `query_score * (1 - boost_weight) + boost_score * boost_weight`
  - A property filter:
    - The filter enables a user to input properties the class must contain.
    - If multiple properties are added, the filter acts as `AND` on the properties.
    - The property search is opened in a separate dialog.
- A property search user inputs:
  - The search is in separate dialog from the class search.
  - The search is handled as "search as you type" way, since the properties are searched only with the keywords.
  - A free text input:
    - Again, the search is constrained by the maximum length of the string.
  - A slider to boost the widely used properties.
    - The same principle applies as in the class boost slider.