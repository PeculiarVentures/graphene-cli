import * as graphene from "graphene-pk11";

import {randomBytes} from "crypto";
import {Command} from "../../command";
import {Handle} from "../../helper";
import {PathOption} from "../../options/PathOption";
import {Assoc} from "../../types";
import {get_session} from "../slot/helper";
import {GenerateIfNotExist} from "./options/IfNotExist";
import {KeyFormatOption} from "./options/KeyFormatOption";
import {KeyLabelOption} from "./options/KeyLabelOption";
import Session = GraphenePkcs11.Session;
import IKeyPair = GraphenePkcs11.IKeyPair;

export class GenerateCommand extends Command {
    private static genKeyPair(label: string): IKeyPair {
        const session = get_session();
        return session.generateKeyPair(graphene.KeyGenMechanism.RSA, {
                label,
                id: randomBytes(20), // uniquer id for keys in storage https://www.cryptsoft.com/pkcs11doc/v230/group__SEC__9__7__KEY__OBJECTS.html
                token: true, // flag for writing key to token
                modulusBits: 2048,
                encrypt: true,
                verify: true,
            },
            {
                label,
                id: randomBytes(20),
                private: true,
                token: true,
                decrypt: true,
                sign: true,
                extractable: true,
            });
    }
    public name = "gen";
    public description = "Generates key in provider";
    constructor(parent?: Command) {
        super(parent);

        const label = new KeyLabelOption();
        label.isRequired = true;
        const genIfExist = new GenerateIfNotExist();
        genIfExist.defaultValue = true;
        this.options.push(label);
        this.options.push(genIfExist);
    }
    protected async onRun(options: Assoc<any>): Promise<Command> {
        const session = get_session();
        if (options.exist === "false") {
            const obj = session.find({label: options.label});
            if (obj.length >= 2) {
                console.log(`Object with this Label exist,`);
                return this;
            }
        }
        // create secret key
        const {privateKey, publicKey} = GenerateCommand.genKeyPair(options.label);
        console.log(publicKey);
        return this;
    }
}
