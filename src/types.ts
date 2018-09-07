import {ITemplate} from "graphene-pk11";

export interface Assoc<T> {
    [key: string]: T;
}
export interface ITemplatePair {
    privateKey: ITemplate;
    publicKey: ITemplate;
}
