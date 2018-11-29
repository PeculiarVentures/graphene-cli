import * as graphene from "graphene-pk11";
import { TEST_KEY_ID } from "../../const";
import { prepare_data } from "./enc_helper";

export interface IDecThreadTestArgs {
    lib: string;
    slot: number;
    it: number;
    pin?: string;
    mech: graphene.MechanismEnum;
    message: string;
}

export interface IDecThreadTestResult {
    type: string | "success" | "error";
    message: string;
    time: number;
}

if (process.send) {

    process.on("message", (args: IDecThreadTestArgs) => {
        let time = 0;
        try {
            const mod = graphene.Module.load(args.lib);

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
                    if (obj.class === graphene.ObjectClass.PUBLIC_KEY ||
                        obj.class === graphene.ObjectClass.SECRET_KEY
                    ) {
                        key = obj.toType<graphene.Key>();
                        break;
                    }
                }
                if (!key) {
                    throw new Error("Cannot find encrypting key");
                }
                //#endregion

                //#region Test
                const { alg } = prepare_data(key, args.mech);
                const decBuffer = Buffer.alloc(args.message.length);
                const encBuf = Buffer.from(args.message, "hex");

                const sTime = Date.now();
                for (let i = 0; i < args.it; i++) {
                    const enc = session.createDecipher(alg, key);
                    enc.once(encBuf, decBuffer);
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
            } as IDecThreadTestResult);
        } catch (err) {
            process.send!({
                type: "error",
                message: err.message,
                time,
            } as IDecThreadTestResult);
        }
    });

}
