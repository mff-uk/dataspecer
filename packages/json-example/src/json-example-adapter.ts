  import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
  import {
    DataSpecificationArtefact
  } from "@dataspecer/core/data-specification/model/data-specification-artefact.js";
  import {
    JSONSchemaFaker
  } from "json-schema-faker";

  export class JsonExampleAdapter {

    
    protected schema: string;
    protected context: ArtefactGeneratorContext;
    protected artefact: DataSpecificationArtefact;
    protected baseURL: string = "";

    constructor(
      schema: string,
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact
    ) {
      this.schema = schema;
      this.context = context;
      this.artefact = artefact;
    }
  
    public generate = async () => {
    

      var resultString = await this.generateJsonData(this.schema);

      return { data: resultString };
    };

    async generateJsonData(schema : string) : Promise<String> {
      const json = JSON.parse(schema);
      JSONSchemaFaker.option({requiredOnly: true});
      const generatedJson = await JSONSchemaFaker.resolve(json);
      
      if(generatedJson == null){
        return "";
      } else {
        return JSON.stringify(generatedJson, null, 2);
      }
    }
}  