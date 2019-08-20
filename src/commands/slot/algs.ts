import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { SlotOption } from "../../options/slot";

import { AlgorithmsFlagsOption } from "../../options/algs_flags";
import { get_module } from "../module/helper";
import { print_slot_algs_header, print_slot_algs_row } from "./helper";

interface AlgorithmsOption {
    slot: graphene.Slot;
    flags: string;
}

export class AlgorithmsCommand extends Command {
    public name = "algs";
    public description = "Enumerates the supported algorithms";

    constructor(parent?: Command) {
        super(parent);

        this.options.push(new SlotOption());
        this.options.push(new AlgorithmsFlagsOption());
    }

    protected async onRun(params: AlgorithmsOption) {
        const mod = get_module();
        const slot = params.slot;

        const lAlg = slot.getMechanisms();

        console.log();
        print_slot_algs_header();
        for (let i = 0; i < lAlg.length; i++) {
            const alg = lAlg.items(i);
            const f = params.flags;
            let d = false;
            if (!d && f.indexOf("a") >= 0) {
                d = true;
            }
            if (!d && f.indexOf("h") >= 0 && alg.flags & graphene.MechanismFlag.DIGEST) {
                d = true;
            }
            if (!d && f.indexOf("s") >= 0 && alg.flags & graphene.MechanismFlag.SIGN) {
                d = true;
            }
            if (!d && f.indexOf("v") >= 0 && alg.flags & graphene.MechanismFlag.VERIFY) {
                d = true;
            }
            if (!d && f.indexOf("e") >= 0 && alg.flags & graphene.MechanismFlag.ENCRYPT) {
                d = true;
            }
            if (!d && f.indexOf("d") >= 0 && alg.flags & graphene.MechanismFlag.DECRYPT) {
                d = true;
            }
            if (!d && f.indexOf("w") >= 0 && alg.flags & graphene.MechanismFlag.WRAP) {
                d = true;
            }
            if (!d && f.indexOf("u") >= 0 && alg.flags & graphene.MechanismFlag.UNWRAP) {
                d = true;
            }
            if (!d && f.indexOf("g") >= 0 && (alg.flags & graphene.MechanismFlag.GENERATE || alg.flags & graphene.MechanismFlag.GENERATE_KEY_PAIR)) {
                d = true;
            }
            if (!d) {
                continue;
            }
            print_slot_algs_row(alg);
        }
        console.log();
        console.log("%s algorithm(s) in list", lAlg.length);
        console.log();

        return this;
    }

}
