import * as graphene from "graphene-pk11";

import {randomBytes} from "crypto";
import {Command} from "../../command";
import {PathOption} from "../../options/PathOption";
import {Assoc} from "../../types";
import {get_session} from "../slot/helper";
import {KeyFormatOption} from "./options/KeyFormatOption";
import {KeyLabelOption} from "./options/KeyLabelOption";

export class GenerateCommand extends Command {
    public name = "gen";
    public description = "Generates key in provider";
    constructor(parent?: Command) {
        super(parent);

        const label = new KeyLabelOption();
        label.isRequired = true;
        this.options.push(label);
    }
    protected async onRun(options: Assoc<any>): Promise<Command> {
        const session = get_session();

        // create secret key
        const {privateKey, publicKey} = session.generateKeyPair(graphene.KeyGenMechanism.RSA, {
                label: options.label,
                id: randomBytes(20), // uniquer id for keys in storage https://www.cryptsoft.com/pkcs11doc/v230/group__SEC__9__7__KEY__OBJECTS.html
                token: true, // flag for writing key to token
                modulusBits: 2048,
                encrypt: true,
                verify: true,
            },
            {
                label: options.label,
                id: randomBytes(20),
                private: true,
                token: true,
                decrypt: true,
                sign: true,
                extractable: true,
            });
        console.log(privateKey);
        return this;
    }
}
