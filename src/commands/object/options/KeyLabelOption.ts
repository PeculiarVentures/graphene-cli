import {Option} from "../../../options";

export class KeyLabelOption extends Option {
    public name = "label";
    public alias = "l";
    public description = "Object label";
    public parse(value?: string, args?: string[]): any {
        return (value || this.defaultValue).replace(/['"]+/g, "");
    }
}
