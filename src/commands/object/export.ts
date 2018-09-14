import * as graphene from "graphene-pk11";
import * as NodeRSA from "node-rsa";
import { Command } from "../../command";
import { Handle } from "../../helper";
import { get_session } from "../slot/helper";
import { printSecureObj} from "./helper";
import {KeyFormatOption} from "./options/KeyFormatOption";
import { ObjectIdOption } from "./options/obj_id";

interface ExportOptions {
    oid: string;
    format: NodeRSA.FormatPem;
}
export class ExportCommand extends Command {
    public name = "export";
    public description = "Prints information about an object";

    constructor(parent?: Command) {
        super(parent);
        const format = new KeyFormatOption();
        format.isRequired = true;
        const oid = new ObjectIdOption();
        oid.isRequired = true;
        this.options.push(oid);
        this.options.push(format);
    }

    protected async onRun(params: ExportOptions): Promise<Command> {
        const session = get_session();

        const obj = session.getObject<graphene.Storage>(Handle.toBuffer(params.oid));
        if (!obj) {
            throw new Error(`Object by ID '${params.oid}' is not found`);
        }

        console.log();
        printSecureObj(obj, params.format);
        console.log();

        return this;
    }

}
