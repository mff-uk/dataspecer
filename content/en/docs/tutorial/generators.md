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
