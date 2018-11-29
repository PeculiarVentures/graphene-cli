import {get_module} from "../commands/module/helper";
import {Option} from "../options";

export class SlotOption extends Option {
    public name = "slot";
    public alias = "s";
    public description = "Slot index in Module";
    public isRequired = true;

    public parse(value?: string, args?: string[]) {
        const mod = get_module();
        let index = this.defaultValue;

        // search slot by label if flag provided
        if (args && (args.includes("--label") || args.includes("-l"))) {
            const slots = mod.getSlots();
            for (let i = 0; i < slots.length; i++) {
                const slot = slots.items(i);
                const token = slot.getToken();
                if (token.label === value) {
                    return slot;
                }
            }
            throw new Error(`Slot with label: ${this.name} is not found`);
        }
        if (value) {
            index = parseInt(value, 10);
        }

        if (isNaN(index)) {
            throw new Error(`Parameter --${this.name} is not a number`);
        }
        return mod.getSlots(index, true);
    }
}
