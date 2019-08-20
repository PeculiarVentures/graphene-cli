import { Option } from "../../../options";

export class TypeOption extends Option {
    public name = "type";
    public alias = "t";
    public description = "Optional. Type of object (all, key, cert). Default value is 'all'";
    public defaultValue = "all";

    public parse(value?: string) {
        if (!value) {
            return this.defaultValue;
        }

        value = value.toLowerCase();
        switch (value) {
            case "all":
            case "key":
            case "cert":
                return value;
            default:
                throw new Error(`Unsupported type of object for --type param`);
        }
    }

}
