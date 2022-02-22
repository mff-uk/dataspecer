# Documentation
Each subproject/package, and root of the repository may have directory called *documentation*.
Purpose of this directory is to house comments, ideas and documentation for given package.
We decided to now use Wiki as it does not allow us to have tight connection between code and documentation. 
Now as documentation is in the same repository as code, it is easy to find the right documentation.

The documentation files should be prefixed by the date when given file was created.
If an existing documentation need to be altered, it should be done to the given file. 
Thus the date reflects only creation time, i.e. when we decided to document something not the last change.
As the files may also cover ideas and comments, it also provides us with a history.

Documentation is mostly not for the code.
If the information can be put into code, for example as comments, put it into code instead. 
Even better write tests that illustrate given concept. 

On the other hand, if there is a decision to make, it is good idea to create a documentation file about it.
In that case the documentation should not focus only on the selected approach.
Instead, it should discuss the problem, why we need to solve it and what are the alternatives.
It should conclude what solution we picked and, most importation, why.
Thus, anyone facing similar issues, or having doubt with decision made in the past, can referer to the documentation. 

With that said the documentation can be changed.
If the document reflect on particular decision, it is recommended to not delete but append content at the end with given date.
This creates sort of a discussion that may help up better understand why decisions ware made. 

Although, this document proposes recommended use of the documentation directory, it is up to each package to make the final decision.
