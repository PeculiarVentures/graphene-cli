import { Option } from "../../../options";

export class DataOption extends Option {
    public name = "data";
    public alias = "d";
    public description = "Data to manipulate";
    public isRequired = true;
}
