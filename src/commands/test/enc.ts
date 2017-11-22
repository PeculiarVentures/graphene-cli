import { Command } from "../../command";

export class EncryptCommand extends Command {
    public name = "enc";
    public description = [
        "test encryption and decryption performance",
        "",
        "Supported algorithms:",
        "  aes, aes-cbc128, aes-cbc192, aes-cbc256",
        "  aes-gcm128, aes-gcm192, aes-gcm256",
    ];

    constructor(parent?: Command) {
        super(parent);

        this.options.push();
    }

    protected async onRun(options: Assoc<any>): Promise<Command> {
        throw new Error("Method not implemented.");
    }

}