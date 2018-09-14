import { Command } from "../../command";
import {Assoc} from "../../types";
import { DeleteCommand } from "./delete";
import {ExportCommand} from "./export";
import {GenerateCommand} from "./generate";
import {ImportCommand} from "./import";
import { InfoCommand } from "./info";
import { ListCommand } from "./list";
import { TestCommand } from "./test";

export class ObjectCommand extends Command {
    public name = "object";
    public description = "Manage objects on the device";

    constructor(parent?: Command) {
        super(parent);

        this.commands.push(new ListCommand(this));
        this.commands.push(new GenerateCommand(this));
        this.commands.push(new ExportCommand(this));
        this.commands.push(new ImportCommand(this));
        this.commands.push(new TestCommand(this));
        this.commands.push(new InfoCommand(this));
        this.commands.push(new DeleteCommand(this));
    }

    protected async onRun(options: Assoc<any>): Promise<Command> {
        this.showHelp();

        return this;
    }

}
