import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { TEST_KEY_LABEL } from "../../const";
import { lpad, rpad } from "../../helper";
import { gen } from "./gen";
import { check_sign_algs, open_session, TestOptions, delete_test_keys } from "./helper";

import { PinOption } from "../../options/pin";
import { SlotOption } from "../../options/slot";
import { AlgorithmOption } from "./options/alg";
import { BufferOption } from "./options/buffer";
import { IterationOption } from "./options/iteration";
import { ThreadOption } from "./options/thread";
import { TokenOption } from "./options/token";
import { Data } from "graphene-pk11";

async function test_sign(params: SignOptions, prefix: string, postfix: string, signAlg: string, digestAlg?: string) {
    try {
        const alg = prefix + "-" + postfix;
        if (params.alg === "all" || params.alg === prefix || params.alg === alg) {
            delete_test_keys(params);

            const session = open_session(params);
            try {
                await gen[prefix][postfix](session, params.token);
            } catch (err) {
                session.close();
                throw err;
            }
            session.close();

            // create buffer
            const buf = new Buffer(params.buf);

            let sig: Buffer;
            let data = buf;
            if (digestAlg) {
                const digest = session.createDigest(digestAlg);
                data = digest.once(buf);
            }
            /**
             * TODO: We need to determine why the first call to the device is so much slower,
             * it may be the FFI initialization. For now we will exclude this one call from results.
             */
            await test_sign_operation(params, data, signAlg);

            const sTime = new Date();
            const promises: Array<Promise<number>> = [];
            for (let i = 1; i < params.thread; i++) {
                promises.push(test_sign_operation(params, data, signAlg));
            }

            const times = await Promise.all(promises);

            const eTime = new Date();
            const time = eTime.getTime() - sTime.getTime();

            console.log("Times:", times.length);
            console.log("Times:", times.join(","));
            console.log("Total:", time);

            // const t2 = new defs.Timer();
            // t2.start();
            // for (let i = 0; i < cmd.it; i++) {
            //     test_verify_operation(session, data, key, signAlg, sig);
            // }
            // t2.stop();

            // const r1 = Math.round((t1.time / cmd.it) * 1000) / 1000 + "ms";
            // const r2 = Math.round((t2.time / cmd.it) * 1000) / 1000 + "ms";
            // const rs1 = Math.round((1000 / (t1.time / cmd.it)) * 1000) / 1000;
            // const rs2 = Math.round((1000 / (t2.time / cmd.it)) * 1000) / 1000;
            // print_test_sign_row(alg, r1, r2, rs1, rs2);

            delete_test_keys(params);
        }
        return true;
    } catch (e) {
        console.log(e.message);
        // debug("%s-%s\n  %s", prefix, postfix, e.message);
    }
    return false;
}

async function test_sign_operation(params: SignOptions, buf: Buffer, signAlg: string) {
    let key: graphene.Key | null = null;

    const session = open_session(params);

    //#region Find signing key
    const keys = session.find({ label: TEST_KEY_LABEL });
    for (let i = 0; i < keys.length; i++) {
        const item = keys.items(i).toType();
        if (item.class === graphene.ObjectClass.PRIVATE_KEY || item.class === graphene.ObjectClass.SECRET_KEY) {
            key = item.toType<graphene.Key>();
            break;
        }
    }
    if (!key) {
        throw new Error("Cannot find test signing key");
    }
    //#endregion

    const sTime = new Date();
    for (let i = 0; i < params.it; i++) {
        const sig = session.createSign(signAlg, key);
        await new Promise<Buffer>((resolve, reject) => {
            sig.once(buf, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    const eTime = new Date();
    session.close();

    const time = eTime.getTime() - sTime.getTime();
    console.log("Time: %d, operation(time/%d): %d", time, params.it, time / params.it);
    return time;
}

function print_test_sign_header() {
    console.log("| %s | %s | %s | %s | %s |", rpad("Algorithm", 25), lpad("Sign", 8), lpad("Verify", 8), lpad("Sign/s", 9), lpad("Verify/s", 9));
    console.log("|%s|%s:|%s:|%s:|%s:|", rpad("", 27, "-"), rpad("", 9, "-"), rpad("", 9, "-"), rpad("", 10, "-"), rpad("", 10, "-"));
}

interface SignOptions extends TestOptions {
    buf: number;
    thread: number;
}

export class SignCommand extends Command {
    public name = "sign";
    public description = [
        "test sign and verification performance",
        "",
        "Supported algorithms:",
        "  rsa, rsa-1024, rsa-2048, rsa-4096,",
        "  ecdsa, ecdsa-secp160r1, ecdsa-secp192r1,",
        "  ecdsa-secp256r1, ecdsa-secp384r1,",
        "  ecdsa-secp256k1, ecdsa-brainpoolP192r1, ecdsa-brainpoolP224r1,",
        "  ecdsa-brainpoolP256r1, ecdsa-brainpoolP320r1",
    ];

    constructor(parent?: Command) {
        super(parent);

        // --slot
        this.options.push(new SlotOption());
        // --alg
        this.options.push(new AlgorithmOption());
        // --pin
        this.options.push(new PinOption());
        // --it
        this.options.push(new IterationOption());
        // --token
        this.options.push(new TokenOption());
        // --buf
        this.options.push(new BufferOption());
        // --thread
        this.options.push(new ThreadOption());
    }

    protected async onRun(params: SignOptions): Promise<Command> {
        if (!check_sign_algs(params.alg)) {
            throw new Error("No such algorithm");
        }
        console.log();
        print_test_sign_header();

        await test_sign(params, "rsa", "1024", "SHA1_RSA_PKCS");
        await test_sign(params, "rsa", "2048", "SHA1_RSA_PKCS");
        await test_sign(params, "rsa", "4096", "SHA1_RSA_PKCS");
        await test_sign(params, "ecdsa", "secp160r1", "ECDSA_SHA1");
        await test_sign(params, "ecdsa", "secp192r1", "ECDSA", "SHA256");
        await test_sign(params, "ecdsa", "secp256r1", "ECDSA", "SHA256");
        await test_sign(params, "ecdsa", "secp384r1", "ECDSA", "SHA256");
        await test_sign(params, "ecdsa", "secp256k1", "ECDSA", "SHA256");
        await test_sign(params, "ecdsa", "brainpoolP192r1", "ECDSA", "SHA256");
        await test_sign(params, "ecdsa", "brainpoolP224r1", "ECDSA", "SHA256");
        await test_sign(params, "ecdsa", "brainpoolP256r1", "ECDSA", "SHA256");
        await test_sign(params, "ecdsa", "brainpoolP320r1", "ECDSA", "SHA256");
        console.log();

        return this;
    }

}
