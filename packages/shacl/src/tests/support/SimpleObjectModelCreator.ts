import {
    StructureModel,
    StructureModelClass,
    StructureModelComplexType,
    StructureModelProperty,
    StructureModelPrimitiveType,
    StructureModelSchemaRoot,
  } from "@dataspecer/core/structure-model/model";
  import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
  import { DataSpecificationArtefact } from "@dataspecer/core/data-specification/model";
  import ModelCreator from "./ModelCreatorInterface";

class SimpleObjectModelCreator implements ModelCreator{

  createModel(): StructureModel{
    var model = new StructureModel();
  
      var zipType : StructureModelPrimitiveType;
      zipType = new StructureModelPrimitiveType();
      zipType.dataType = "http://www.w3.org/2001/XMLSchema#integer";
      zipType.example = null;
      zipType.regex = "^\d{3}(?:[-\s]\d{2}){1}$";

      var primitiveType1 : StructureModelPrimitiveType;
      primitiveType1 = new StructureModelPrimitiveType();
      primitiveType1.dataType = "http://www.w3.org/2001/XMLSchema#integer";
      primitiveType1.example = null;
      primitiveType1.regex = null;

      var primitiveType8 : StructureModelPrimitiveType;
      primitiveType8 = new StructureModelPrimitiveType();
      primitiveType8.dataType = "http://www.w3.org/2001/XMLSchema#string";
      primitiveType8.example = null;
      primitiveType8.regex = null;

      var street : StructureModelProperty;
      street = new StructureModelProperty();
      street.cardinalityMax = 1;
      street.cimIri = "https://example.com/Ulice";
      street.dataTypes = [primitiveType8];
      street.dematerialize = false;
      street.humanDescription = {["cs"]: "Ulice bydliště"};
      street.humanLabel = {["cs"]: "ulice"};
      street.isReverse = false;
      street.pimIri = "https://example.com/mojePimIriUlice";
      street.psmIri = "https://example.com/mojePsmIriUlice";
      street.technicalLabel = "ulice-popisek";

      var bn : StructureModelProperty;
      bn = new StructureModelProperty();
      bn.cardinalityMax = 1;
      bn.cardinalityMin = 1;
      bn.cimIri = "https://example.com/CisloPopisne";
      bn.dataTypes = [primitiveType1];
      bn.dematerialize = false;
      bn.humanDescription = {["cs"]: "Číslo popisné dané budovy"};
      bn.humanLabel = {["cs"]: "Číslo popisné"};
      bn.isReverse = false;
      bn.pimIri = "https://example.com/mojePimIriCisloPopisne";
      bn.psmIri = "https://example.com/mojePsmIriCisloPopisne";
      bn.technicalLabel = "cislo-popisne-popisek";

      var city : StructureModelProperty;
      city = new StructureModelProperty();
      city.cardinalityMax = 1;
      city.cardinalityMin = 1;
      city.cimIri = "https://example.com/Mesto";
      city.dataTypes = [primitiveType8];
      city.dematerialize = false;
      city.humanDescription = {["cs"]: "Město, ve kterém se nachází budova"};
      city.humanLabel = {["cs"]: "Město"};
      city.isReverse = false;
      city.pimIri = "https://example.com/mojePimIriMesto";
      city.psmIri = "https://example.com/mojePsmIriMesto";
      city.technicalLabel = "mesto-popisek";

      var zipcode : StructureModelProperty;
      zipcode = new StructureModelProperty();
      zipcode.cardinalityMax = 1;
      zipcode.cardinalityMin = 1;
      zipcode.cimIri = "https://example.com/PSC";
      zipcode.dataTypes = [zipType];
      zipcode.dematerialize = false;
      zipcode.humanDescription = {["cs"]: "Poštovní směrovací číslo"};
      zipcode.humanLabel = {["cs"]: "PSČ"};
      zipcode.isReverse = false;
      zipcode.pimIri = "https://example.com/mojePimIriPSC";
      zipcode.psmIri = "https://example.com/mojePsmIriPSC";
      zipcode.technicalLabel = "psc-popisek";

      var country : StructureModelProperty;
      country = new StructureModelProperty();
      country.cardinalityMax = 1;
      country.cardinalityMin = 1;
      country.cimIri = "https://example.com/Stat";
      country.dataTypes = [primitiveType8];
      country.dematerialize = false;
      country.humanDescription = {["cs"]: "Stát - země, ve které se objekt nachází"};
      country.humanLabel = {["cs"]: "Stát"};
      country.isReverse = false;
      country.pimIri = "https://example.com/mojePimIriStat";
      country.psmIri = "https://example.com/mojePsmIriStat";
      country.technicalLabel = "stat-popisek";

      var class2 : StructureModelClass;
      class2 = new StructureModelClass();
      class2.cimIri = "https://example.com/class2/adresa";
      class2.codelistUrl = ["https://example.com/class1/codelistIri"];
      class2.example = null;
      class2.humanDescription = {["cs"]: "Adresa bydliště dané osoby"};
      class2.humanLabel = {["cs"]: "Adresa", ["pl"]: "Adres"};
      class2.pimIri = "https://example.com/class1/mojePimIriadresa";
      class2.properties = [street, bn, city, zipcode, country];
      class2.psmIri = "https://example.com/class1/mojePsmIriadresa";
      class2.regex = null;
      class2.specification = null;
      class2.structureSchema = null;
      class2.technicalLabel = "adresa";

      var classLink : StructureModelClass;
      classLink = new StructureModelClass();
      classLink.cimIri = "https://example.com/class2/link";
      classLink.codelistUrl = ["https://example.com/class1/codelistIri"];
      classLink.example = null;
      classLink.humanDescription = {["cs"]: "Link na entitu"};
      classLink.humanLabel = {["cs"]: "Link"};
      classLink.pimIri = "https://example.com/class1/mojePimIriadresa";
      classLink.properties = [];
      classLink.psmIri = "https://example.com/class1/mojePsmIriadresa";
      classLink.regex = null;
      classLink.specification = null;
      classLink.structureSchema = null;
      classLink.technicalLabel = "link";

      var complexType1 : StructureModelComplexType;
      complexType1 = new StructureModelComplexType();
      complexType1.dataType = class2;

      var complexType2 : StructureModelComplexType;
      complexType2 = new StructureModelComplexType();
      complexType2.dataType = classLink;

      var property1 : StructureModelProperty;
      property1 = new StructureModelProperty();
      property1.cardinalityMax = 1;
      property1.cardinalityMin = 1;
      property1.cimIri = "https://example.com/Adresa";
      property1.dataTypes = [complexType1];
      property1.dematerialize = false;
      property1.humanDescription = {["cs"]: "Adresa bydliště dané osoby"};
      property1.humanLabel = {["cs"]: "Adresa"};
      property1.isReverse = false;
      property1.pimIri = "https://example.com/mojePimIriadresa";
      property1.psmIri = "https://example.com/mojePsmIriadresa";
      property1.technicalLabel = "adresa-popisek";

      var propertyLink : StructureModelProperty;
      propertyLink = new StructureModelProperty();
      propertyLink.cardinalityMax = 2;
      propertyLink.cardinalityMin = 1;
      propertyLink.cimIri = "https://example.com/Link";
      propertyLink.dataTypes = [complexType2];
      propertyLink.dematerialize = false;
      propertyLink.humanDescription = {["cs"]: "Link na entitu"};
      propertyLink.humanLabel = {["cs"]: "Link"};
      propertyLink.isReverse = false;
      propertyLink.pimIri = "https://example.com/mojePimIriadresa";
      propertyLink.psmIri = "https://example.com/mojePsmIriadresa";
      propertyLink.technicalLabel = "link-popisek";

      var class1 : StructureModelClass;
      class1 = new StructureModelClass();
      class1.cimIri = "https://example.com/class1/mojeCimIri";
      class1.codelistUrl = ["https://example.com/class1/codelistIri"];
      class1.example = null;
      //class1.extends = null;
      class1.humanDescription = {["cs"]: "Class 1 Popisek 1"};
      class1.humanLabel = {["cs"]: "Class 1 Label 1"};
      class1.pimIri = "https://example.com/class1/mojePimIri";
      class1.properties = [property1, propertyLink];
      class1.psmIri = "https://example.com/class1/mojePsmIri";
      class1.regex = null;
      class1.specification = null;
      class1.structureSchema = null;
      class1.technicalLabel = "osoba";
      class1.instancesSpecifyTypes = "ALWAYS";
  
      var root1 : StructureModelSchemaRoot;
      root1 = new StructureModelSchemaRoot();
      root1.classes = [class1];
  
      model.roots = [root1];
      model.psmIri = "https://example.com/class1/mojePsmIri";
      
  
    return model;
  }
}

export default SimpleObjectModelCreator;