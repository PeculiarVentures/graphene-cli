#!/usr/bin/env node

import { Application } from "./application";
import {NonInteractive} from "./non_interactive";

async function main(args: string[]) {
    if(args.length>2){
        const app = new NonInteractive();
        await app.run(args);
    }else{
        const app = new Application();
        await app.run(args);
    }

}

main(process.argv)
    .catch((err) => {
        console.error(err);
    });
