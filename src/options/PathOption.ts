import {existsSync} from "fs";
import {Option} from "../options";
export class PathOption extends Option {
    public alias = "p";
    public description =  "File path";
    public name = "path";
    public parse(value?: string): any {
        if (!value) { throw new Error("Path can`t be empty"); }
        if (!existsSync(value)) { throw new Error("Invalid path, file not found"); }
        return value;
    }
}
