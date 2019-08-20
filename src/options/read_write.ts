import { BooleanOption } from "./boolean";

export class ReadWriteOption extends BooleanOption {
    public name = "readWrite";
    public alias = "rw";
    public description = "Opens session in R/W mode";
}
