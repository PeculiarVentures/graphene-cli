import * as graphene from "graphene-pk11";

import { gen } from "../../gen_helper";
import {TEST_KEY_LABEL} from "../../const";

export interface IGenThreadTestArgs {
    lib: string;
    prefix: string;
    postfix: string;
    slot: number;
    it: number;
    pin?: string;
    token: boolean;
}

export interface IGenThreadTestResult {
    type: string | "success" | "error";
    message: string;
    time: number;
}

if (process.send) {

    process.on("message", (args: IGenThreadTestArgs) => {
        let time = 0;
        try {
            const mod = graphene.Module.load(args.lib);

            mod.initialize();

            try {
                const slot = mod.getSlots(args.slot, true);

                const session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);

                if (args.pin) {
                    session.login(args.pin);
                }

                //#region Test
                const sTime = Date.now();
                for (let i = 0; i < args.it; i++) {
                    let name = `${TEST_KEY_LABEL}-${args.prefix}-${args.postfix}`
                    const key = gen[args.prefix][args.postfix](session, name, args.token);
                    //#region Destroy keys
                    // if (key instanceof graphene.SecretKey) {
                        // key.destroy();
                    // } else {
                        // key.privateKey.destroy();
                        // key.publicKey.destroy();
                    // }
                    //#endregion
                }
                const eTime = Date.now();
                time = (eTime - sTime) / 1000;
                //#endregion

                session.close();
            } catch (err) {
                mod.finalize();
                throw (err);
            }

            mod.finalize();
            process.send!({
                type: "success",
                time,
            } as IGenThreadTestResult);
        } catch (err) {
            console.error(err);
            process.send!({
                type: "error",
                message: err.message,
                time,
            } as IGenThreadTestResult);
        }
    });

}
