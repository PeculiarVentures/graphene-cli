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
                let parsedArgs = args.slice(2);
                let commandIndex = [];
                let specialCmds = [];
                for(let i=0;i<parsedArgs.length;i++){
                    for(let cmd in this.commands){
                        if(parsedArgs[i] === this.commands[cmd].name){
                            commandIndex.push(i)
                        }
                    }
                    if(commandIndex.length==0){
                        specialCmds.push(parsedArgs[i]);
                    }
                }
                for(let cmd of specialCmds){
                    if(cmd.toLowerCase()=='-quiet'){
                        this.sharedParams.quiet = true;
                    }
                }
                for(let i=0;i<commandIndex.length;i++){
                    if(commandIndex.length-1==i){
                        let lastCommand = parsedArgs.slice(commandIndex[i]);
                        await super.run(lastCommand);
                    }else{
                        let nextCommand = parsedArgs.slice(commandIndex[i],commandIndex[i+1]);
                        await super.run(nextCommand);
                    }
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
