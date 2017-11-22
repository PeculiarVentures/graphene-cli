import { Command } from "../command";

export class VersionCommand extends Command {
    public name = "version";
    public description = "Prints version of application";

    protected async onRun(params: {}) {
        console.log(`v${require("../../package.json").version}`);
        return this;
    }

}
