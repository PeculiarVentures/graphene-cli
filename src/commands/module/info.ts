import { Command } from "../../command";
import { data } from "../../data";
import { get_module, print_module_info } from "./helper";

export class InfoCommand extends Command {
    public name = "info";
    public description = "Prints info about Module";

    protected async onRun(params: {}) {
        const mod = get_module();
        print_module_info(mod);
        return this;
    }

}
