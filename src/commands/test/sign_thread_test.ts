import * as graphene from "graphene-pk11";
import { TEST_KEY_ID } from '../../const';

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
                let alg: graphene.MechanismType;
                let data = new Buffer(0);
                switch (key.type) {
                    case graphene.KeyType.RSA:
                        alg = graphene.MechanismEnum.RSA_PKCS;
                        data = new Buffer([
                            // PKCS1 v1.5 padding
                            0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20,
                            // SHA-256
                            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
                            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
                            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
                            0x01, 0x02,
                        ]);
                        break;
                    case graphene.KeyType.ECDSA:
                        alg = graphene.MechanismEnum.ECDSA;
                        data = new Buffer([
                            // SHA-256
                            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
                            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
                            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
                            0x01, 0x02,
                        ]);
                        break;
                    default:
                        throw new Error("Unsupported KeyType in use");
                }

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
