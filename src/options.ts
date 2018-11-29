export abstract class Option {
    public abstract name: string;
    public abstract description: string | string[];
    public alias?: string;
    public isRequired = false;
    public defaultValue?: any;

    public parse(value?: string, args?: string[]): any {
        return value || this.defaultValue;
    }
}

export class OptionsSet {
    public options: Option[] = [];
    public type: "every" | "some" | "none" = "none";
}