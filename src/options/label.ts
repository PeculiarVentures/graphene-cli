import {BooleanOption} from "./boolean";

export class SlotLabelOption extends BooleanOption {
    public name = "label";
    public alias = "l";
    public description = "Use label instead index for connecting to slot, default: false";
    public defaultValue = true;
}
