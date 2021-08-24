import * as graphene from "graphene-pk11";
import * as fs from "fs";

import { Command } from "../../command";
import { data } from "../../data";
import { ConfigOption } from "../../options/config";

import { LibraryOption } from "../../options/library";
import { NameOption } from "../../options/name";
import { get_module, print_module_info } from "./helper";
import { print_slot } from "../slot/helper";

interface LoadOptions {
    lib?: string;
    name?: string;
    config?: string;
}

interface JsonConfig {
    lib: string;
    libName?: string;
    slot?: number;
    pin?: string;
    readWrite?: boolean;
}

export class LoadCommand extends Command {
    public name = "load";
    public description = "loads a specified PKCS#11 module";

    constructor(parent: Command) {
        super(parent);

        this.options.push(new LibraryOption());
        this.options.push(new NameOption());
        this.options.push(new ConfigOption());
    }

    protected readConfigFile(filePath: string): JsonConfig {
        try {
            const jsonFile = fs.readFileSync(filePath, { encoding: "utf-8" });

            const json = JSON.parse(jsonFile) as JsonConfig;

            if (typeof json !== "object") {
                throw new TypeError("Wrong type of JSON object.");
            }

            if (!(json.lib && typeof json.lib === "string")) {
                throw new TypeError("Filed 'lib' is required and must be a string.")
            }

            if (json.libName !== undefined && typeof json.libName !== "string") {
                throw new TypeError("Filed 'libName' must be a string.")
            }

            if (json.pin !== undefined && typeof json.pin !== "string") {
                throw new TypeError("Filed 'pin' must be a string.")
            }

            if (json.slot !== undefined && typeof json.slot !== "number") {
                throw new TypeError("Filed 'slot' must be a number.")
            }

            if (json.readWrite !== undefined && typeof json.readWrite !== "boolean") {
                throw new TypeError("Filed 'readWrite' must be a boolean.")
            }

            return json;
        } catch (e) {
            e.message = `Error on config file reading. ${e.message}`;
            throw e;
        }
    }

    protected async onRun(args: LoadOptions): Promise<Command> {
        if (data.module) {
            data.module.finalize();
        }
        if (args.config) {
            const config = this.readConfigFile(args.config);

            data.module = graphene.Module.load(config.lib, config.libName);
            data.module.initialize();

            const slot = data.module.getSlots(config.slot || 0, true);

            let sessionFlag = graphene.SessionFlag.SERIAL_SESSION;
            if (config.readWrite) {
                sessionFlag |= graphene.SessionFlag.RW_SESSION;
            }

            data.session = slot.open(sessionFlag);

            if (config.pin) {
                data.session.login(config.pin);
            }

            if (!this.sharedParams.quiet) {
                print_module_info(data.module);
                print_slot(slot);
            }
        } else {
            if (!args.lib) {
                throw new TypeError("Cannot find required parameter 'lib'.");
            }

            data.module = graphene.Module.load(args.lib, args.name);
            data.module.initialize();

            if (!this.sharedParams.quiet) {
                print_module_info(data.module);
            }
        }

        return this;
    }

}
