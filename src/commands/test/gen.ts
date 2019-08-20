import { fork } from "child_process";
import * as graphene from "graphene-pk11";
import * as path from "path";

import * as Color from "../../color";
import { Command } from "../../command";
import { TEST_KEY_ID, TEST_KEY_LABEL } from "../../const";
import { lpad, rpad } from "../../helper";
import { check_gen_algs, delete_test_keys, open_session, TestOptions } from "./helper";

import { PinOption } from "../../options/pin";
import { SlotOption } from "../../options/slot";
import { gen } from "../../gen_helper";
import { IGenThreadTestArgs, IGenThreadTestResult } from "./gen_thread_test";
import { AlgorithmOption } from "./options/alg";
import { IterationOption } from "./options/iteration";
import { ThreadOption } from "./options/thread";
import { TokenOption } from "./options/token";

interface GenOptions extends TestOptions {
    token: boolean;
}

function print_test_gen_header() {
    const TEMPLATE = "| %s | %s | %s |";
    console.log(TEMPLATE, rpad("Algorithm", 25), lpad("Generate", 8), lpad("Generate/s", 10));
    console.log("|-%s-|-%s:|-%s:|".replace(/\s/g, "-"), rpad("", 25, "-"), lpad("", 8, "-"), lpad("", 10, "-"));
}

function print_test_gen_row(alg: string, t1: number, t2: number) {
    const TEMPLATE = "| %s | %s | %s |";
    console.log(TEMPLATE, rpad(alg.toUpperCase(), 25), lpad(t1.toFixed(3), 8), lpad(t2.toFixed(3), 10));
}

function delete_keys(keys: Array<graphene.IKeyPair | graphene.SecretKey>) {
    keys.forEach((key) => {
        if (key instanceof graphene.SecretKey) {
            key.destroy();
        } else {
            key.privateKey.destroy();
            key.publicKey.destroy();
        }
    });
}

async function test_gen(params: GenOptions, prefix = "", postfix = "") {
    try {
        const { slot, pin, alg, it } = params;

        const testAlg = prefix + "-" + postfix;
        if (alg === "all" || alg === prefix || alg === testAlg) {

            const promises: Array<Promise<number>> = [];
            for (let i = 0; i < params.thread; i++) {
                promises.push(gen_test_run(params, prefix, postfix));
            }

            const sTime = Date.now();
            await Promise.all(promises)
                .then((times) => {
                    const eTime = Date.now();
                    const time = (eTime - sTime) / 1000;
                    const totalTime = times.reduce((p, c) => p + c);
                    const totalIt = params.it * params.thread;
                    print_test_gen_row(
                        testAlg,
                        (totalTime / totalIt),
                        (totalIt / time),
                    );
                });

            delete_test_keys(params);
        }
    } catch (e) {
        console.log(`${Color.FgRed}Error${Color.Reset}`, e.message);
        // debug("%s-%s\n  %s", prefix, postfix, e.message);
    }
}

async function gen_test_run(params: GenOptions, prefix: string, postfix: string) {
    return new Promise<number>((resolve, reject) => {
        const test = fork(path.join(__dirname, "gen_thread_test.js"))
            .on("error", () => {
                if (!test.killed) {
                    test.kill();
                }
                reject();
            })
            .on("message", (res: IGenThreadTestResult) => {
                if (!test.killed) {
                    test.kill();
                }
                if (res.type === "error") {
                    reject(new Error(`Cannot run generate test. ${res.message}`));
                } else {
                    resolve(res.time);
                }
            });

        test.send({
            it: params.it,
            lib: params.slot.module.libFile,
            slot: params.slot.module.getSlots(true).indexOf(params.slot),
            pin: params.pin,
            token: params.token,
            prefix,
            postfix,
        } as IGenThreadTestArgs);
    });
}

export class GenerateCommand extends Command {
    public name = "gen";
    public description = [
        "Test key generation performance",
        "",
        "Supported algorithms:",
        "  rsa, rsa-1024, rsa-2048, rsa-4096",
        "  ecdsa, ecdsa-secp160r1, ecdsa-secp192r1,",
        "  ecdsa-secp256r1, ecdsa-secp384r1,",
        "  ecdsa-secp256k1, ecdsa-brainpoolP192r1, ecdsa-brainpoolP224r1,",
        "  ecdsa-brainpoolP256r1, ecdsa-brainpoolP320r1",
        "  aes, aes-cbc128, aes-cbc192, aes-cbc256",
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
        // --token
        this.options.push(new TokenOption());
    }

    protected async onRun(params: GenOptions): Promise<Command> {
        const slot = params.slot;

        if (!check_gen_algs(params.alg)) {
            throw new Error("No such algorithm");
        }
        print_test_gen_header();

        // sign
        await test_gen(params, "rsa", "1024");
        await test_gen(params, "rsa", "2048");
        await test_gen(params, "rsa", "4096");
        await test_gen(params, "ecdsa", "secp160r1");
        await test_gen(params, "ecdsa", "secp192r1");
        await test_gen(params, "ecdsa", "secp256r1");
        await test_gen(params, "ecdsa", "secp384r1");
        await test_gen(params, "ecdsa", "secp256k1");
        await test_gen(params, "ecdsa", "brainpoolP192r1");
        await test_gen(params, "ecdsa", "brainpoolP224r1");
        await test_gen(params, "ecdsa", "brainpoolP256r1");
        await test_gen(params, "ecdsa", "brainpoolP320r1");

        // enc
        await test_gen(params, "aes", "128");
        await test_gen(params, "aes", "192");
        await test_gen(params, "aes", "256");
        console.log();

        return this;
    }

}
