# SHACL and ShEx artifacts

## How to install

Minimal installation requires only the SHACL package and all its dependencies.

1. Clone the repository `git clone ...`
2. Install all packages by `npm install` from the root of the repository
3. Build all packages (this is necessary to build dependencies) by `npm run build` from the root of the repository.

## To reproduce the issue:
- Run tests by `npm run test` from the package directory

## How to generate artifacts and use the generated artifacts

The user can generate SHACL and ShEx validating schemas using the Dataspecer tool available on the website: [Dataspecer](https://tool.dataspecer.com/).

There after creating some data specification (or opening any of already existing ones), there is a drop menu upon clicking the button "Artifacts". From the multiple selection menu, choose either SHACL if you want to validate your data with SHACL validator, or ShEx and ShEx QueryMap, if you want to validate the data in a ShEx validator. You can either just tick the box and copy the generated artifact to your chosen validator or you can copy the artifact to the clipboard right away by clicking "Copy to Clipboard" option right to the artifact name, or download a file with the text of the generated artifact next to the "Copy to Clipboard" icon.

### Validating data with SHACL artifact

After generating the artifact, you can either use your own preferred SHACL validator, or if you do not have any, you can try validating the data with SHACL with this online validator: [SHACL Playground](https://shacl.org/playground/)

To validate data with SHACL validator, you need 2 inputs: 
- the SHACL validating schema
- the data in RDF format (data graph)

The validating schema describes, how the data structure should look like in your data. It also implicitly contains directives, which data nodes to validate.

How to obtain the SHACL validating schema was already explained in the common section for both generators "How to generate artifacts and use the generated artifacts".

If you have your RDF data that you want to validate whether they conform to the data specification, use them. If you do not have any sample data, go once more to the "Artifacts" button in the top right corner of Dataspecer tool and generate one more artifact called "JSON examples". You can use this generated sample data to try out validating this data against the generated SHACL validating schema.

Now that you have both imputs for validating in SHACL, open the online SHACL validator ([SHACL Playground](https://shacl.org/playground/)).

 - The left input window named "Shapes Graph" is where you input the generated SHACL artifact. 
 - Click on "Update" button down below the "Shapes Graph" input window. Make sure that the Format next to the Update button is set to "Turtle".
 - The right input window named "Data Graph" is where you input the generated JSON examples artifact or your own data that will be validated. 
 - Click on "Update" button down below the "Data Graph" input window. Make sure that the Format next to the Update button is set to "JSON-LD" if you are using the generated JSON examples sample data. If you are using your own data, make sure that the data format matches with the Format setting (currently only Turtle and JSON-LD are possible). 
 - Now you should see complete Validation Report in the bottom right window on the screen. If the data conform, the Validation report is very brief, informing you about the conformity. If the data do not conform, the validation report points out the data issue that was found out by the SHACL validator.

After going through the "Validation Report", the data validation process with SHACL validator and the generated SHACL artifact from Dataspecer is complete.


### Validating data with ShEx and ShEx QueryMap artifacts

After generating the artifact, you can either use your own preferred ShEx validator, or if you do not have any, you can try validating the data with ShEx with this online validator: ([ShEx2 - Simple Online Validator](http://shex.io/webapps/shex.js/doc/shex-simple.html))

To validate data with ShEx validator, you need 3 inputs: 
- the ShEx validating schema
- the data in RDF format (data graph)
- the ShEx Query Map 

The validating schema describes, how the data structure should look like in your data. The query map states, which data nodes are going to be tested from the supplied data graph.

How to obtain the "ShEx" validating schema and "ShEx QueryMap" artifacts was already explained in the common section for both generators "How to generate artifacts and use the generated artifacts".

If you have your RDF data that you want to validate whether they conform to the data specification, use them. If you do not have any sample data, go once more to the "Artifacts" button in the top right corner of Dataspecer tool and generate one more artifact called "JSON examples". You can use this generated sample data to try out validating this data against the generated ShEx validating schema and generated ShEx Query Map.

Now that you have all imputs for validating in ShEx, open the online ShEx validator ([ShEx2 - Simple Online Validator](http://shex.io/webapps/shex.js/doc/shex-simple.html)).

 - The left blue input window named is where you input the generated validating ShEx artifact. 
 - The right green input window named is where you input the generated JSON examples artifact or your own data that will be validated. 
 - The small input window with white background is where you input the ShEx QueryMap. Make sure you are inputting the QueryMap to the tab that is called "Query Map" as there are also different ShEx Maps, that can be used to choose the data to validate.
 - Click the "validate (ctrl-enter)" button. 
 - Now you should see complete Validation Report in the bottom of the screen. If the data conform, the Validation report is very brief, informing you about the conformity. If the data do not conform, the validation report points out the data issue that was found out by the ShEx validator.

After going through the validation report, the data validation process with ShEx validator and the generated ShEx artifact from Dataspecer is complete.