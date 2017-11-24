import { NumberOption } from "../../../options/number";

export class ThreadOption extends NumberOption {
    public name = "thread";
    public alias = "th";
    public description = "Optional. Number of threads. Default 1";
    public defaultValue = 1;
}
