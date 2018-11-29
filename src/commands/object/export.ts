import {createWriteStream} from "fs";
import {ObjectClass, SessionObject, Storage} from "graphene-pk11";
import * as NodeRSA from "node-rsa";
import {join} from "path";
import {Command} from "../../command";
import {Handle} from "../../helper";
import {NameOption} from "../../options/name";
import {PathOption} from "../../options/PathOption";
import {get_session} from "../slot/helper";
import {writeSecureObj} from "./helper";
import {KeyFormatOption} from "./options/KeyFormatOption";
import {KeyLabelOption} from "./options/KeyLabelOption";
import {ObjectIdOption} from "./options/obj_id";

interface ExportOptions {
    oid?: string;
    format: NodeRSA.FormatPem;
    label?: string;
    path?: string;
    name: string;
}

export class ExportCommand extends Command {
    public name = "export";
    public description = "Prints information about an object";

    constructor(parent?: Command) {
        super(parent);
        const format = new KeyFormatOption();
        format.defaultValue = "pkcs8-public";
        const oid = new ObjectIdOption();
        const label = new KeyLabelOption();
        const path = new PathOption();
        const name = new NameOption();
        name.defaultValue = "rsa001.pub";
        name.isRequired = false;
        this.options.push(name);
        this.options.push(path);
        this.options.push(label);
        this.options.push(oid);
        this.options.push(format);
    }

    protected async onRun(params: ExportOptions): Promise<Command> {

        const key = this.findKey(params);
        if (!params.path) {
            await writeSecureObj(key as Storage, params.format);
            return this;
        }
        const path = join(params.path, params.name);
        const ws = createWriteStream(path);
        await writeSecureObj(key as Storage, params.format, ws);
        ws.close();
        console.log(`Key was saved ${path}`);
        return this;
    }

    private findKey(params: ExportOptions): Storage {
        const session = get_session();
        if (params.oid) {
            const obj = session.getObject<Storage>(Handle.toBuffer(params.oid));
            if (!obj) {
                throw new Error(`Object by ID '${params.oid}' is not found`);
            }
            return obj;
        } else if (params.label) {
            const keys = session.find({
                    label: params.label,
                    class:  params.format.includes("public") ? ObjectClass.PUBLIC_KEY : ObjectClass.PRIVATE_KEY,
                },
                (obj: SessionObject, index: number) => ++index);
            return keys.items(0) as Storage;
        } else {
            throw  new Error(`Parameter 'label' or 'oid' ned to be provided`);
        }
    }

}
