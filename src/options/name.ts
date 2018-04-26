import { Option } from "../options";

export class NameOption extends Option {

    public name = "name";
    public description = "Name of module";

    constructor() {
        super();

        this.alias = "n";
        this.isRequired = true;
    }
}
