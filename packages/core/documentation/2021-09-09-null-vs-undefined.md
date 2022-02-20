# Null vs Undefined
We employ ```null``` to indicate missing value.
As a result, if a function can optionally return string the return type is ```string | null``` not ```string | undefined```.
For a class/interface properties with ```null``` indicates possible missing value.
For example ```technicalLabel: string | null``` indicates situation where the ```technicalLabel``` may be set to particular value or left empty.

An exception to this rule is when a particular code deals with a third party code that require use of ```undefiend```.  
