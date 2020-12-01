#!/usr/bin/env node

import { Application } from "./application";
import { data } from "./data";
import { NonInteractive } from "./non_interactive";

async function main(args: string[]) {
    if (args.length > 2) {
        const app = new NonInteractive();
        await app.run(args);
    } else {
        const app = new Application();
        await app.run(args);
    }

}

process.on("beforeExit", () => {
    if (data.module) {
        data.module.close();
        delete data.module;
    }
});

main(process.argv)
    .catch((err) => {
        console.error(err);
    });
