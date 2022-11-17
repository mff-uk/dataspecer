# XML-related utilities

This directory contains common source files used by code working with XML-related technologies. 

The configuration of the XML instance format can be specified in `xml-conventions.ts`, storing settings such as the definition of the common namespace (used for `<c:iri>`) or the mapping between OFN types and [XML Schema](https://www.w3.org/TR/xmlschema11-2/).

The XML writer class used when generating XML is defined in `xml-writer.ts`. It is defined through a hierarchy of interfaces and classes, starting from the base interface `XmlNamespaceMap` for registering and retrieving namespaces, extended by `XmlWriter`, the common interface used for writing parts of the XML syntax.

A concrete implementation of `XmlWriter` is `XmlIndentingTextWriter` which supports text output and indentation. This is extended by `XmlStreamWriter`, used to write to an `OutputStream`.