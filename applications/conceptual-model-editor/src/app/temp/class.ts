export class Association {
    name: string;
    assocEnd: CimClass;

    constructor(name: string, clsB: CimClass) {
        this.name = name;
        this.assocEnd = clsB;
    }
}

export type Attribute = {
    name: string;
    value: string;
};

export class CimClass {
    name: string;
    attributes: Attribute[];
    associations: Association[];
    highlighted: boolean;

    constructor(name: string, attributes: Attribute[], associations: Association[]) {
        this.name = name;
        this.attributes = attributes;
        this.associations = associations;
        this.highlighted = false;
    }

    addAssociation(association: Association) {
        this.associations = [...this.associations, association];
    }

    addAttribute(attr: Attribute) {
        this.attributes = [...this.attributes, attr];
    }

    setHighlited(to: boolean) {
        this.highlighted = to;
    }
}

export const classB = new CimClass(
    "class B",
    [
        { name: "age", value: "23" },
        { name: "height", value: "5f10" },
    ],
    []
);

export const assocA = new Association("as1", classB);
export const assocC = new Association("as2", classB);

export const classA = new CimClass(
    "class A",
    [
        { name: "age", value: "56" },
        { name: "height", value: "5f10" },
    ],
    [assocA]
);

export const classC = new CimClass(
    "class C",
    [
        { name: "age", value: "60" },
        { name: "weight", value: "510lb" },
    ],
    [assocC]
);

export const sampleClasses = [classA, classB, classC];
