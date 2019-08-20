import { fork } from "child_process";
import * as graphene from "graphene-pk11";
import * as path from "path";

import * as Color from "../../color";
import { Command } from "../../command";
import { lpad, rpad } from "../../helper";
import { IEncThreadTestArgs, IEncThreadTestResult } from "./enc_thread_test";
import { gen } from "../../gen_helper";
import { check_enc_algs, delete_test_keys, open_session, TestOptions } from "./helper";

import { PinOption } from "../../options/pin";
import { SlotOption } from "../../options/slot";
import { AlgorithmOption } from "./options/alg";
import { IterationOption } from "./options/iteration";
import { ThreadOption } from "./options/thread";
import {TEST_KEY_LABEL} from "../../const";

async function test_enc(params: TestOptions, prefix: string, postfix: string, mech: graphene.MechanismEnum) {
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

            session.close();

            const promises: Array<Promise<number>> = [];
            for (let i = 0; i < params.thread; i++) {
                promises.push(enc_test_run(params, mech));
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

                print_test_enc_row(
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

async function enc_test_run(params: TestOptions, mech: graphene.MechanismEnum) {
    return new Promise<number>((resolve, reject) => {
        const test = fork(path.join(__dirname, "enc_thread_test.js"))
            .on("error", () => {
                if (!test.killed) {
                    test.kill();
                }
                reject();
            })
            .on("message", (res: IEncThreadTestResult) => {
                if (!test.killed) {
                    test.kill();
                }
                if (res.type === "error") {
                    reject(new Error(`Cannot run encrypt test. ${res.message}`));
                } else {
                    resolve(res.time);
                }
            });

        test.send({
            it: params.it,
            lib: params.slot.module.libFile,
            slot: params.slot.module.getSlots(true).indexOf(params.slot),
            pin: params.pin,
            mech,
        } as IEncThreadTestArgs);
    });
}

function print_test_enc_header() {
    console.log("| %s | %s | %s |", rpad("Algorithm", 25), lpad("Encrypt", 10), lpad("Encrypt/s", 10));
    console.log("|%s|%s:|%s:|", rpad("", 27, "-"), rpad("", 11, "-"), rpad("", 11, "-"));
}

function print_test_enc_row(alg: string, t1: number, t2: number) {
    const TEMPLATE = "| %s | %s | %s |";
    console.log(TEMPLATE, rpad(alg.toUpperCase(), 25), lpad(t1.toFixed(3), 10), lpad(t2.toFixed(3), 10));
}

export class EncryptCommand extends Command {
    public name = "enc";
    public description = [
        "test encryption performance",
        "",
        "Supported algorithms:",
        "  aes, aes-cbc128, aes-cbc192, aes-cbc256",
        "  aes-gcm128, aes-gcm192, aes-gcm256",
        "  rsa, rsa-1024, rsa-2048, rsa-4096",
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
        if (!check_enc_algs(params.alg)) {
            throw new Error("No such algorithm");
        }
        console.log();
        print_test_enc_header();

        await test_enc(params, "aes", "cbc128", graphene.MechanismEnum.AES_CBC);
        await test_enc(params, "aes", "cbc192", graphene.MechanismEnum.AES_CBC);
        await test_enc(params, "aes", "cbc256", graphene.MechanismEnum.AES_CBC);
        await test_enc(params, "aes", "gcm128", graphene.MechanismEnum.AES_GCM);
        await test_enc(params, "aes", "gcm192", graphene.MechanismEnum.AES_GCM);
        await test_enc(params, "aes", "gcm256", graphene.MechanismEnum.AES_GCM);
        await test_enc(params, "rsa", "1024", graphene.MechanismEnum.RSA_PKCS_OAEP);
        await test_enc(params, "rsa", "2048", graphene.MechanismEnum.RSA_PKCS_OAEP);
        await test_enc(params, "rsa", "4096", graphene.MechanismEnum.RSA_PKCS_OAEP);
        console.log();

        return this;
    }

}
