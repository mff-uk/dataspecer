import { getRandomName, getRandomNumberInRange } from "../utils/random-gen";

export class Association {
    name: string;
    assocEnds: CimClass[];
    id: string;

    constructor(name: string, ...clses: CimClass[]) {
        this.name = name;
        this.assocEnds = clses;
        this.id = "assoc" + Date.now() + name;
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
    id: string;
    cimId: string;

    constructor(name: string, attributes: Attribute[], associations: Association[], cimId: string) {
        this.name = name;
        this.attributes = attributes;
        this.associations = associations;
        this.highlighted = false;
        this.id = "class" + name;
        this.cimId = cimId;
    }

    addAssociation(association: Association) {
        this.associations = [...this.associations, association];
    }

    addAttribute(attr: Attribute) {
        this.attributes = [...this.attributes.filter((a) => a.name !== attr.name), attr];
    }

    removeAttribute(attr: string) {
        this.attributes = [...this.attributes.filter((a) => a.name !== attr)];
    }

    setHighlited(to: boolean) {
        this.highlighted = to;
    }
}

export class Cim {
    classes: CimClass[];
    associations: Association[];
    id: string;

    constructor(classes: CimClass[], associations: Association[]) {
        this.classes = classes;
        this.associations = associations;
        this.id = "cim" + Date.now();
    }

    addClass(...classes: CimClass[]) {
        this.classes.push(...classes);
    }

    addAssociation(...associations: Association[]) {
        this.associations.push(...associations);
    }
}

export function getSampleCim(): Cim {
    const cim = new Cim([], []);
    const vehicle = new CimClass("Vehicle", [{ name: "comment", value: "A vehicle" }], [], cim.id);
    const product = new CimClass("Product", [{ name: "comment", value: "A Product" }], [], cim.id);
    const quantitativeValue = new CimClass(
        "QuantitativeValue",
        [{ name: "comment", value: "A QuantitativeValue" }],
        [],
        cim.id
    );
    const structuredValue = new CimClass(
        "StructuredValue",
        [{ name: "comment", value: "A StructuredValue" }],
        [],
        cim.id
    );
    const thing = new CimClass("Thing", [{ name: "comment", value: "The most generic type of item" }], [], cim.id);
    const fuelConsumption = new Association("FuelConsumption", vehicle, quantitativeValue);
    const qVsubclassOfsV = new Association("SubclassOf", quantitativeValue, structuredValue);
    const sVsubclassOfThing = new Association("SubclassOf", structuredValue, thing);
    const productSubclassOfThing = new Association("SubclassOf", product, thing);

    vehicle.addAssociation(fuelConsumption);
    quantitativeValue.addAssociation(qVsubclassOfsV);
    structuredValue.addAssociation(sVsubclassOfThing);
    product.addAssociation(productSubclassOfThing);

    return new Cim(
        [vehicle, product, quantitativeValue, structuredValue, thing],
        [fuelConsumption, qVsubclassOfsV, sVsubclassOfThing, productSubclassOfThing]
    );
}

export function getSampleCimOf(nodes: number, links: number): Cim {
    const cim = new Cim([], []);
    const classes: CimClass[] = [];
    const associations: Association[] = [];

    for (let i = 0; i < nodes; i++) {
        const newClass = new CimClass(getRandomName(), [], [], cim.id);
        classes.push(newClass);
    }

    for (let l = 0; l < links; l++) {
        const assoc = new Association(
            getRandomName(),
            classes[getRandomNumberInRange(0, nodes)]!,
            classes[getRandomNumberInRange(0, nodes)]!
        );
        associations.push(assoc);
    }

    cim.classes = classes;
    cim.associations = associations;
    return cim;
}
