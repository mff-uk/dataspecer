# Libraries
While libraries can provide a huge productivity boost, they also represent a potential liability.
This includes issues with security and other bugs.
In order to fix such bug it is often necessary to study given library first.
This is not an issue for libraries with reasonable sized active community.
For this reason, please select libraries you want to use carefully.
The authors of this repository may reject your pull request based on the libraries you employ in your code. 

The library should:
* Contains non-trivial functionality. 
  Do not import libraries for a single function with a dozen lines of code.
* Has an active community and be actively maintained.  

When you decide to use a particular library, consider design of an interface that will be implemented with given library. 
This way should we need to change that library to other one, we just need to provide implementation of the interface. 
Consequently, the ripple effect of library changes should be minimized.
