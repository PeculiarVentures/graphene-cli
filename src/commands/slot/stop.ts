import { Command } from "../../command";
import { data } from "../../data";
import {Assoc} from "../../types";
import { get_session } from "./helper";

export class StopCommand extends Command {
    public name = "stop";
    public description = "Closes the open session";

    protected async onRun(options: Assoc<any>): Promise<Command> {
        const session = get_session();
        session.close();

        delete data.session;
        return this;
    }

}
