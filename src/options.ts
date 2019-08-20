export abstract class Option {
    public abstract name: string;
    public abstract description: string | string[];
    public alias?: string;
    public isRequired = false;
    public defaultValue?: any;

    public parse(value?: string): any {
        return value || this.defaultValue;
    }
}
