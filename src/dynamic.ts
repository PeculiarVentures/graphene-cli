import * as Color from "./color";
import { Command } from "./command";

import { HashCommand } from "./commands/hash";
import { ModuleCommand } from "./commands/module";
import { ObjectCommand } from "./commands/object";
import { SlotCommand } from "./commands/slot";
import { VersionCommand } from "./commands/version";
import { TestCommand } from "./commands/test";
import { CloseCommand } from "./commands/close";

import * as c from "./const";

export class Dynamic extends Command {

    public name = "graphene";
    public description = "The graphene-cli is a cross-platform command line tool for working with PKCS#11 devices";

    constructor() {
        super();

        this.sharedParams.dynamic = true;

        this.commands.push(new TestCommand(this));
        this.commands.push(new CloseCommand(this));
        this.commands.push(new VersionCommand(this));
        this.commands.push(new ModuleCommand(this));
        this.commands.push(new SlotCommand(this));
        this.commands.push(new ObjectCommand(this));
        this.commands.push(new HashCommand(this));
    }

    public async run(args: string[]): Promise<Command> {
            try {
                args = args.slice(2); //Reset to old pointer

                while(args.length>0){
                    let command = this.getCommand(args);
                    let params = command.parseOptions(args);
                    let paramCount = (Object.entries(params).length) + (Object.values(params).length);
                    if(args.length%2==1){
                        console.error(`\n${Color.FgRed}Error${Color.Reset}`, 'Options formatting');
                        break;
                    }
                    let lastCmdIndex = args.indexOf(command.name);
                    let fullCmdIndex = lastCmdIndex + paramCount + 1;
                    let argsRun = args.slice(0,fullCmdIndex);

                    args = args.slice(fullCmdIndex);
                    await super.run(argsRun);
                }
                c.readline.close();
            } catch (e) {
                c.readline.close();
                console.error(`\n${Color.FgRed}Error${Color.Reset}`, e.message);
            }
        return this;
    }

    protected async onRun(args: string[]): Promise<Command> {
        return this;
    }


}
