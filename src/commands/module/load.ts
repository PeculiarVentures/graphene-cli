import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { data } from "../../data";

import { LibraryOption } from "../../options/library";
import { NameOption } from "../../options/name";
import { get_module, print_module_info } from "./helper";

interface LoadOptions {
    lib: string;
    name: string;
}

export class LoadCommand extends Command {
    public name = "load";
    public description = "loads a specified PKCS#11 module";

    constructor(parent: Command) {
        super(parent);

        this.options.push(new LibraryOption());
        this.options.push(new NameOption());
    }

    protected async onRun(args: LoadOptions): Promise<Command> {
        if (data.module) {
            data.module.finalize();
        }
        data.module = graphene.Module.load(args.lib, args.name);
        data.module.initialize();

        const mod = get_module();
        print_module_info(mod);


        return this;
    }

}
