import { Command } from "../../command";
import { ListCommand } from "./list";
import { TestCommand } from "./test";
import { DeleteCommand } from "./delete";
import { InfoCommand } from "./info";
import {GenerateCommand} from "./generate";
import {SignCommand} from "./sign";

export class ObjectCommand extends Command {
    public name = "object";
    public description = "Manage objects on the device";

    constructor(parent?: Command) {
        super(parent);

        this.commands.push(new ListCommand(this));
        this.commands.push(new TestCommand(this));
        this.commands.push(new InfoCommand(this));
        this.commands.push(new GenerateCommand(this));
        this.commands.push(new SignCommand(this));
        this.commands.push(new DeleteCommand(this));
    }

    protected async onRun(options: Assoc<any>): Promise<Command> {
        this.showHelp();

        return this;
    }

}
