import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { get_session } from "../slot/helper";
import { ObjectIdOption } from "./options/obj_id";
import { Handle } from "../../helper";
import { print_object_info } from "./helper";

interface InfoOptions {
    oid: string;
}

export class InfoCommand extends Command {
    public name = "info";
    public description = "Prints information about an object";

    constructor(parent?: Command) {
        super(parent);

        const oid = new ObjectIdOption();
        oid.isRequired = true;
        this.options.push(oid);
    }

    protected async onRun(params: InfoOptions): Promise<Command> {
        const session = get_session();

        const obj = session.getObject<graphene.Storage>(Handle.toBuffer(params.oid));
        if (!obj) {
            throw new Error(`Object by ID '${params.oid}' is not found`);
        }

        console.log();
        print_object_info(obj);
        console.log();

        return this;
    }



}