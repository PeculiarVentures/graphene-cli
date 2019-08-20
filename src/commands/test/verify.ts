import { fork } from "child_process";
import * as graphene from "graphene-pk11";
import * as path from "path";

import * as Color from "../../color";
import { Command } from "../../command";
import { lpad, rpad } from "../../helper";
import { gen } from "../../gen_helper";
import { check_sign_algs, delete_test_keys, open_session, TestOptions } from "./helper";
import { prepare_data } from "./sign_helper";
import { IVerifyThreadTestArgs, IVerifyThreadTestResult } from "./verify_thread_test";

import { PinOption } from "../../options/pin";
import { SlotOption } from "../../options/slot";
import { AlgorithmOption } from "./options/alg";
import { IterationOption } from "./options/iteration";
import { ThreadOption } from "./options/thread";
import {TEST_KEY_LABEL} from "../../const";

async function test_verify(params: TestOptions, prefix: string, postfix: string, signAlg: string, digestAlg?: string) {
    try {
        const testAlg = prefix + "-" + postfix;
        if (params.alg === "all" || params.alg === prefix || params.alg === testAlg) {
            delete_test_keys(params);

            const session = open_session(params);
            let keys: graphene.IKeyPair;
            try {
                let name = `${TEST_KEY_LABEL}-${testAlg}`;
                keys = gen[prefix][postfix](session, name, true) as graphene.IKeyPair;
            } catch (err) {
                session.close();
                throw err;
            }

            //#region Compute test signature
            const { alg, data } = prepare_data(keys.privateKey);
            const signature = session
                .createSign(alg, keys.privateKey)
                .once(data).toString("hex");
            //#endregion

            session.close();

            const promises: Array<Promise<number>> = [];
            for (let i = 0; i < params.thread; i++) {
                promises.push(verify_test_run(params, signature));
            }

            try {
                const totalIt = params.it * params.thread;
                const sTime = Date.now();
                const time = await Promise.all(promises)
                    .then((times) => {
                        const eTime = Date.now();
                        const time = (eTime - sTime) / 1000;
                        const totalTime = times.reduce((p, c) => p + c);
                        return { time, totalTime };
                    });

                print_test_sign_row(
                    testAlg,
                    time.totalTime / totalIt,
                    totalIt / time.time,
                );
            } catch (err) {
                console.log(`${Color.FgRed}Error${Color.Reset}`, testAlg.toUpperCase(), err.message);
            }
            delete_test_keys(params);
        }
    } catch (e) {
        console.log(`${Color.FgRed}Error${Color.Reset}`, e.message);
    }
}

async function verify_test_run(params: TestOptions, signature: string) {
    return new Promise<number>((resolve, reject) => {
        const test = fork(path.join(__dirname, "verify_thread_test.js"))
            .on("error", () => {
                if (!test.killed) {
                    test.kill();
                }
                reject();
            })
            .on("message", (res: IVerifyThreadTestResult) => {
                if (!test.killed) {
                    test.kill();
                }
                if (res.type === "error") {
                    reject(new Error(`Cannot run verify test. ${res.message}`));
                } else {
                    resolve(res.time);
                }
            });

        test.send({
            it: params.it,
            lib: params.slot.module.libFile,
            slot: params.slot.module.getSlots(true).indexOf(params.slot),
            pin: params.pin,
            signature,
        } as IVerifyThreadTestArgs);
    });
}

function print_test_verify_header() {
    console.log("| %s | %s | %s |", rpad("Algorithm", 25), lpad("Verify", 10), lpad("Verify/s", 10));
    console.log("|%s|%s:|%s:|", rpad("", 27, "-"), rpad("", 11, "-"), rpad("", 11, "-"));
}

function print_test_sign_row(alg: string, t1: number, t2: number) {
    const TEMPLATE = "| %s | %s | %s |";
    console.log(TEMPLATE, rpad(alg.toUpperCase(), 25), lpad(t1.toFixed(3), 10), lpad(t2.toFixed(3), 10));
}

export class VerifyCommand extends Command {
    public name = "verify";
    public description = [
        "test verification performance",
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
        // --thread
        this.options.push(new ThreadOption());
    }

    protected async onRun(params: TestOptions): Promise<Command> {
        if (!check_sign_algs(params.alg)) {
            throw new Error("No such algorithm");
        }
        console.log();
        print_test_verify_header();

        await test_verify(params, "rsa", "1024", "RSA_PKCS");
        await test_verify(params, "rsa", "2048", "RSA_PKCS");
        await test_verify(params, "rsa", "4096", "RSA_PKCS");
        await test_verify(params, "ecdsa", "secp160r1", "ECDSA_SHA1");
        await test_verify(params, "ecdsa", "secp192r1", "ECDSA", "SHA256");
        await test_verify(params, "ecdsa", "secp256r1", "ECDSA", "SHA256");
        await test_verify(params, "ecdsa", "secp384r1", "ECDSA", "SHA256");
        await test_verify(params, "ecdsa", "secp256k1", "ECDSA", "SHA256");
        await test_verify(params, "ecdsa", "brainpoolP192r1", "ECDSA", "SHA256");
        await test_verify(params, "ecdsa", "brainpoolP224r1", "ECDSA", "SHA256");
        await test_verify(params, "ecdsa", "brainpoolP256r1", "ECDSA", "SHA256");
        await test_verify(params, "ecdsa", "brainpoolP320r1", "ECDSA", "SHA256");
        console.log();

        return this;
    }

}
