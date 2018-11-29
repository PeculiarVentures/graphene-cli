import { Command } from "../../command";
import {Assoc} from "../../types";
import { AlgorithmsCommand } from "./algs";
import { InfoCommand } from "./info";
import { ListCommand } from "./list";
import { OpenCommand } from "./open";
import { StopCommand } from "./stop";

export class SlotCommand extends Command {
    public name = "slot";
    public description = "Open a session to a slot and work with its contents";

    constructor(parent?: Command) {
        super(parent);

        this.commands.push(new ListCommand(this));
        this.commands.push(new InfoCommand(this));
        this.commands.push(new AlgorithmsCommand(this));
        this.commands.push(new OpenCommand(this));
        this.commands.push(new StopCommand(this));
    }

    protected async onRun(options: Assoc<any>) {
        await this.showHelp();
        return this;
    }

}
