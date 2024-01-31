import { IWdClass } from "./entities/wd-class";
import { IWdProperty } from "./entities/wd-property";

// Error response 

export interface IErrorResponse {
    statusCode: number,
    error: string,
    message: string
}

// Search api

export interface ISearchResults {
    classes: IWdClass[]
}

export interface ISearchResponse {
    results: ISearchResults;
}

// Get class api

export interface IGetClassResults {
    classes: IWdClass[]
}

export interface IGetClassResponse {
    results: IGetClassResults
}

// Get hierarchy api

export interface IHierarchyResults {
    root: IWdClass
    parents: IWdClass[]
    children: IWdClass[]
}

export interface IHierarchyResponse {
    results: IHierarchyResults
}

// Get surroundings api

export interface ISurroundingsResults {
    root: IWdClass
    parents: IWdClass[]
    children: IWdClass[]
    subjectOf: IWdProperty[]
    valueOf: IWdProperty[]
    propertyEndpoints: IWdClass[]
}

export interface ISurroundingsResponse {
    results: ISurroundingsResults
} 
