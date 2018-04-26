import * as fs from "fs";
import * as graphene from "graphene-pk11";
import { TEST_KEY_ID } from "../../const";
import { prepare_data } from "./sign_helper";

export interface ISignThreadTestArgs {
    lib: string;
    slot: number;
    it: number;
    pin?: string;
}

export interface ISignThreadTestResult {
    type: string | "success" | "error";
    message: string;
    time: number;
}

if (process.send) {

    process.on("message", (args: ISignThreadTestArgs) => {
        let time = 0;
        try {
            const mod = graphene.Module.load(args.lib);

            fs.writeFileSync("/tmp/g.log", "sign start\n", { flag: "a+" });

            mod.initialize();

            try {
                const slot = mod.getSlots(args.slot, true);

                const session = slot.open(graphene.SessionFlag.SERIAL_SESSION);

                if (args.pin) {
                    session.login(args.pin);
                }

                let key: graphene.Key | null = null;
                //#region Find signing key
                const objects = session.find({ id: TEST_KEY_ID });
                for (let i = 0; i < objects.length; i++) {
                    const obj = objects.items(i);
                    if (obj.class === graphene.ObjectClass.PRIVATE_KEY ||
                        obj.class === graphene.ObjectClass.SECRET_KEY
                    ) {
                        key = obj.toType<graphene.Key>();
                        break;
                    }
                }
                if (!key) {
                    throw new Error("Cannot find signing key");
                }
                //#endregion

                //#region Test
                const { alg, data } = prepare_data(key);

                const sTime = Date.now();
                for (let i = 0; i < args.it; i++) {
                    const sign = session.createSign(alg, key);
                    sign.once(data);
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
            fs.writeFileSync("/tmp/g.log", "sign end\n", { flag: "a+" });
            process.send!({
                type: "success",
                time,
            } as ISignThreadTestResult);
        } catch (err) {
            process.send!({
                type: "error",
                message: err.message,
                time,
            } as ISignThreadTestResult);
        }
    });

}
