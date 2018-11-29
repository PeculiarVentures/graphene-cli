import {Option} from "../../../options";

export class KeyFormatOption extends Option {
    public name = "format";
    public alias = "f";
    public description = "Key format option enum: [pkcs8-public, pkcs8-private, pkcs1-public, pkcs1-private]";
    private formats = [
        "pkcs1-private-der",
        "pkcs1-private-pem",
        "pkcs1-private",
        "pkcs8-private-der",
        "pkcs8-private-pem",
        "pkcs8-private",
        "pkcs1-public-der",
        "pkcs1-public-pem",
        "pkcs1-public",
        "pkcs8-public-der",
        "pkcs8-public-pem",
        "pkcs8-public",
    ];

    public parse(value?: string) {
        if (!value || !this.formats.includes(value)) { throw new Error(`Unsupported key format: ${value}`); }
        return value;
    }
}
