import * as graphene from "graphene-pk11";
import { TEST_KEY_ID } from "../../const";
import { prepare_data } from "./sign_helper";

export interface IVerifyThreadTestArgs {
    lib: string;
    slot: number;
    it: number;
    pin?: string;
    /**
     * hex string
     */
    signature: string;
}

export interface IVerifyThreadTestResult {
    type: string | "success" | "error";
    message: string;
    time: number;
}

if (process.send) {

    process.on("message", (args: IVerifyThreadTestArgs) => {
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
                //#region Find key
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
                    throw new Error("Cannot find verifying key");
                }
                //#endregion

                //#region Test
                const {alg, data} = prepare_data(key);
                const signature = Buffer.from(args.signature, "hex");

                const sTime = Date.now();
                for (let i = 0; i < args.it; i++) {
                    const verify = session.createVerify(alg, key);
                    const ok = verify.once(data, signature);
                    if (!ok) {
                        throw new Error("Signature is invalid");
                    }
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
            } as IVerifyThreadTestResult);
        } catch (err) {
            process.send!({
                type: "error",
                message: err.message,
                time,
            } as IVerifyThreadTestResult);
        }
    });

}
