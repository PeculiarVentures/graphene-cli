import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { get_session } from "../slot/helper";
import { print_object_header, print_object_row } from "./helper";
import { TypeOption } from "./options/type";

interface ListOptions {
    type: string;
}

export class ListCommand extends Command {
    public name = "list";
    public description = "Enumerates the objects in a given slot";

    constructor(parent?: Command) {
        super(parent);

        this.options.push(new TypeOption());
    }

    protected async onRun(params: ListOptions): Promise<Command> {
        const session = get_session();

        const objList = session.find();
        console.log();
        print_object_header();
        const objPrintList: graphene.SessionObject[] = [];
        for (let i = 0; i < objList.length; i++) {
            const obj = objList.items(i);
            if ((params.type === "all") ||
                (params.type === "cert" && obj.class === graphene.ObjectClass.CERTIFICATE) ||
                (params.type === "key" && (
                    obj.class === graphene.ObjectClass.PRIVATE_KEY ||
                    obj.class === graphene.ObjectClass.PUBLIC_KEY ||
                    obj.class === graphene.ObjectClass.SECRET_KEY
                ))) {
                objPrintList.push(obj);
            }
        }
        objPrintList.forEach((obj) => {
            print_object_row(obj.toType<graphene.Storage>());
        });
        console.log();
        console.log("%s object(s) in list", objPrintList.length);
        console.log();

        return this;
    }

}