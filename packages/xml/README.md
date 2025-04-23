# @dataspecer/xml

## How to treat names and types for XML

Technical labels are in parentheses.

### Association to classes

In this section, suppose we enable **extract types**.

```
RootClass (R)
  - association (A) to class (C)
```
```xml
...
<xs:element name="A" type="C"/>
<xs:complexType name="C"> ... </xs:complexType>
```

### The root itself

Our PSM has object in root, this corresponds to complexType in root. But if we want an element as well, then you need to add technical label to root.

```
- virtual root association (X) to RootClass (R)
    - association (A) to class (C)
```
```xml
<!-- public root element -->
<xs:element name="X" type="R"/>
<!-- public root type -->
<xs:complexType name="C">
  <!-- the rest is here if extract types disabled -->
</xs:complexType>
```

> [!NOTE]
> If a technical label for the virtual root association (X in our example) is missing, the technical label for class will be used (R in our example).

> [!CAUTION]
> Because the current PSMv1 does not support *root associations* (there is schema which links straight to class), we use schema label as a root association label