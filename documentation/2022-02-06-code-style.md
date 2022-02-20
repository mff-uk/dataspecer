# Code style
As more developers contribute to this code it become clear that we need to agree on a common codestyle.
Without it, each file would look different, it would also not be clear which code style should be used when one developer edit file from other developer.
There could also be discussion about line endings, line len, variable naming etc...
While a solution is to enforce consistent code style across the whole monorepo, we respect that developers may have strong preferences.
To address this, the code style is not enforced globally but on the level of individual packages.
Each package can thus define its own codestyle, preferably using [ESlint](https://eslint.org/).

Despite that, there are few rules that should be respected in the whole monorepo and are specified in the root ESlint configuration file.
 * The first rule is use of Linux style line endings. 
 * The second one is using double quotes. 
   The main benefit from this decision is to allow developer to use same type of quotes in different languages. 
   Double quotes can be used in JavaScript, TypeScript, JSON, Java, C++, Python, ... the same is not true for single quotes.
   To decrease the mental load, double quotes were selected.
 * Using semicolons.  
   Probably the most controversial, as many argue against them.
   The reason is same as for the quotes, there are many languages where semicolons are optional.
   On the other hand there are many when they are mandatory.
   It is not error to not use them where optional, but it is error to not use them where mandatory.
   As a result we decided, again to make it easier for developers, to require them to he used.

In addition to complete get rid of the need to think about code styles, we recommend employing [Prettier](https://prettier.io/).
Prettier will rewrite any code written by the developer, it thus makes no sense to think about indentation and code style.
None of it matter as it is the Prettier who have the final code. 
The main benefit is that the code seems more like written by a single person, also you do not have to think about code style anymore - focus on the important stuff instead.
