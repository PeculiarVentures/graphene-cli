import { EventEmitter } from "events";
import * as core from "graphene-pk11";
import { CommandError, ICommand } from "./error";

export interface IDescription {
    description?: string;
    note?: string;
    example?: string;
}

export interface IOptionParam {
    shortName?: string;
    type?: string;
    description?: string;
    isRequired?: boolean;
    value?: any;
    set?: (value: any) => any;
}

export interface IOption extends IOptionParam {
    longName: string;
}

export interface IOptionArray {
    [name: string]: IOption;
}

export interface ICommandArray {
    [name: string]: Command;
}

export class Command extends EventEmitter implements IDescription, ICommand {

    public static parse(cmd: string) {
        cmd = prepare_command(cmd);
        const arCmd = split_command(cmd);
        const o: any = {
            commands: [],
        };
        let param: string | null = null;
        let fCommand = true;
        for (const word of arCmd) {
            const command = get_command_name(word);
            if (fCommand && command) {
                o.commands.push(command);
                continue;
            }
            fCommand = false;
            const name = get_long_name(word) || get_short_name(word);
            if (name && (!param || param !== name)) {
                param = name;
                o[name] = null;
            } else if (param) {
                o[param] = word;
            }
        }
        return o;
    }

    public options: IOptionArray = {};
    public commands: ICommandArray = {};
    public name: string;
    public description: string;
    public note: string;
    public example: string;

    constructor(name: string, desc: string | IDescription) {
        super();
        this.name = name;

        if (core.isObject(desc)) {
            const description = desc as IDescription;
            this.description = description.description!;
            this.note = description.note!;
            this.example = description.example!;
        } else {
            this.description = desc as string || "";
        }
    }

    public option(longName: string, param: IOptionParam) {
        const o: IOption = {
            longName,
            shortName: param.shortName || longName.charAt(0),
            description: param.description || "",
            type: param.type,
            value: param.value,
            isRequired: (core.isEmpty(param.value) && param.isRequired === true),
            set: param.set || ((v) => v),
        };
        this.options[o.longName] = o;
        return this;
    }

    public help() {
        console.log();
        this.print("description");
        this.print("usage");
        this.print("commands");
        this.print("note");
        this.print("example");
    }

    public createCommand(name: string, desc: string | IDescription): Command {
        const cmd = new Command(name, desc);
        cmd.createCommandHelp();
        this.commands[name] = cmd;
        return cmd;
    }

    public createCommandHelp() {
        const cmd = new Command("?", "output usage information");
        cmd.on("call", () => {
            this.help();
        });

        this.commands["?"] = cmd;
    }

    public print(block: string) {
        switch (block) {
            case "description":
                if (this.description) {
                    console.log("  " + this.description);
                    console.log();
                }
                break;
            case "usage":
                if (Object.keys(this.options).length) {
                    let params = "";
                    for (const i in this.options) {
                        const opt = this.options[i];
                        params += " --" + opt.longName;
                    }
                    console.log("  Usage: " + this.name + params);
                    console.log();
                    for (const i in this.options) {
                        const opt = this.options[i];
                        console.log("    --" + pud(opt.longName + (opt.type ? "<" + opt.type + ">" : ""), 8) + opt.description);
                    }
                    console.log();
                }
                break;
            case "commands":
                /**
                 * Prints list of commands
                 * Don't print if only one command "?"
                 */
                if (Object.keys(this.commands).length > 1) {
                    console.log("  Commands:");
                    console.log();
                    for (const i in this.commands) {
                        const cmd = this.commands[i];
                        console.log("    " + pud(cmd.name, 10) + cmd.description);
                    }
                    console.log();
                }
                break;
            case "note":
                if (this.note) {
                    console.log("  Note:");
                    console.log();
                    console.log("    " + this.note);
                    console.log();
                }
                break;
            case "example":
                if (this.example) {
                    console.log("  Example:");
                    console.log();
                    console.log("    " + this.example);
                    console.log();
                }
                break;
        }
    }
}

function get_command_name(name: string) {
    return get_name(name, /^(\w[\w-]*|\?)$/i);
}

function get_long_name(name: string) {
    return get_name(name, /^--(\w[\w-]*|\?)$/i);
}

function get_short_name(name: string) {
    return get_name(name, /^-(\w[\w-]*|\?)$/i);
}

function get_name(name: string, reg: RegExp) {
    let res: RegExpExecArray | null;
    // tslint:disable-next-line:no-conditional-assignment
    if (res = reg.exec(name)) {
        return res[1];
    }
    return null;
}

function prepare_command(cmd: string) {
    const res = trim_str(cmd);
    return res;
}

function trim_str(s: string) {
    let res = "";
    let fSpace = true;
    for (let i = 0; i <= s.length; i++) {
        const c = s.charAt(i);
        if (c === " ") {
            if (fSpace) {
                continue;
            } else {
                fSpace = true;
            }
        } else {
            fSpace = false;
        }
        res += c;
    }
    const rtrim = /(\s+)$/;
    res = res.replace(rtrim, "");
    return res;
}

/**
 * Splits command by SPACE, ignore SPACE into quotes
 */
function split_command(cmd: string) {
    const res: string[] = [];
    let found = false;
    let quote = false;
    let str = "";
    for (let i = 0; i < cmd.length; i++) {
        const char = cmd.charAt(i);
        if (char !== " " || quote) {
            if (char === "\"") {
                quote = !quote;
                continue;
            }
            found = true;
            str += char;
        } else {
            res.push(str);
            found = false;
            str = "";
        }
    }
    if (str) {
        res.push(str);
    }
    return res;
}

// tslint:disable-next-line:max-classes-per-file
export class Commander extends EventEmitter implements ICommand {
    public commands: ICommandArray = {};
    public options: IOptionArray = {};
    public name: string;

    public createCommand(name: string, desc: any): Command {
        const cmd = new Command(name, desc);
        cmd.createCommandHelp();
        this.commands[name] = cmd;
        return cmd;
    }

    public print(s: string) {
        // empty
    }

    public parse(cmd: string) {
        try {
            const command = Command.parse(cmd);
            if (command.commands.length) {
                let that = this;
                // Find command
                for (const i in command.commands) {
                    const item = command.commands[i];
                    if (item in that.commands) {
                        that = that.commands[item] as any;
                        if (that.name === "?") {
                            that.emit("call", {});
                            return;
                        }
                    } else {
                        throw new CommandError(that, `Unknown command in use '${item}'`);
                    }
                }

                const opt: { [longName: string]: string } = {};
                for (const i in that.options) {
                    const prop1 = that.options[i];
                    if (prop1.shortName! in command || prop1.longName in command) {
                        let prop2 = prop1.shortName! in command ? command[prop1.shortName!] : command[prop1.longName];
                        prop2 = prop1.set!(prop2);
                        if (core.isEmpty(prop2)) {
                            prop2 = prop1.value;
                        }
                        opt[prop1.longName] = prop2;
                    } else {
                        if (prop1.isRequired) {
                            throw new CommandError(that, `Parameter --${prop1.longName} is required`);
                        }
                        opt[prop1.longName] = prop1.value;
                    }
                }
                that.emit("call", opt);
            } else {
                if (command["name"]) {
                    this.emit("error", new Error(`Unknown command in use '${command["name"]}'`));
                }
            }
        } catch (e) {
            this.emit("error", e);
        }
    }
}

/**
 * formats text with paddings
 * @param  {string} text
 * @param  {number} size
 * @param  {string=""} spaceChar
 * @param  {boolean=false} end if true - puts padding chars to the end, else to the begin
 */
function pud(text: string, size: number, spaceChar: string = " ", end: boolean = false) {
    if (!spaceChar) { spaceChar = " "; }
    let res: string;
    let pad = "";
    if (text.length < size) {
        for (let i = 0; i < (size - text.length); i++) {
            pad += spaceChar;
        }
    }
    if (!end) {
        res = text + pad;
    } else {
        res = pad + text;
    }
    return res;
}

export let commander = new Commander();
