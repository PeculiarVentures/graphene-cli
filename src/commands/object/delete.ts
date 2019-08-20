import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import {readline} from "../../const";
import { get_session } from "../slot/helper";
import { ObjectIdOption } from "./options/obj_id";
import {print_caption} from "../../helper";
import {print_object_info} from "./helper";

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

    protected async onRun(params: DeleteOptions,): Promise<Command> {
        const session = get_session();
        if(params.oid === undefined) {

            if(!this.sharedParams.nonInteractive){
                const answer = (await readline.question("Do you really want to remove ALL objects (Y/N)? ")).toLowerCase();
                if (answer && (answer !== "yes" && answer !== "y")) {
                    return this;
                }
            }
            session.destroy();
            if(!this.sharedParams.quiet){
                console.log();
                console.log("All Objects were successfully removed");
                console.log();
            }
        }else{
            const objects = session.find({id:Buffer.from(params.oid,'hex')});
            if (!objects) {
                throw new Error(`Object by ID '${params.oid}' is not found`);
            }
            if(!this.sharedParams.nonInteractive){
                const answer = (await readline.question("Do you really want to remove this object (Y/N)? ")).toLowerCase();
                if (answer && (answer !== "yes" && answer !== "y")) {
                    return this;
                }
            }
            // Print info about object
            if(!this.sharedParams.quiet) {
                print_caption(`Object info`);
            }
            for(var i=0;i<objects.length;i++){
                var object = objects.items(i).toType<graphene.Storage>();
                if(!this.sharedParams.quiet) {
                    print_object_info(object);
                }
                session.destroy(object!);
                if(!this.sharedParams.quiet) {
                    console.log('Object(s) deleted.');
                }
            }

        }
        return this;
    }

}
