import { Command } from "../../command";
import { LoadCommand } from "./load";
import { InfoCommand } from "./info";

export class ModuleCommand extends Command {
    public name = "module";
    public description = "load and retrieve information from the PKCS#11 module";

    constructor(parent?: Command) {
        super(parent);

        this.commands.push(new LoadCommand(this));
        this.commands.push(new InfoCommand(this));
    }

    protected onRun(args: string[]): Promise<Command> {
        throw new Error("Method not implemented.");
    }

}