import { Option } from "../../../options";

export class InputOption extends Option {
    public name = "in";
    public alias = "in";
    public description = "The file to hash";
    public isRequired = true;
}
