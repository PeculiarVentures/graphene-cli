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

            const sTime = Date.now();
            const promises: Array<Promise<{ sign: number, verify: number }>> = [];
            for (let i = 1; i < params.thread; i++) {
                promises.push(test_sign_operation(params, data, signAlg));
            }

            await Promise.all(promises)
                .then((threads) => {
                    const sum = threads.reduce((p, c) => {
                        return {
                            sign: p.sign + c.sign,
                            verify: p.verify + c.verify,
                        };
                    });
                    const it = params.it * params.thread;
                    const signPerSec = it / sum.sign;
                    const verifyPerSec = it / sum.verify;
                    console.log("|%s|%s|%s|%s|%s|", rpad(params.alg, 27), lpad((sum.sign / it).toFixed(3), 10), lpad((sum.verify/it).toFixed(3), 10), lpad(signPerSec.toFixed(3), 11), lpad(verifyPerSec.toFixed(3), 11));
                });

            const eTime = Date.now();
            const time = eTime - sTime;

            // console.log("Total: %d", time);

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
    let signKey: graphene.Key | null = null;
    let verifyKey: graphene.Key | null = null;
    let signingTime = 0;
    let verifyingTime = 0;

    const session = open_session(params);

    //#region Find signing key
    {
        const keys = session.find({ label: TEST_KEY_LABEL });
        for (let i = 0; i < keys.length; i++) {
            const item = keys.items(i).toType();
            if (item.class === graphene.ObjectClass.PRIVATE_KEY || item.class === graphene.ObjectClass.SECRET_KEY) {
                signKey = item.toType<graphene.Key>();
                break;
            }
        }
        if (!signKey) {
            throw new Error("Cannot find test signing key");
        }
    }
    //#endregion
    //#region Find signing key
    {
        const keys = session.find({ label: TEST_KEY_LABEL });
        for (let i = 0; i < keys.length; i++) {
            const item = keys.items(i).toType();
            if (item.class === graphene.ObjectClass.PUBLIC_KEY || item.class === graphene.ObjectClass.SECRET_KEY) {
                verifyKey = item.toType<graphene.Key>();
                break;
            }
        }
        if (!verifyKey) {
            throw new Error("Cannot find test verifying key");
        }
    }
    //#endregion

    let signature: Buffer;

    //#region Sign
    {
        const sTime = Date.now();
        for (let i = 0; i < params.it; i++) {
            const sig = session.createSign(signAlg, signKey);
            await new Promise<Buffer>((resolve, reject) => {
                sig.once(buf, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        signature = data;
                        resolve(data);
                    }
                });
            });
        }
        const eTime = Date.now();
        signingTime = (eTime - sTime) / 1000;
    }
    //#endregion

    //#region Verify
    {
        const sTime = Date.now();
        for (let i = 0; i < params.it; i++) {
            const sig = session.createVerify(signAlg, verifyKey);
            await new Promise<boolean>((resolve, reject) => {
                sig.once(buf, signature, (err, ok) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (!ok) {
                            reject(new Error("Signature is invalid"));
                        } else {
                            resolve(true);
                        }
                    }
                });
            });
        }
        const eTime = Date.now();
        verifyingTime = (eTime - sTime) / 1000;
    }
    //#endregion

    session.close();

    const signPerSec = params.it / signingTime;
    const verifyingPerSec = params.it / verifyingTime;
    return {
        sign: signingTime,
        verify: verifyingTime,
    }
    // console.log("|%s|%s|%s|%s|%s|", rpad(params.alg, 27), lpad((signingTime).toFixed(3), 10), lpad(verifyingTime.toFixed(3), 10), lpad(signPerSec.toFixed(3), 11), lpad(verifyingPerSec.toFixed(3), 11));
    // console.log("Time: %d, operation(time/%d): %d", time, params.it, time / params.it);
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
