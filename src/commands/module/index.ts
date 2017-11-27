import { Command } from "../../command";
import { InfoCommand } from "./info";
import { LoadCommand } from "./load";

export class ModuleCommand extends Command {
    public name = "module";
    public description = "load and retrieve information from the PKCS#11 module";

    constructor(parent?: Command) {
        super(parent);

        this.commands.push(new LoadCommand(this));
        this.commands.push(new InfoCommand(this));
    }

    protected async onRun(args: string[]): Promise<Command> {
        this.showHelp();
        return this;
    }

}