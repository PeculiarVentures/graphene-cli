import {readFile} from "fs";
import NodeRSA = require("node-rsa");
import {promisify} from "util";
import {Command} from "../../command";
import {importRSAPrivateKey, importRSAPublicKey} from "../../helper";
import {PathOption} from "../../options/PathOption";
import {Assoc} from "../../types";
import {get_session} from "../slot/helper";
import {KeyFormatOption} from "./options/KeyFormatOption";
import {KeyLabelOption} from "./options/KeyLabelOption";

const readFilAsync = promisify(readFile);
export class ImportCommand extends Command {
    public name = "import";
    public description = "import private key in HSM";
    constructor(parent?: Command) {
        super(parent);

        const format = new KeyFormatOption();
        const path = new PathOption();
        const label = new KeyLabelOption();
        path.isRequired = true;
        format.isRequired = true;
        label.isRequired = true;
        this.options.push(format);
        this.options.push(path);
        this.options.push(label);
    }
    protected async onRun(options: Assoc<any>): Promise<Command> {
        const session = get_session();
        const file = await readFilAsync(options.path);
        if ((options.format as string).includes("public")) {
            importRSAPublicKey(session, (new NodeRSA(file, options.format)),
                options.label, true, ["encrypt"]);
        } else {
            importRSAPrivateKey(session, (new NodeRSA(file, options.format)),
                options.label, true, ["decrypt"]);
        }
        return this;
    }
}
