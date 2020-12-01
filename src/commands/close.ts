import { Command } from "../command";
import * as c from "../const";
import {data} from "../data";

export class CloseCommand extends Command {

    public name = "exit";
    public description = "Close CLI application";

    public async onRun(args: string[]) {
        if (data.module) {
            data.module.close();
            delete data.module;
        }
        c.readline.close();
        return this;
    }

}
