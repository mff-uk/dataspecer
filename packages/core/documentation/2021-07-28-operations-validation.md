# Operations and inconsistent state
Especially on platform specific level (PSM) level some operations may lead to state which is inconsistent with platform independent level (PIM).  
Those operations are mainly changes in the interpretation.
For example, we may have PSM class with PSM attribute, both with interpretation to PIM.
Now we decide to change the PSM attribute interpretation to PIM attribute that is not part of the PSM class's interpretation.
This lead to an invalid state.
We can tackle this by validating the operation in each operation, thus each operation would lead to a consistent state.
This may, however, prevent some use-cases where for example both interpretation of the PSM class and PSM attribute need to be changed.
As a solution we decide to not validate the state in the operation, so an invalid state can be produced.
In addition, we introduce validators that would validate the state.
It is then upon the application to either use the validators to reject operations leading to an invalid state, or allow them and just notify user about the inconsistencies.

Keep in mind that the operation still validate the state on their level.
For example when an attribute is created it must be owned by a class or a property container.
