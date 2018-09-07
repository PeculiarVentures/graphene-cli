import { Command } from "../../command";
import {Assoc} from "../../types";
import { DecryptCommand } from "./dec";
import { EncryptCommand } from "./enc";
import { GenerateCommand } from "./gen";
import { SignCommand } from "./sign";
import { VerifyCommand } from "./verify";

export class TestCommand extends Command {
    public name = "test";
    public description = "Benchmark device performance for common algorithms";

    constructor(parent?: Command) {
        super(parent);

        this.commands.push(new GenerateCommand(this));
        this.commands.push(new SignCommand(this));
        this.commands.push(new VerifyCommand(this));
        this.commands.push(new EncryptCommand(this));
        this.commands.push(new DecryptCommand(this));
    }

    protected async onRun(options: Assoc<any>): Promise<Command> {
        this.showHelp();

        return this;
    }

}
