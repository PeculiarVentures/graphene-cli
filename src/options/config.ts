import { Option } from "../options";

export class ConfigOption extends Option {

    public name = "config";
    public description = "Path to config file";

    constructor() {
        super();

        this.alias = "c";
    }
}
