import { Command } from "../command";
import * as c from "../const";

export class CloseCommand extends Command {

    public name = "exit";
    public description = "Close CLI application";

    public async onRun(args: string[]) {
        c.readline.close();
        return this;
    }

}
