import { Command } from "../../command";
import { print_caption } from "../../helper";
import {Assoc} from "../../types";
import { get_module } from "../module/helper";
import { print_slot } from "./helper";

export class ListCommand extends Command {
    public name = "list";
    public description = "Enumerates the available slots";

    protected async onRun(options: Assoc<any>): Promise<Command> {
        const mod = get_module();
        const slots = mod.getSlots();

        print_caption("Slot list");
        console.log("Slot count:", slots.length);
        console.log();
        for (let i = 0; i < slots.length; i++) {
            const slot = slots.items(i);
            print_slot(slot);
        }

        return this;
    }
}
