# Granular core interfaces/classes for model
As of now we have tree-like structure for base classes in data-psm, but similar is in pim model.
Instead, we may define three separate types (human-readable, interpretable and technical) and provide way to detect those types.
In order to make this work we would need to change the interfaces to classes, to implement the type detection.

The disadvantage is that by assigning methods to the model objects we can not use ```as``` methods to simply cast the resources.
This can be an issue as a single resource may have multiple types when loaded from RDF.
Should we decide that each resource, IRI, can be of only one type, we may decide to convert the code to classes.

## 2021.09.13:
As a result of using ```null``` instead of ```undefined``` (see [Null vs Undefined](2021-09-09-null-vs-undefined.md)) we need to set properties to null when an instance of a class is created.
In order archive that we need the ```as``` methods to set all properties, by doing, so they become almost a factory methods.

Once we start to use the business logic not only for loaders and generators it becomes clear, that handling object with multiple distinct types is impractical/too complicated.
Therefore, we force each resource, object with identifier, to have only one type.
This can easily be archived in the code, the only issue may come when loading RDF data.
But even with RDF it may still not be clear what is the meaning of such object and handling of interactions, for example delete of association which is also a class.

This lead us to reverting our previous decision and forcing each object to have only one final type.
Still we support inheritance meaning that object can have multiple types if they are linear specializations.

As a part of this decision we migrate the interfaces back to classes, moving the ```as``` and ```is``` methods to the class as static methods.
A model class MUST NOT have any non-static methods.


