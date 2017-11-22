import { get_module } from "../commands/module/helper";
import { Option } from "../options";

export class SlotOption extends Option {
    public name = "slot";
    public alias = "s";
    public description = "Slot index in Module";
    public isRequired = true;

    public parse(value?: string) {
        const mod = get_module();
        let index = this.defaultValue;
        if (value) {
            index = parseInt(value, 10);
        }
        if (isNaN(index)) {
            throw new Error(`Parameter --${this.name} is not a number`);
        }
        return mod.getSlots(index, true);
    }
}
