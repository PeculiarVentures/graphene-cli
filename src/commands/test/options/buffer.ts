import { NumberOption } from "../../../options/number";

export class BufferOption extends NumberOption {
    public name = "buf";
    public alias = "b";
    public description = "Optional. Buffer size (bytes). Default 1024";
    public defaultValue = 1024;
}
