---
title: "Generators"
description: "Descriptions of supported generators."
lead: "Descriptions of supported generators."
menu:
  docs:
    parent: "tutorial"
weight: 60
toc: true
---

## XML Schema

The generator for [XML Schema Definition Language 1.1](https://www.w3.org/TR/xmlschema11-1/) creates documents in XSD describing the XML data format. The schema consists of a root element with the name of the root class, containing an element for every property of the class, and the properties of their classes, recursively.

There are 4 options that can be set when generating XSD, controlling the structure of the schema and the usage of various design patterns:
{{% tutorial-image "images/tutorial/xml-specific/xsd-configuration.png" %}}

Enabling "Extract type" makes the generator produce named `<xs:complexType>` elements from classes at the top level, resulting in the Venetian Blind pattern, while disabling it places the `<xs:complexType>` elements inside the property elements that use them, corresponding to the Russian Doll pattern.

Enabling "Extract group" does a similar thing, but produces named `<xs:group>` elements from classes, containing the sequence of elements for their properties.

These two settings can be configured separately for the root class and for the other classes. This separation is useful when the schema is reused in other specifications, because the root class is identified via its group's name. In that case, it is necessary to turn group extraction for the root class on.

### Example XSD
```xml
<!-- Without extracted types or groups, in the Russian Doll pattern. -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" version="1.1" elementFormDefault="unqualified" xmlns:c="https://schemas.dataspecer.com/xsd/" xmlns:sawsdl="http://www.w3.org/ns/sawsdl">
  <xs:import namespace="https://schemas.dataspecer.com/xsd/core/" schemaLocation="https://schemas.dataspecer.com/xsd/core/2022.xsd"/>
  <xs:element name="contact">
    <xs:complexType sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/kontakt">
      <xs:annotation>
        <xs:documentation>Význam: https://slovník.gov.cz/generický/kontakty/pojem/kontakt
Název (cs): Kontakt
Název (en): Contact
Popis (cs): Kontaktní údaje, např. na člověka, společnost, apod.</xs:documentation>
      </xs:annotation>
      <xs:sequence>
        <xs:element minOccurs="0" ref="c:iri"/>
        <xs:element minOccurs="0" name="e-mail" type="xs:string" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu">
          <xs:annotation>
            <xs:documentation>Význam: https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu
Název (cs): má E-mailovou adresu
Název (en): e-mail
Popis (cs): Kontaktní e-mailová adresa.</xs:documentation>
          </xs:annotation>
        </xs:element>
        <xs:element minOccurs="0" name="url" type="xs:anyURI" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-url">
          <xs:annotation>
            <xs:documentation>Význam: https://slovník.gov.cz/generický/kontakty/pojem/má-url
Název (cs): má URL
Název (en): URL
Popis (cs): Webová kontaktní adresa: webová stránka či WebID.</xs:documentation>
          </xs:annotation>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>

<!-- With type extraction turned on, in the Venetian Blind pattern. -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" version="1.1" elementFormDefault="unqualified" xmlns:c="https://schemas.dataspecer.com/xsd/core/" xmlns:sawsdl="http://www.w3.org/ns/sawsdl">
  <xs:import namespace="https://schemas.dataspecer.com/xsd/core/" schemaLocation="https://schemas.dataspecer.com/xsd/core/2022.xsd"/>
  <xs:complexType name="contact" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/kontakt">
    <xs:annotation><!-- ... --></xs:annotation>
    <xs:sequence>
      <xs:element minOccurs="0" ref="c:iri"/>
      <xs:element minOccurs="0" name="e-mail" type="xs:string" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu">
        <xs:annotation><!-- ... --></xs:annotation>
      </xs:element>
      <xs:element minOccurs="0" name="url" type="xs:anyURI" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-url">
        <xs:annotation><!-- ... --></xs:annotation>
      </xs:element>
    </xs:sequence>
  </xs:complexType>
  <xs:element name="contact" type="contact"/>
</xs:schema>

<!-- With group extraction turned on. -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" version="1.1" elementFormDefault="unqualified" xmlns:c="https://schemas.dataspecer.com/xsd/core/" xmlns:sawsdl="http://www.w3.org/ns/sawsdl">
  <xs:import namespace="https://schemas.dataspecer.com/xsd/core/" schemaLocation="https://schemas.dataspecer.com/xsd/core/2022.xsd"/>
  <xs:group name="contact">
    <xs:sequence>
      <xs:element minOccurs="0" name="e-mail" type="xs:string" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu">
        <xs:annotation><!-- ... --></xs:annotation>
      </xs:element>
      <xs:element minOccurs="0" name="url" type="xs:anyURI" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-url">
        <xs:annotation><!-- ... --></xs:annotation>
      </xs:element>
    </xs:sequence>
  </xs:group>
  <xs:element name="contact">
    <xs:complexType sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/kontakt">
      <xs:annotation><!-- ... --></xs:annotation>
      <xs:sequence>
        <xs:element minOccurs="0" ref="c:iri"/>
        <xs:group ref="contact"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>

<!-- With both turned on. -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" version="1.1" elementFormDefault="unqualified" xmlns:c="https://schemas.dataspecer.com/xsd/core/" xmlns:sawsdl="http://www.w3.org/ns/sawsdl">
  <xs:import namespace="https://schemas.dataspecer.com/xsd/core/" schemaLocation="https://schemas.dataspecer.com/xsd/core/2022.xsd"/>
  <xs:complexType name="contact" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/kontakt">
    <xs:annotation><!-- ... --></xs:annotation>
    <xs:sequence>
      <xs:element minOccurs="0" ref="c:iri"/>
      <xs:group ref="contact"/>
    </xs:sequence>
  </xs:complexType>
  <xs:group name="contact">
    <xs:sequence>
      <xs:element minOccurs="0" name="e-mail" type="xs:string" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu">
        <xs:annotation><!-- ... --></xs:annotation>
      </xs:element>
      <xs:element minOccurs="0" name="url" type="xs:anyURI" sawsdl:modelReference="https://slovník.gov.cz/generický/kontakty/pojem/má-url">
        <xs:annotation><!-- ... --></xs:annotation>
      </xs:element>
    </xs:sequence>
  </xs:group>
  <xs:element name="contact" type="contact"/>
</xs:schema>
```

## XSL Transformations

The generators for [Extensible Stylesheet Language Transformations 2.0](https://www.w3.org/TR/xslt20/) are intended for transforming XML documents matching the generated XSD to and from RDF.

### Lifting

The XSLT lifting generator produces transformations that turn XML into RDF/XML, using the interpretations of classes and properties defined in the schema.

#### Example lifting XSLT
```xml
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0" xmlns:c="https://schemas.dataspecer.com/xsd/core/" xmlns:ns0="https://slovník.gov.cz/generický/kontakty/pojem/">
  <xsl:output method="xml" version="1.0" encoding="utf-8" media-type="application/rdf+xml" indent="yes"/>
  <xsl:template match="/contact">
    <rdf:RDF>
      <xsl:variable name="result">
        <xsl:sequence>
          <xsl:call-template name="_https_003a_002f_002fofn.gov.cz_002fclass_002f1656410821917-d6ef-094c-8b48"/>
        </xsl:sequence>
      </xsl:variable>
      <xsl:for-each select="$result">
        <xsl:copy>
          <xsl:call-template name="remove-top"/>
        </xsl:copy>
      </xsl:for-each>
      <xsl:for-each select="$result//top-level/node()">
        <xsl:copy>
          <xsl:call-template name="remove-top"/>
        </xsl:copy>
      </xsl:for-each>
    </rdf:RDF>
  </xsl:template>
  <xsl:template match="@xml:lang">
    <xsl:copy-of select="."/>
  </xsl:template>
  <xsl:template name="remove-top">
    <xsl:for-each select="@*">
      <xsl:copy/>
    </xsl:for-each>
    <xsl:for-each select="node()[not(. instance of element(top-level))]">
      <xsl:copy>
        <xsl:call-template name="remove-top"/>
      </xsl:copy>
    </xsl:for-each>
  </xsl:template>
  <xsl:template name="_https_003a_002f_002fofn.gov.cz_002fclass_002f1656410821917-d6ef-094c-8b48">
    <xsl:param name="arc" select="()"/>
    <xsl:param name="no_iri" select="false()"/>
    <rdf:Description>
      <xsl:apply-templates select="@*"/>
      <xsl:variable name="id">
        <id>
          <xsl:choose>
            <xsl:when test="c:iri and not($no_iri)">
              <xsl:attribute name="rdf:about">
                <xsl:value-of select="c:iri"/>
              </xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="rdf:nodeID">
                <xsl:value-of select="generate-id()"/>
              </xsl:attribute>
            </xsl:otherwise>
          </xsl:choose>
        </id>
      </xsl:variable>
      <xsl:copy-of select="$id//@*"/>
      <rdf:type rdf:resource="https://slovník.gov.cz/generický/kontakty/pojem/kontakt"/>
      <xsl:copy-of select="$arc"/>
      <xsl:for-each select="e-mail">
        <ns0:má-e-mailovou-adresu rdf:datatype="http://www.w3.org/2001/XMLSchema#string">
          <xsl:apply-templates select="@*"/>
          <xsl:value-of select="."/>
        </ns0:má-e-mailovou-adresu>
      </xsl:for-each>
      <xsl:for-each select="url">
        <ns0:má-url rdf:datatype="http://www.w3.org/2001/XMLSchema#anyURI">
          <xsl:apply-templates select="@*"/>
          <xsl:value-of select="."/>
        </ns0:má-url>
      </xsl:for-each>
    </rdf:Description>
  </xsl:template>
  <xsl:template match="@*|*"/>
</xsl:stylesheet>
```

### Lowering

The XSLT lowering generator produces transformations from [SPARQL Query Results XML Format](https://www.w3.org/TR/rdf-sparql-XMLres/) to XML. Input compatible with such a transformation can be obtained by executing the query `SELECT ?s ?p ?o WHERE { ?s ?p ?o . }` on any SPARQL endpoint providing access to the relevant RDF data. The created transformation also exposes 3 parameters, `$subj`, `$pred`, and `$obj`, which can be set if other variable names than `?s ?p ?o` are used.

#### Example lowering XSLT
```xml
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sp="http://www.w3.org/2005/sparql-results#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0" xmlns:c="https://schemas.dataspecer.com/xsd/core/">
  <xsl:output method="xml" version="1.0" encoding="utf-8" indent="yes"/>
  <xsl:param name="subj" select="'s'"/>
  <xsl:param name="pred" select="'p'"/>
  <xsl:param name="obj" select="'o'"/>
  <xsl:variable name="type" select="'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'"/>
  <xsl:function name="c:id-key">
    <xsl:param name="node"/>
    <xsl:value-of select="concat(namespace-uri($node),'|',local-name($node),'|',string($node))"/>
  </xsl:function>
  <xsl:template match="/sp:sparql">
    <xsl:apply-templates select="sp:results/sp:result"/>
  </xsl:template>
  <xsl:template match="sp:result[sp:binding[@name=$pred]/sp:uri/text()=$type and sp:binding[@name=$obj]/sp:uri/text()=&#34;https://slovník.gov.cz/generický/kontakty/pojem/kontakt&#34;]">
    <contact>
      <xsl:call-template name="_https_003a_002f_002fofn.gov.cz_002fclass_002f1656410821917-d6ef-094c-8b48">
        <xsl:with-param name="id">
          <xsl:copy-of select="sp:binding[@name=$subj]/*"/>
        </xsl:with-param>
      </xsl:call-template>
    </contact>
  </xsl:template>
  <xsl:template match="@xml:lang">
    <xsl:copy-of select="."/>
  </xsl:template>
  <xsl:template match="sp:literal">
    <xsl:apply-templates select="@*"/>
    <xsl:value-of select="."/>
  </xsl:template>
  <xsl:template match="sp:uri">
    <xsl:value-of select="."/>
  </xsl:template>
  <xsl:template name="_https_003a_002f_002fofn.gov.cz_002fclass_002f1656410821917-d6ef-094c-8b48">
    <xsl:param name="id"/>
    <xsl:param name="type_name" select="()"/>
    <xsl:param name="no_iri" select="false()"/>
    <xsl:if test="not(empty($type_name))">
      <xsl:attribute name="xsi:type">
        <xsl:value-of select="$type_name"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="not($no_iri)">
      <xsl:for-each select="$id/sp:uri">
        <c:iri>
          <xsl:value-of select="."/>
        </c:iri>
      </xsl:for-each>
    </xsl:if>
    <xsl:variable name="id_test">
      <xsl:value-of select="c:id-key($id/*)"/>
    </xsl:variable>
    <xsl:for-each select="//sp:result[sp:binding[@name=$subj]/*[$id_test = c:id-key(.)] and sp:binding[@name=$pred]/sp:uri/text()=&#34;https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu&#34;]">
      <e-mail>
        <xsl:apply-templates select="sp:binding[@name=$obj]/sp:literal"/>
      </e-mail>
    </xsl:for-each>
    <xsl:for-each select="//sp:result[sp:binding[@name=$subj]/*[$id_test = c:id-key(.)] and sp:binding[@name=$pred]/sp:uri/text()=&#34;https://slovník.gov.cz/generický/kontakty/pojem/má-url&#34;]">
      <url>
        <xsl:apply-templates select="sp:binding[@name=$obj]/sp:literal"/>
      </url>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="@*|*"/>
</xsl:stylesheet>
```

## SPARQL

The SPARQL generator produces a `CONSTRUCT` [query](https://www.w3.org/TR/sparql11-query/) matching RDF resources conforming to the specification. In other words, it only selects the specific triples found in the graph which are relevant to the specification, i.e. they describe instances of classes used in the specification, and they have properties required by the model.

### Example SPARQL
```sparql
PREFIX ns0: <https://slovník.gov.cz/generický/kontakty/pojem/>
CONSTRUCT {
  ?v0 a ns0:kontakt .
  ?v0 ns0:má-e-mailovou-adresu ?v1 .
  ?v0 ns0:má-url ?v2 .
}
WHERE {
  ?v0 a ns0:kontakt .
  OPTIONAL {
    ?v0 ns0:má-e-mailovou-adresu ?v1 .
  }
  OPTIONAL {
    ?v0 ns0:má-url ?v2 .
  }
}
```

## CSV Schema

The generator creates a description of a data structure according to the [CSV on the Web](https://www.w3.org/TR/2016/NOTE-tabular-data-primer-20160225/) standards and recommendations. The result is a tabular schema with metadata about the table in the JSON-LD format. There is always only one file. The file describes tables, and the tables contain individual columns. The columns generally correspond to the attributes and associations.

There is one CSV option in the configuration. The option enables or disables the multiple table schema. It basically switches between the single table schema and the multiple table schema.

{{% tutorial-image "images/tutorial/csv-specific/csv-configuration.png" %}}

The single table schema contains only one table. The columns may have special compound names. If a data structure has nested attributes or associations, the names create an illusion of depth in a flat table. The names represent the path from the root to the final attribute or association.

The multiple table schema may contain multiple tables, but it may also contain only one table. It depends on the corresponding data structure. The tables logically separate a nested data structure into different tables. The tables are linked together with foreign keys. Names of columns are simple.

### CSV Examples

There is a small data structure as an example.

{{% tutorial-image "images/tutorial/csv-specific/csv-example.png" %}}

There is a single table schema of the data structure.

```json
{
  "@context": [
    "http://www.w3.org/ns/csvw",
    {
      "@language": "cs"
    }
  ],
  "@id": "https://ofn.gov.cz/schema/1677509987003-7c8b-43b7-a68b/table.csv-metadata.json",
  "@type": "Table",
  "url": "table.csv",
  "tableSchema": {
    "@type": "Schema",
    "columns": [
      {
        "@type": "Column",
        "name": "kontakt_e-mail",
        "titles": "kontakt_e-mail",
        "dc:title": [
          {
            "@value": "má E-mailovou adresu",
            "@language": "cs"
          },
          {
            "@value": "e-mail",
            "@language": "en"
          }
        ],
        "dc:description": {
          "@value": "Kontaktní e-mailová adresa.",
          "@language": "cs"
        },
        "propertyUrl": "https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu",
        "required": true
      },
      {
        "@type": "Column",
        "name": "kontakt_url",
        "titles": "kontakt_url",
        "dc:title": [
          {
            "@value": "má URL",
            "@language": "cs"
          },
          {
            "@value": "URL",
            "@language": "en"
          }
        ],
        "dc:description": {
          "@value": "Webová kontaktní adresa: webová stránka či WebID.",
          "@language": "cs"
        },
        "propertyUrl": "https://slovník.gov.cz/generický/kontakty/pojem/má-url"
      },
      {
        "@type": "Column",
        "propertyUrl": "rdf:type",
        "valueUrl": "https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl",
        "virtual": true
      }
    ]
  }
}
```

There is a multiple table schema of the data structure.

```json
{
  "@context": [
    "http://www.w3.org/ns/csvw",
    {
      "@language": "cs"
    }
  ],
  "@id": "https://ofn.gov.cz/schema/1677509987003-7c8b-43b7-a68b/csv-metadata.json",
  "@type": "TableGroup",
  "tables": [
    {
      "@type": "Table",
      "url": "table-1.csv",
      "tableSchema": {
        "@type": "Schema",
        "columns": [
          {
            "@type": "Column",
            "name": "RowId",
            "titles": "RowId",
            "datatype": "string",
            "required": true,
            "suppressOutput": true
          },
          {
            "@type": "Column",
            "name": "kontakt",
            "titles": "kontakt",
            "dc:title": {
              "@value": "kontakt",
              "@language": "cs"
            },
            "propertyUrl": "https://slovník.gov.cz/datový/turistické-cíle/pojem/kontakt",
            "datatype": "string",
            "required": true
          },
          {
            "@type": "Column",
            "propertyUrl": "rdf:type",
            "valueUrl": "https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl",
            "virtual": true
          }
        ],
        "primaryKey": "RowId",
        "foreignKeys": [
          {
            "columnReference": "kontakt",
            "reference": {
              "resource": "table-2.csv",
              "columnReference": "RowId"
            }
          }
        ],
        "aboutUrl": "{#RowId}"
      }
    },
    {
      "@type": "Table",
      "url": "table-2.csv",
      "tableSchema": {
        "@type": "Schema",
        "columns": [
          {
            "@type": "Column",
            "name": "RowId",
            "titles": "RowId",
            "datatype": "string",
            "required": true,
            "suppressOutput": true
          },
          {
            "@type": "Column",
            "name": "url",
            "titles": "url",
            "dc:title": [
              {
                "@value": "má URL",
                "@language": "cs"
              },
              {
                "@value": "URL",
                "@language": "en"
              }
            ],
            "dc:description": {
              "@value": "Webová kontaktní adresa: webová stránka či WebID.",
              "@language": "cs"
            },
            "propertyUrl": "https://slovník.gov.cz/generický/kontakty/pojem/má-url"
          },
          {
            "@type": "Column",
            "propertyUrl": "rdf:type",
            "valueUrl": "https://slovník.gov.cz/generický/kontakty/pojem/kontakt",
            "virtual": true
          }
        ],
        "primaryKey": "RowId",
        "aboutUrl": "{#RowId}"
      }
    },
    {
      "@type": "Table",
      "url": "table-3.csv",
      "tableSchema": {
        "@type": "Schema",
        "columns": [
          {
            "@type": "Column",
            "name": "Reference",
            "titles": "Reference",
            "datatype": "string",
            "required": true,
            "suppressOutput": true
          },
          {
            "@type": "Column",
            "name": "e-mail",
            "titles": "e-mail",
            "dc:title": [
              {
                "@value": "má E-mailovou adresu",
                "@language": "cs"
              },
              {
                "@value": "e-mail",
                "@language": "en"
              }
            ],
            "dc:description": {
              "@value": "Kontaktní e-mailová adresa.",
              "@language": "cs"
            },
            "propertyUrl": "https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu",
            "required": true
          }
        ],
        "primaryKey": [
          "Reference",
          "e-mail"
        ],
        "foreignKeys": [
          {
            "columnReference": "Reference",
            "reference": {
              "resource": "table-2.csv",
              "columnReference": "RowId"
            }
          }
        ],
        "aboutUrl": "{#Reference}"
      }
    }
  ]
}
```

## RDF to CSV Queries

This generator creates [SPARQL queries](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/) with a `SELECT` part. Each query corresponds to a data structure and a table because it has a purpose of transforming an RDF dataset into the CSV format. The `WHERE` part corresponds to a particular data structure, and the `SELECT` part corresponds to a particular table. The `PREFIXES` part only enhances readability. The queries share the configuration with the CSV schema. There are different queries for the single table schema and the multiple table schema. The option in the configuration can be used to switch between them. There is one query for each table. Each query is in an individual file.

### RDF to CSV Examples

We reuse the small data structure from the CSV examples.

There is a single table query.

```sparql
PREFIX ns1: <https://slovník.gov.cz/datový/turistické-cíle/pojem/>
PREFIX ns2: <https://slovník.gov.cz/generický/kontakty/pojem/>
SELECT (?v3 AS ?kontakt_e-mail) (?v4 AS ?kontakt_url)
WHERE {
  ?v1 a ns1:turistický-cíl .
  ?v2 a ns2:kontakt .
  ?v2 ns2:má-e-mailovou-adresu ?v3 .
  OPTIONAL {
    ?v2 ns2:má-url ?v4 .
  }
  ?v1 ns1:kontakt ?v2 .
}
```

There are multiple table queries.

```sparql
PREFIX ns1: <https://slovník.gov.cz/datový/turistické-cíle/pojem/>
PREFIX ns2: <https://slovník.gov.cz/generický/kontakty/pojem/>
SELECT (?v1 AS ?RowId) (?v2 AS ?kontakt) # Table: table-1.csv
WHERE {
  ?v1 a ns1:turistický-cíl .
  ?v2 a ns2:kontakt .
  ?v2 ns2:má-e-mailovou-adresu ?v3 .
  OPTIONAL {
    ?v2 ns2:má-url ?v4 .
  }
  ?v1 ns1:kontakt ?v2 .
}
```

```sparql
PREFIX ns1: <https://slovník.gov.cz/datový/turistické-cíle/pojem/>
PREFIX ns2: <https://slovník.gov.cz/generický/kontakty/pojem/>
SELECT (?v2 AS ?RowId) (?v4 AS ?url) # Table: table-2.csv
WHERE {
  ?v1 a ns1:turistický-cíl .
  ?v2 a ns2:kontakt .
  ?v2 ns2:má-e-mailovou-adresu ?v3 .
  OPTIONAL {
    ?v2 ns2:má-url ?v4 .
  }
  ?v1 ns1:kontakt ?v2 .
}
```

```sparql
PREFIX ns1: <https://slovník.gov.cz/datový/turistické-cíle/pojem/>
PREFIX ns2: <https://slovník.gov.cz/generický/kontakty/pojem/>
SELECT (?v2 AS ?Reference) (?v3 AS ?e-mail) # Table: table-3.csv
WHERE {
  ?v1 a ns1:turistický-cíl .
  ?v2 a ns2:kontakt .
  ?v2 ns2:má-e-mailovou-adresu ?v3 .
  OPTIONAL {
    ?v2 ns2:má-url ?v4 .
  }
  ?v1 ns1:kontakt ?v2 .
}
```
## SHACL
[SHACL](https://www.w3.org/TR/shacl/) is a language used for validating RDF data. To use SHACL validators, you have to have 2 inputs: SHACL Shape describing the data specification constraints and RDF data that you want validated. Dataspecer provides the user with generated SHACL Shape for the created data specification.

This tutorial on how to generate and use the SHACL artifacts generator is using this data specification as an example:

{{% tutorial-image "images/tutorial/shacl-shex-specific/example-data-specification.png" %}}

Example of generated SHACL Shape for the data specification shown above:
```turtle
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@base <https://myexample.com/>.

<d7528e03c25e75bf0abc589ed5545ad5turistický_cílShape> a sh:NodeShape;
    sh:targetClass <https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl>;
    sh:nodeKind sh:IRI;
    sh:description "Samostatný turistický cíl."@cs, "A separate tourist destination"@en;
    sh:name "Tourist destination"@en, "Turistický cíl"@cs.
<ad078e41eecf74b8c1e6a29a453cb1f2kapacitaShape> a sh:PropertyShape;
    sh:name "kapacita"@cs;
    sh:path <https://slovník.gov.cz/datový/sportoviště/pojem/kapacita>;
    sh:datatype <http://www.w3.org/2001/XMLSchema#integer>.
<d7528e03c25e75bf0abc589ed5545ad5turistický_cílShape> sh:property <ad078e41eecf74b8c1e6a29a453cb1f2kapacitaShape>.
<1403f7adf349b6faf375941eb2c23517kouření_povolenoShape> a sh:PropertyShape;
    sh:description "Determines whether it is possible to smoke tobacco products in the tourist destination."@en, "Určuje, zda je možné v turistickém cíli kouření tabákových výrobků."@cs;
    sh:name "smoking allowed"@en, "kouření povoleno"@cs;
    sh:maxCount 1;
    sh:path <https://slovník.gov.cz/datový/turistické-cíle/pojem/kouření-povoleno>;
    sh:datatype <http://www.w3.org/2001/XMLSchema#boolean>.
<d7528e03c25e75bf0abc589ed5545ad5turistický_cílShape> sh:property <1403f7adf349b6faf375941eb2c23517kouření_povolenoShape>.
<aa7de934a3ecd61f062989b47fe07237kontaktShape> a sh:PropertyShape;
    sh:name "kontakt"@cs;
    sh:minCount 1;
    sh:maxCount 1;
    sh:path <https://slovník.gov.cz/datový/turistické-cíle/pojem/kontakt>;
    sh:nodeKind sh:IRI.
<217547b71513ecc5b06d7da60879e65akontaktShape> a sh:NodeShape;
    sh:class <https://slovník.gov.cz/generický/kontakty/pojem/kontakt>;
    sh:nodeKind sh:IRI;
    sh:description "Kontaktní údaje, např. na člověka, společnost, apod."@cs;
    sh:name "Contact"@en, "Kontakt"@cs.
<5cea7c188264a85165deeb269967e2c6má_urlShape> a sh:PropertyShape;
    sh:description "Webová kontaktní adresa: webová stránka či WebID."@cs;
    sh:name "má URL"@cs, "URL"@en;
    sh:minCount 1;
    sh:path <https://slovník.gov.cz/generický/kontakty/pojem/má-url>;
    sh:datatype <http://www.w3.org/2001/XMLSchema#anyURI>.
<217547b71513ecc5b06d7da60879e65akontaktShape> sh:property <5cea7c188264a85165deeb269967e2c6má_urlShape>.
<aa7de934a3ecd61f062989b47fe07237kontaktShape> sh:node <217547b71513ecc5b06d7da60879e65akontaktShape>.
<d7528e03c25e75bf0abc589ed5545ad5turistický_cílShape> sh:property <aa7de934a3ecd61f062989b47fe07237kontaktShape>.
```

### Configuration settings

There is artifacts configuration option available to Dataspecer users. This picture highlights the settings that are relevant to SHACL:

{{% tutorial-image "images/tutorial/shacl-shex-specific/relevant-configuration-settings.png" %}}

The highlighted settings have an impact on how the SHACL Shape is generated or whether the Shape is generated at all in case of generating the artifact to a .zip file. This is a breakdown on how they impact the process:

1. Base URL - is used in prefixes and in generated Shape names. Generated shape names consist of the base URL + unique id for the given shape based on the internal Dataspecer representation and the technical label.
2. Class instance identification - Has 3 options: ALWAYS, OPTIONAL, NEVER.
   1. ALWAYS - will generate parts describing that the data node of this class is always an IRI.
   2. OPTIONAL - will generate parts describing that the data node of this class can be an IRI or Blank Node.
   3. NEVER - will generate parts describing that the data node of this class is always a Blank Node.
3. Explicit instance typing* -  Has 3 options: ALWAYS, OPTIONAL, NEVER.
   1. ALWAYS - will generate parts describing that the data node of this class always specifies its type = the Shape generates constraint checking the presence of the rdf:type in the data tied to this class.
   2. OPTIONAL - does not generate any constraints as it does not order any specific constraint to be fulfulled.
   3. NEVER - will generate parts describing that the data node of this class will never have a predicate rdf:type tied to the node representing this class. The Shape checks that the data does not contain rdf:type tied to this class data node.
4. Additional class properties - Has 2 options: ALLOWED, DISALLOWED.
   1. ALLOWED - The Shape does not prohibit any extra attributes to be present on the class other than those explicitly stated in the data specification.
   2. DISALLOWED - The shape prohibits any extra attributes to be tied to the class other than those explicitly stated in the data specification. For our example data specification that would mean, that if we wanted the "Turistický cíl" or "Kontakt" class to have any other attribute than "má URL" in the data, the Shape would validate data containing extra attributes as INVALID.
5. Generated artifacts (SHACL Shapes) - Has 2 options: Yes, No.
   1. Yes - When clicking on "Generate to .zip file" button, the data specifications in our working space will have SHACL, Shex and Shex Query Map artifacts generated.
   2. No - When clicking on "Generate to .zip file" button, the data specifications in our working space will not have SHACL, Shex and Shex Query Map artifacts generated in the .zip file.

\* Explicit instance typing has an impact on the ability to correctly generate the SHACL, ShEx and ShEx Query Map artifacts. More on how it impacts the generation process here:  [SHACL and ShEx targetting](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#data-nodes-targetting-with-shacl-and-shex) and how to fix the issue with generation here: [How to fix the generator failing](#how-to-fix-the-generator-failing)

### Generator failure

In certain situations described in [SHACL and ShEx targetting](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#data-nodes-targetting-with-shacl-and-shex), the artifact cannot be generated due to lack of data structure specifics. The aforementioned link also contains section [SHACL and ShEx targetting failure](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#targetting-failure-and-how-to-fix-it) on how to fix the data specification in order to allow the generator to generate the shape. 

### How to fix the generator failing
In summary, make sure, that your data specification meets at least one criterion: 
1. the root has unique data type in the whole data structure and the instance typing configuration is set to "ALWAYS" - in the example that would be "Turistický cíl" - OR 
2. the root has a unique attribute name (the predicate) - in the example that would be "kontakt" - that has cardinality of 1 or more ([1..x]) OR
3. the root has an attribute of cardinality 1 or more that has a unique type - in the example that would be "Kontakt" - and the instance typing configuration in that attribute class is set to "ALWAYS" OR 
4. the root has an attribute of cardinality 1 or more that has a unique attribute of cardinality 1 or more - in the example that would be "má URL". 

If the data specification is still not targettable, you have to target the data nodes yourself. 

## ShEx
[ShEx](https://shex.io/shex-primer/)  is a language for validating and describing RDF data. ShEx validators require two inputs to validate data: ShEx Shape describing the expected data structure and ShEx Map describing which data nodes are validated by which shape. 

The ShEx shape generated by the generator is good to go. It contains all used prefixes in its header and for better readability, it contains rdfs:label and rdfs:comment sections describing the expression from the shape. 

The ShEx map that is generated by the ShEx Query Map artifact is a query map, which means that it targets data nodes based on some data specification characteristics so that it can be used to validate data without knowing the node IRIs in the data. How the characteristics in the data specification are used to target the data nodes can be viewed in the use case study here: [SHACL and ShEx targetting](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#data-nodes-targetting-with-shacl-and-shex) .

This tutorial on how to generate and use the ShEx artifacts generator is using this data specification as an example:

{{% tutorial-image "images/tutorial/shacl-shex-specific/example-data-specification.png" %}}

For relevant artifact configuration settings for ShEx see [Relevant configuration settings](#configuration-settings). Configuration settings regarding the ShEx Query Map are following:

- Explicit instance typing - can impact the ability to create the ShEx Query Map when ALWAYS is not set in the root class of the data specification or the classes associated to the root class. For further details on how it impacts the generation process, read more in [SHACL and ShEx targetting](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#data-nodes-targetting-with-shacl-and-shex). How to fix issues regarding this setting and the data structure read here: [How to fix the generator failing](#how-to-fix-the-generator-failing).


### ShEx Shapes

ShEx Shapes is used to describe the data structure and constraints of the data specification that is created/edited/viewed by the user in Dataspecer. It contains Shapes and in them constraints how the data structure is supposed to look like and which attributes it can/must have. The generated ShEx Shape is using prefixes only for well-known prefixes and the base URL that the user can set in the configuration settings. 

This generated ShEx Shape is used as the input of ShEx validators along with the ShEx Map and the RDF data. 

Example of generated ShEx Shape for the data specification shown above:

```
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix base: <https://myexample.com/>

base:217547b71513ecc5b06d7da60879e65akontaktShape IRI{
	a [<https://slovník.gov.cz/generický/kontakty/pojem/kontakt>] ;
	<https://slovník.gov.cz/generický/kontakty/pojem/má-url> xsd:anyURI +
		// rdfs:label	"má URL"
		// rdfs:comment	"Webová kontaktní adresa: webová stránka či WebID."
}
base:d7528e03c25e75bf0abc589ed5545ad5turistický_cílShape IRI{
	a [<https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl>] ;
	<https://slovník.gov.cz/datový/sportoviště/pojem/kapacita> xsd:integer *
		// rdfs:label	"kapacita" ;
	<https://slovník.gov.cz/datový/turistické-cíle/pojem/kouření-povoleno> xsd:boolean ?
		// rdfs:label	"smoking allowed"
		// rdfs:comment	"Determines whether it is possible to smoke tobacco products in the tourist destination." ;
	<https://slovník.gov.cz/datový/turistické-cíle/pojem/kontakt> @base:217547b71513ecc5b06d7da60879e65akontaktShape
		// rdfs:label	"kontakt"
}
```

#### Generator failure

In certain situations described in [SHACL and ShEx targetting](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#data-nodes-targetting-with-shacl-and-shex), the artifact cannot be generated due to lack of data structure specifics. The aforementioned link also contains section [SHACL and ShEx targetting failure](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#targetting-failure-and-how-to-fix-it) on how to fix the data specification in order to allow the generator to generate the shape. 

Brief summary on how to fix the failure is here earlier in the document: [How to fix the generator failing](#how-to-fix-the-generator-failing).

### ShEx Query Map

ShEx Query Map represents the target data nodes that will be validated by generated ShEx Shape. To be as general as possible, the generated map uses SPARQL syntax for ShEx Query Map, that targets the data nodes by mapping on the given pattern. 

Example of generated ShEx Query Map for the data specification shown above:
```sparql
{ FOCUS rdf:type <https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl>}@<https://myexample.com/https://myexample.com/d7528e03c25e75bf0abc589ed5545ad5turistický_cílShape>
```
In the given example, the FOCUS data nodes are those who have a predicate of rdf:type going from them and having <https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl> as object of this triple. Those data nodes that correspond to this pattern are validated against ShEx Shape with the IRI <https://myexample.com/https://myexample.com/d7528e03c25e75bf0abc589ed5545ad5turistický_cílShape>. It is the same IRI as for the root data class when generating ShEx Shape with the Dataspecer generators.

Other possible variants of query map in Dataspecer can be viewed here: [SHACL and ShEx targetting](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#data-nodes-targetting-with-shacl-and-shex).
 
#### Generator failure

In certain situations described in [SHACL and ShEx targetting](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#data-nodes-targetting-with-shacl-and-shex), the artifact cannot be generated due to lack of data structure specifics. The aforementioned link also contains section [SHACL and ShEx targetting failure](https://github.com/dataspecer/dataspecer/tree/main/packages/shacl#targetting-failure-and-how-to-fix-it) on how to fix the data specification in order to allow the generator to generate the shape.

Brief summary on how to fix the failure is here earlier in the document: [How to fix the generator failing](#how-to-fix-the-generator-failing).
