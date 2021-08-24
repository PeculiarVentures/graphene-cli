import { Option } from "../options";

export class LibraryOption extends Option {

    public name = "lib";
    public description = "Path to library";

    constructor() {
        super();

        this.alias = "l";
    }
}
