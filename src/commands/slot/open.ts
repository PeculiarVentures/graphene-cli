import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { data } from "../../data";

import { PinOption } from "../../options/pin";
import { ReadWriteOption } from "../../options/read_write";
import { SlotOption } from "../../options/slot";

interface OpenOptions {
    slot: graphene.Slot;
    pin: string;
    readWrite: boolean;
}

export class OpenCommand extends Command {
    public name = "open";
    public description = "Open a session to a slot";

    constructor(parent?: Command) {
        super(parent);

        this.options.push(new SlotOption());
        this.options.push(new PinOption());
        this.options.push(new ReadWriteOption());
    }

    protected async onRun(params: OpenOptions): Promise<Command> {
        let flags = graphene.SessionFlag.SERIAL_SESSION;
        if (params.readWrite) {
            flags |= graphene.SessionFlag.RW_SESSION;
        }
        data.session = params.slot.open(flags);

        if (params.pin) {
            data.session.login(params.pin);
        }

        return this;
    }

}
