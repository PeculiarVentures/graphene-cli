#!/usr/bin/env node

import { Application } from "./application";

async function main(args: string[]) {
    const app = new Application();
    await app.run(args);
}

main(process.argv)
    .catch((err) => {
        console.error(err);
    });
