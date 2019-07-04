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

export class NonInteractive extends Command {

    public name = "graphene";
    public description = "The graphene-cli is a cross-platform command line tool for working with PKCS#11 devices";

    constructor() {
        super();

        this.sharedParams.nonInteractive = true;

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
                let parsedArgs = args.slice(2);
                let commandIndexes = [];
                let applicationFlags = [];
                for(let i=0;i<parsedArgs.length;i++){
                    if(this.hasCommand(parsedArgs[i])){
                        commandIndexes.push(i);
                    }
                    if(commandIndexes.length==0){
                        applicationFlags.push(parsedArgs[i]);
                    }
                }
                for(let cmd of applicationFlags){
                    if(cmd.toLowerCase()=='-quiet'){
                        this.sharedParams.quiet = true;
                    }
                }
                for(let i=0;i<commandIndexes.length;i++){
                        let nextCommand = parsedArgs.slice(commandIndexes[i],commandIndexes[i+1]);
                        await super.run(nextCommand);
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
