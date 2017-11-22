import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { AlgorithmOption } from "../../options/alg";
import { SlotOption } from "../../options/slot";
import { print_slot_info, print_alg_info } from "./helper";
import { get_module } from "../module/helper";

interface InfoOptions {
    slot: graphene.Slot;
    alg?: string;
}

export class InfoCommand extends Command {
    public name = "info";
    public description = "Returns information about a specific slot";

    constructor(parent?: Command) {
        super(parent);

        this.options.push(new SlotOption());
        this.options.push(new AlgorithmOption());
    }

    protected async onRun(params: InfoOptions) {
        const mod = get_module();

        if (params.alg) {
            if (graphene.MechanismEnum[params.alg as any] !== undefined) {
                print_alg_info(params.slot, params.alg);
            } else {
                throw new Error("Unknown Algorithm name in use");
            }
        } else {
            print_slot_info(params.slot);
        }

        return this;
    }
}