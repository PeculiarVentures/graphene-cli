import { BooleanOption } from "../../../options/boolean";

export class TokenOption extends BooleanOption {
    public name = "token";
    public alias = "token";
    public description = "Sets CKA_TOKEN for created object. Default false";
    public defaultValue = false;
    public isRequired = false;
}
