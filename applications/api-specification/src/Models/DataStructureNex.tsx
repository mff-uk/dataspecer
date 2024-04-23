  /* Interface representing DataStructure designed in DataSpecer */
  interface DataStructure 
  {
    name: string; 
    givenName: string; // represents name that was set by the user
    id: string; 
    fields?: Field[]; // attributes and associations
  }

  /* Interface representing Fields of the DataStructure
   * Can represent both types of fields - attributes as well as associations 
   * 
   * Field.type represents type of the field which can be either primitive data type e.g string, number etc. or another data structure (class)
   * In case Field.type is class its whole form is considered by populating Field.nestedFields
   */
  interface Field 
  {
    name: string; 
    type: 'string' | 'number' | 'boolean' | 'date' | 'class'; 
    classType?: string; 
    nestedFields?: DataStructure; 
  }