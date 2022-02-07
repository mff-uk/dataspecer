# Input/Output as a parameter
All input/output operations must be defined in the ```io``` package as interfaces.
This does apply, but is not limited, to fetch operation and text input/output operations.
The code must use only the ```io``` interfaces of such operations not their particular implementations.
In addition, any method using one of the interfaces must take the interface as an argument.

This allows user core to decide which implementation should be used.
As a result we should be able to support input/output for browser, NodeJs and test environment.
