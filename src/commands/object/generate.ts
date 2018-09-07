import * as graphene from "graphene-pk11";

import {Command} from "../../command";
import {Assoc} from "../../types";
import {get_session} from "../slot/helper";

export class GenerateCommand extends Command {
    public name = "gen";
    public description = "Generates key in provider";

    protected async onRun(options: Assoc<any>): Promise<Command> {
        const session = get_session();

        // create secret key
        session.generateKeyPair(graphene.KeyGenMechanism.RSA, {
                label: "MY RSA KEY",
                id: new Buffer([1, 2, 3, 4, 5]), // uniquer id for keys in storage https://www.cryptsoft.com/pkcs11doc/v230/group__SEC__9__7__KEY__OBJECTS.html
                token: true, // flag for writing key to token
                // publicExponent: new Buffer([1, 0, 1]),
                modulusBits: 2048,
                encrypt: true,
                verify: true,
            },
            {
                label: "MY RSA KEY",
                id: new Buffer([1, 2, 3, 4, 5]),
                private: true,
                token: true,
                decrypt: true,
                sign: true,
                extractable: true,
            });

        return this;
    }
}
