import * as readline from "readline";
import { parse } from "./parser";

export class ReadLine {
    protected base: readline.ReadLine;

    constructor() {
        this.base = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    public async question(message: string) {
        return new Promise<string>((resolve, reject) => {
            this.base.question(message, (answer) => resolve(answer));
        });
    }

    public prompt(preserveCursor?: boolean) {
        return new Promise<string[]>((resolve, reject) => {
            this.base.once("line", (input: string) => {
                resolve(parse(input));
            });

            this.base.prompt(preserveCursor);
        });
    }

    public close() {
        this.base.close();
    }

}
