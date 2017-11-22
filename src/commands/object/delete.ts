import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { readline } from "../../const";
import { Handle, print_caption } from "../../helper";
import { SlotOption } from "../../options/slot";
import { get_session } from "../slot/helper";
import { ObjectIdOption } from "./options/obj_id";
import { print_object_info } from "./helper";

interface DeleteOptions {
    oid?: string;
}

export class DeleteCommand extends Command {
    public name = "delete";
    public description = "Deletes an object from a slot";

    constructor(parent?: Command) {
        super(parent);

        this.options.push(new ObjectIdOption());
    }

    protected async onRun(params: DeleteOptions): Promise<Command> {
        const session = get_session();
        if (params.oid === undefined) {
            const answer = (await readline.question("Do you really want to remove ALL objects (Y/N)? ")).toLowerCase();
            if (answer && (answer === "yes" || answer === "y")) {
                session.destroy();
                console.log();
                console.log("All Objects were successfully removed");
                console.log();
            }
        } else {
            const obj = session.getObject<graphene.Storage>(Handle.toBuffer(params.oid));
            if (!obj) {
                throw new Error(`Object by ID '${params.oid}' is not found`);
            }

            // Print info about object
            print_caption(`Object info`);
            print_object_info(obj);
            console.log();

            const answer = await readline.question("Do you really want to remove this object (Y/N)? ");
            if (answer && (answer === "yes" || answer === "y")) {
                session.destroy(obj!);

                console.log();
                console.log("Object was successfully removed");
                console.log();
            }
        }

        return this;
    }

}