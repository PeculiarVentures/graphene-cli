import * as fs from "fs";
import * as graphene from "graphene-pk11";

import { encode } from "punycode";
import { Command } from "../../command";
import { AlgorithmOption } from "../../options/alg";
import { SlotOption } from "../../options/slot";
import { InputOption } from "./options/input";

interface HashOptions {
    slot: graphene.Slot;
    alg: string;
    in: string;
}

export class HashCommand extends Command {
    public name = "hash";
    public description = "Computes a hash for a given file";

    constructor(parent?: Command) {
        super(parent);

        this.options.push(new SlotOption());
        const algOption = new AlgorithmOption();
        algOption.defaultValue = "SHA1";
        this.options.push(algOption);
        this.options.push(new InputOption());
    }

    protected async onRun(params: HashOptions): Promise<Command> {
        const data = fs.readFileSync(params.in, {encoding: "binary"});

        const session = params.slot.open(graphene.SessionFlag.SERIAL_SESSION);
        let hash: string | null = null;
        try {
            const digest = session.createDigest(params.alg);
            hash = digest.once(data).toString("hex");
        } catch (err) {
            session.close();

            throw err;
        }
        session.close();

        console.log(hash);

        return this;
    }

}
