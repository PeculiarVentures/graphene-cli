import { Option } from "../options";

export abstract class NumberOption extends Option {
    public parse(value?: string) {
        const num = parseInt(value || this.defaultValue, 10);
        if (isNaN(num)) {
            throw new Error(`Cannot parse parameter --${this.name}. Parameter is not a number`);
        }

        return num;
    }
}
