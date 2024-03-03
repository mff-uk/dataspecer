# @dataspecer/json-example

## About json-examples package

Json-examples is a package that allows users of Dataspecer to generate random JSON or JSON-LD data based on the data specification that is represented in Dataspecer. 

## About json-examples implementation

It uses the library ([json-schema-faker](https://github.com/json-schema-faker/json-schema-faker)) and shapes it for the needs of Dataspecer in terms of which JSON structure is generated. Json-examples are dependent on the JSON Schema generator from Dataspecer and rely on the outputs of that generator. 

## How to generate either JSON or JSON-LD data
Dataspecer allows the user to choose, whether they want to generate pure JSON data or if they wish to generate JSON-LD data, one of RDF data formats. To change the setting of which one of those two variants gets generated is done in Dataspecer Artifact configuration along with other settings, that are also concerning other artifacts. To decide which data format will be generated:
1. Scroll to the "Configure artifacts" button in the list of Data specifications at the bottom part of the screen. The button is located under the "Generate artifacts" header.
2. Go to the tab "JSON".
3. Scroll down to the header "JSON example" and Choose either Yes or No. Yes = generate JSON-LD. No = generate JSON.
4. Click on "Save" in the configuration window. Return to the list of data specifications.
5. Go to the data specification you want to generate sample data for.
6. Click on the button "Artifacts" in the top right corner.
7. Select/tick JSON examples.

You can see the generated data on the screen.

The data can also be simply copied to a clipboard or downloaded to your device via the other buttons in the "Artifacts" dropdown menu.