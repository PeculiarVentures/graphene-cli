import { Option } from "../options";

export abstract  class BooleanOption extends Option {

    public parse(value?: string): boolean {
        return true;
    }

}
