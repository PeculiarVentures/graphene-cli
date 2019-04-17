import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import {readline} from "../../const";
import { get_session } from "../slot/helper";
import { ObjectIdOption } from "./options/obj_id";
import {print_caption} from "../../helper";
import {print_object_info} from "./helper";
import {Dynamic} from "../../dynamic";

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

            if(this.sharedParams.dynamic){
                session.destroy();
            }else{
                const answer = (await readline.question("Do you really want to remove ALL objects (Y/N)? ")).toLowerCase();
                if (answer && (answer === "yes" || answer === "y")) {
                    session.destroy();
                    console.log();
                    console.log("All Objects were successfully removed");
                    console.log();
                }
            }
        }else {
            const objects = session.find({id:Buffer.from(params.oid,'hex')});
            if (!objects) {
                throw new Error(`Object by ID '${params.oid}' is not found`);
            }
            if(this.sharedParams.dynamic){
                for(let i=0;i<objects.length;i++){
                    session.destroy(objects.items(i)!);
                }
            }else{
                const answer = (await readline.question("Do you really want to remove this object (Y/N)? ")).toLowerCase();
                if(answer&&(answer==='yes'||answer=='y')){
                    // Print info about object
                    print_caption(`Object info`);
                    for(var i=0;i<objects.length;i++){
                        var object = objects.items(i).toType<graphene.Storage>()
                        print_object_info(object);
                        session.destroy(objects.items(i)!);
                        console.log('Object(s) deleted.');
                    }
                }
            }
        }
        return this;
    }

}
