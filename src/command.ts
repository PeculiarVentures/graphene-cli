import { Option } from "./options";

export abstract class Command {

    public abstract name: string;
    public abstract description: string | string[];
    public readonly parent?: Command;
    public commands: Command[] = [];
    public options: Option[] = [];

    constructor(parent?: Command) {
        this.parent = parent;

        if (!(this instanceof HelpCommand)) {
            (this as any).commands.push(new HelpCommand(this));
        }
    }

    public async showHelp() {
        this.commands.some((cmd) => {
            if (cmd instanceof HelpCommand) {
                cmd.run([]);
                return true;
            }
            return false;
        });
    }

    public getCommand(args: string[]): Command {
        const commandName = args[0];
        for (const command of this.commands) {
            if (command.name === commandName) {
                return command.getCommand(args.slice(1));
            }
        }
        return this;
    }

    public async run(args: string[]): Promise<Command> {
        // console.log(`${this.name}:`, args);
        const command = this.getCommand(args);
        const params = command.parseOptions(args);

        return command.onRun(params);
    }

    public parseOptions(args: string[]) {
        const res: Assoc<any> = {};

        for (let i = 0; i < args.length; i++) {
            let name = args[i];
            if (/^--\w+/i.test(name)) {
                name = /^--(\w+)/i.exec(name)![1];
            } else if (/^-\w+/i.test(name)) {
                name = /^-(\w+)/i.exec(name)![1];
                this.options.some((option) => {
                    if (option.alias === name) {
                        name = option.name;
                        return true;
                    }
                    return false;
                });
            } else {
                continue;
            }

            const value = args[i + 1];
            if (!/^-{1,2}/.exec(value)) {
                res[name] = value;
                i++;
            } else {
                res[name] = undefined;
            }
        }

        const res2: Assoc<any> = {};
        for (const option of this.options) {
            if (option.isRequired && !res.hasOwnProperty(option.name)) {
                throw new Error(`Cannot find required parameter '${option.name}'`);
            }
            if (!res.hasOwnProperty(option.name)) {
                res2[option.name] = option.defaultValue;
            } else {
                res2[option.name] = option.parse(res[option.name]);
            }
        }

        return res2;
    }

    protected abstract async onRun(options: Assoc<any>): Promise<Command>;

}

import { HelpCommand } from "./commands/help"; import { lpad, print_description } from "./helper";

