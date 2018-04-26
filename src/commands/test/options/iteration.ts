import { NumberOption } from "../../../options/number";

export class IterationOption extends NumberOption {
    public name = "it";
    public alias = "it";
    public description = "Sets number of iterations. Default 1";
    public defaultValue = 1;

}
