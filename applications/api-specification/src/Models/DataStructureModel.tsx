/* Interface representing DataStructure designed in DataSpecer */
export interface DataStructure {
  name: string;
  givenName: string; // represents name that was set by the user
  id: string;
  fields?: Field[]; // attributes and associations
}

/* Interface representing Fields of the DataStructure
 * Can represent both types of fields - attributes as well as associations 
 * 
 * Field.type represents type of the field which can be either primitive data type e.g string or another data structure (class)
 * In case of association and Field.type being a class its whole form is considered by populating Field.nestedFields
 */
export interface Field {
  name: string;
  type: string;
  classType?: string;
  nestedFields?: DataStructure;
  isArray?: boolean;
  isMandatory?: boolean;
}