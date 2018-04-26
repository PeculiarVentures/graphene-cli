import { Command } from "../command";
import * as c from "../const";
import { pad, print_description } from "../helper";

export class HelpCommand extends Command {

    public name = "?";
    public description = "Prints help information";

    public async onRun(args: string[]) {
        console.log();
        console.log("Help:");
        if (this.parent) {
            // Print info about this command
            console.log(`  ${print_description(this.parent.description, 2)}`);
            console.log();
            if (this.parent.options.length) {
                this.parent.options.forEach((option) => {
                    console.log(`  ${pad(`--${option.name}`, c.NAME_PAD_SIZE)} ${pad(`-${option.alias}`, c.ALIAS_PAD_SIZE)} ${print_description(option.description, c.ALIAS_PAD_SIZE + c.NAME_PAD_SIZE + 4)}`);
                });
                console.log();
            }
            if (this.parent.commands.length) {
                // Print command list
                console.log("  Commands:");
                this.parent.commands.forEach((command) => {
                    console.log(`    ${pad(command.name, c.NAME_PAD_SIZE)} ${print_description(command.description, c.NAME_PAD_SIZE + 5)}`);
                });
            }
        }
        console.log();

        return this;
    }

}
