# XML Schema generator

This directory contains the source codes used by generator of [XML Schema 1.1](https://www.w3.org/TR/xmlschema11-1/).

The generation process consists of two steps. In the first step, a simplified representation of the XML Schema model is produced from a structure model, and this representation is used in the second step to write out an XML Schema document.

The simplified model is described in `xml-schema-model.ts`, starting from the `XmlSchema` class.

## XML Schema adapter

The class `XmlSchemaAdapter`, located in `xml-schema-model-adapter.ts`, is used by the generator to convert a structure model to the XML Schema model.

The conversion starts in `fromRoots`, which recursively traverses the whole model, starting from its roots, which are converted to instances of `XmlSchemaElement`. As a side effect, named groups (`XmlSchemaGroupDefinition`) and types (`XmlSchemaType`) may be defined during the process.

The function `classToElement` converts a class into an element definition (`XmlSchemaElement`). This only happens for root elements, because classes are normally not identified via their name in the XML. Instead, classes are mainly converted in `classToComplexType`.

The function `classToComplexType` produces a complex type definition (as `XmlSchemaComplexItem`) from a class. If the class is imported, this is an `XmlSchemaComplexGroup` using its XML name, and an import of the target schema is added. Otherwise, the content of the type is created by `propertyToComplexContent`, called for each of the property of the class, producing `XmlSchemaComplexContent` from `propertyToElement`.

The `propertyToElement` function is used to produce an `XmlSchemaElement` from a property. The concrete representation of the property's type is decided in `propertyToElementCheckType`, which checks if all the property's datatypes match a particular condition (attribute or association) and then selects the appropriate conversion function.

An attribute is mapped to an `XmlSchemaSimpleType` in `datatypePropertyToType`. This type is just a union of all the datatypes.

An association is mapped to an `XmlSchemaComplexType` in `classPropertyToType` and `classPropertyToComplexDefinition`. This calls `classToComplexType` again, but if there are multiple classes in the range of a property, the produced types are defined as extensions of a single type, used as the primary type of the property's element. If the property is dematerialized, only its type's content (such as `<xs:sequence>`) is used in the place of its element.

Settings may be given to the adapter in form of `XmlSchemaAdapterOptions`. This class configures whether named groups and types may be extracted from classes, specifiable separately for the root class and for other classes. This affects the corresponding XML Schema's structure, matching a specific design pattern.

It is necessary to set `rootClass.extractGroup` to `true` if the schema is to be reused.

## XML Schema writer

The writer, located in `xml-schema-writer.ts`, translates the contents of an `XmlSchema` instance into calls of the corresponding methods of `XmlWriter`, separated into `writeSchemaBegin`, `writeImportsAndDefinitions`, `writeTypes`, `writeGroups`, `writeElements`, and `writeSchemaEnd`, writing the respective parts of the schema.

The writer usually produces the corresponding XSD elements exactly as stated in the model, but there could be differences. For example, a named `<xs:complexType>` or `<xs:simpleType>` is not allowed in any other place than the top level. For that reason, when such a type is used inside an `<xs:element>`, only its name is used in the `name` attribute, and the definition is ignored.
