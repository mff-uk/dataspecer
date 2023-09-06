import {
    StructureModel,
    StructureModelClass,
    StructureModelType,
    StructureModelComplexType,
    StructureModelProperty,
    StructureModelPrimitiveType,
    StructureModelCustomType,
    StructureModelSchemaRoot,
  } from "@dataspecer/core/structure-model/model";
  import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
  import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
  import ModelCreator from "./ModelCreatorInterface";

class AllPrimitiveTypesModelCreator implements ModelCreator{

   createModel(): StructureModel{
    var model = new StructureModel();
  
      var primitiveType1 : StructureModelPrimitiveType;
      primitiveType1 = new StructureModelPrimitiveType();
      primitiveType1.dataType = "http://www.w3.org/2001/XMLSchema#integer";
      primitiveType1.example = null;
      primitiveType1.regex = null;

      var primitiveType2 : StructureModelPrimitiveType;
      primitiveType2 = new StructureModelPrimitiveType();
      primitiveType2.dataType = "http://www.w3.org/2001/XMLSchema#boolean";
      primitiveType2.example = null;
      primitiveType2.regex = null;

      var primitiveType3 : StructureModelPrimitiveType;
      primitiveType3 = new StructureModelPrimitiveType();
      primitiveType3.dataType = "http://www.w3.org/2001/XMLSchema#decimal";
      primitiveType3.example = null;
      primitiveType3.regex = null;

      var primitiveType4 : StructureModelPrimitiveType;
      primitiveType4 = new StructureModelPrimitiveType();
      primitiveType4.dataType = "http://www.w3.org/2001/XMLSchema#date";
      primitiveType4.example = null;
      primitiveType4.regex = null;

      var primitiveType5 : StructureModelPrimitiveType;
      primitiveType5 = new StructureModelPrimitiveType();
      primitiveType5.dataType = "http://www.w3.org/2001/XMLSchema#time";
      primitiveType5.example = null;
      primitiveType5.regex = null;

      var primitiveType6 : StructureModelPrimitiveType;
      primitiveType6 = new StructureModelPrimitiveType();
      primitiveType6.dataType = "http://www.w3.org/2001/XMLSchema#dateTimeStamp";
      primitiveType6.example = null;
      primitiveType6.regex = null;

      var primitiveType7 : StructureModelPrimitiveType;
      primitiveType7 = new StructureModelPrimitiveType();
      primitiveType7.dataType = "http://www.w3.org/2001/XMLSchema#anyURI";
      primitiveType7.example = null;
      primitiveType7.regex = null;

      var primitiveType8 : StructureModelPrimitiveType;
      primitiveType8 = new StructureModelPrimitiveType();
      primitiveType8.dataType = "http://www.w3.org/2001/XMLSchema#string";
      primitiveType8.example = null;
      primitiveType8.regex = null;
  
      var property1 : StructureModelProperty;
      property1 = new StructureModelProperty();
      property1.cardinalityMax = 1;
      property1.cardinalityMin = 1;
      property1.cimIri = "https://example.com/vek";
      property1.dataTypes = [primitiveType1];
      property1.dematerialize = false;
      property1.humanDescription = {["cs"]: "Vek"};
      property1.humanLabel = {["cs"]: "vek"};
      property1.isReverse = false;
      property1.pimIri = "https://example.com/mojePimIri";
      property1.psmIri = "https://example.com/mojePsmIri";
      property1.technicalLabel = "vek-popisek";

      var property2 : StructureModelProperty;
      property2 = new StructureModelProperty();
      property2.cardinalityMax = 1;
      property2.cardinalityMin = 1;
      property2.cimIri = "https://example.com/student";
      property2.dataTypes = [primitiveType2];
      property2.dematerialize = false;
      property2.humanDescription = {["cs"]: "Studujici"};
      property2.humanLabel = {["cs"]: "studujici"};
      property2.isReverse = false;
      property2.pimIri = "https://example.com/mojePimIri";
      property2.psmIri = "https://example.com/mojePsmIri";
      property2.technicalLabel = "studujici-popisek";

      var property3 : StructureModelProperty;
      property3 = new StructureModelProperty();
      property3.cardinalityMax = 3;
      property3.cardinalityMin = 1;
      property3.cimIri = "https://example.com/hodnoceni";
      property3.dataTypes = [primitiveType3];
      property3.dematerialize = false;
      property3.humanDescription = {["cs"]: "Hodnoceni"};
      property3.humanLabel = {["cs"]: "hodnoceni"};
      property3.isReverse = false;
      property3.pimIri = "https://example.com/mojePimIri";
      property3.psmIri = "https://example.com/mojePsmIri";
      property3.technicalLabel = "hodnoceni-popisek";

      var property4 : StructureModelProperty;
      property4 = new StructureModelProperty();
      property4.cardinalityMax = 1;
      property4.cardinalityMin = 1;
      property4.cimIri = "https://example.com/datum_nastupu";
      property4.dataTypes = [primitiveType4];
      property4.dematerialize = false;
      property4.humanDescription = {["cs"]: "Datum nástupu"};
      property4.humanLabel = {["cs"]: "Nástup"};
      property4.isReverse = false;
      property4.pimIri = "https://example.com/mojePimIri";
      property4.psmIri = "https://example.com/mojePsmIri";
      property4.technicalLabel = "darum-popisek";

      var property5 : StructureModelProperty;
      property5 = new StructureModelProperty();
      property5.cardinalityMax = 1;
      property5.cardinalityMin = 1;
      property5.cimIri = "https://example.com/zacatek_vyuky";
      property5.dataTypes = [primitiveType5];
      property5.dematerialize = false;
      property5.humanDescription = {["cs"]: "Začátek výuky (hod)"};
      property5.humanLabel = {["cs"]: "Počáteční hodina výuky"};
      property5.isReverse = false;
      property5.pimIri = "https://example.com/mojePimIri";
      property5.psmIri = "https://example.com/mojePsmIri";
      property5.technicalLabel = "cas-popisek";

      var property6 : StructureModelProperty;
      property6 = new StructureModelProperty();
      property6.cardinalityMax = 1;
      property6.cardinalityMin = 1;
      property6.cimIri = "https://example.com/cas_zalozeni";
      property6.dataTypes = [primitiveType6];
      property6.dematerialize = false;
      property6.humanDescription = {["cs"]: "časová známka založení účtu"};
      property6.humanLabel = {["cs"]: "Datum a čas založení účtu"};
      property6.isReverse = false;
      property6.pimIri = "https://example.com/mojePimIri";
      property6.psmIri = "https://example.com/mojePsmIri";
      property6.technicalLabel = "casova-znacka-popisek";

      var property7 : StructureModelProperty;
      property7 = new StructureModelProperty();
      property7.cardinalityMax = 1;
      property7.cardinalityMin = 0;
      property7.cimIri = "https://example.com/profil_studenta";
      property7.dataTypes = [primitiveType7];
      property7.dematerialize = false;
      property7.humanDescription = {["cs"]: "Odkaz na profil studenta"};
      property7.humanLabel = {["cs"]: "Profil studenta"};
      property7.isReverse = false;
      property7.pimIri = "https://example.com/mojePimIri";
      property7.psmIri = "https://example.com/mojePsmIri";
      property7.technicalLabel = "profil-popisek";

      var property8 : StructureModelProperty;
      property8 = new StructureModelProperty();
      property8.cardinalityMin = 1;
      property8.cimIri = "https://example.com/slovni_hodnoceni";
      property8.dataTypes = [primitiveType8];
      property8.dematerialize = false;
      property8.humanDescription = {["cs"]: "Poznámky k hodnocení studenta"};
      property8.humanLabel = {["cs"]: "Slovní hodnocení"};
      property8.isReverse = false;
      property8.pimIri = "https://example.com/mojePimIri";
      property8.psmIri = "https://example.com/mojePsmIri";
      property8.technicalLabel = "slovni-popisek";
     
      
  
  
      var class1 : StructureModelClass;
      class1 = new StructureModelClass();
      class1.cimIri = "https://example.com/class1/mojeCimIri";
      class1.codelistUrl = ["https://example.com/class1/codelistIri"];
      class1.example = null;
      //class1.extends = null;
      class1.humanDescription = {["cs"]: "Class 1 Popisek 1"};
      class1.humanLabel = {["cs"]: "Class 1 Label 1"};
      class1.pimIri = "https://example.com/class1/mojePimIri";
      class1.properties = [property1, property2, property3, property4, property5, property6, property7, property8];
      class1.psmIri = "https://example.com/class1/mojePsmIri";
      class1.regex = null;
      class1.specification = null;
      class1.structureSchema = null;
      class1.technicalLabel = "Technický popisek class 1";
  
      var root1 : StructureModelSchemaRoot;
      root1 = new StructureModelSchemaRoot();
      root1.classes = [class1];
  
      model.roots = [root1];
  
    return model;
  }
}

export default AllPrimitiveTypesModelCreator;