import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import { TEST_KEY_LABEL } from "../../const";
import { lpad, rpad } from "../../helper";
import { check_gen_algs, TestOptions } from "./helper";

import { AlgorithmOption } from "./options/alg";
import { PinOption } from "../../options/pin";
import { SlotOption } from "../../options/slot";
import { IterationOption } from "./options/iteration";
import { TokenOption } from "./options/token";

async function gen_AES(session: graphene.Session, len: number, token = false) {
    return new Promise<graphene.SecretKey>((resolve, reject) => {
        session.generateKey(
            graphene.KeyGenMechanism.AES,
            {
                keyType: graphene.KeyType.AES,
                label: TEST_KEY_LABEL,
                token,
                modifiable: true,
                valueLen: (len || 128) >> 3,
                sign: true,
                verify: true,
                encrypt: true,
                decrypt: true,
                wrap: true,
                unwrap: true,
            },
            (err, key) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(key);
                }
            });
    });
}

async function gen_RSA(session: graphene.Session, size: number, exp: Buffer = new Buffer([3]), token = false) {
    return new Promise<graphene.IKeyPair>((resolve, reject) => {
        session.generateKeyPair(
            graphene.KeyGenMechanism.RSA,
            {
                keyType: graphene.KeyType.RSA,
                label: TEST_KEY_LABEL,
                token,
                modulusBits: size,
                publicExponent: exp,
                wrap: true,
                encrypt: true,
                verify: true,
            },
            {
                keyType: graphene.KeyType.RSA,
                label: TEST_KEY_LABEL,
                token,
                private: true,
                sign: true,
                decrypt: true,
                unwrap: true,
            },
            (err, keys) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(keys);
                }
            });
    });
}

async function gen_ECDSA(session: graphene.Session, name: string, hexOid: string, token = false) {
    return new Promise<graphene.IKeyPair>((resolve, reject) => {
        session.generateKeyPair(
            graphene.KeyGenMechanism.ECDSA,
            {
                keyType: graphene.KeyType.ECDSA,
                label: TEST_KEY_LABEL,
                token,
                verify: true,
                paramsEC: new Buffer(hexOid, "hex"),
            },
            {
                label: TEST_KEY_LABEL,
                token,
                private: true,
                sign: true,
            },
            (err, keys) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(keys);
                }
            });
    });
}

export const gen: { [alg: string]: { [spec: string]: (session: graphene.Session, token?: boolean) => Promise<graphene.IKeyPair | graphene.SecretKey> } } = {
    rsa: {
        "1024": gen_RSA_1024,
        "2048": gen_RSA_2048,
        "4096": gen_RSA_4096,
    },
    ecdsa: {
        "secp160r1": gen_ECDSA_secp160r1,
        "secp192r1": gen_ECDSA_secp192r1,
        "secp256r1": gen_ECDSA_secp256r1,
        "secp384r1": gen_ECDSA_secp384r1,
        "secp256k1": gen_ECDSA_secp256k1,
        "brainpoolP192r1": gen_ECDSA_brainpoolP192r1,
        "brainpoolP224r1": gen_ECDSA_brainpoolP224r1,
        "brainpoolP256r1": gen_ECDSA_brainpoolP256r1,
        "brainpoolP320r1": gen_ECDSA_brainpoolP320r1,
    },
    aes: {
        "128": gen_AES_128,
        "192": gen_AES_192,
        "256": gen_AES_256,
        "cbc128": gen_AES_128,
        "cbc192": gen_AES_192,
        "cbc256": gen_AES_256,
        "gcm128": gen_AES_128,
        "gcm192": gen_AES_192,
        "gcm256": gen_AES_256,
    },
};

function gen_RSA_1024(session: graphene.Session, token = false) {
    return gen_RSA(session, 1024, Buffer.from([1, 0, 1]), token);
}

function gen_RSA_2048(session: graphene.Session, token = false) {
    return gen_RSA(session, 2048, Buffer.from([1, 0, 1]), token);
}

function gen_RSA_4096(session: graphene.Session, token = false) {
    return gen_RSA(session, 4096, Buffer.from([1, 0, 1]), token);
}

function gen_ECDSA_secp160r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-secp160r1", "06052b81040008", token);
}

function gen_ECDSA_secp192r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-secp192r1", "06082A8648CE3D030101", token);
}

function gen_ECDSA_secp256r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-secp256r1", "06082A8648CE3D030107", token);
}

function gen_ECDSA_secp384r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-secp384r1", "06052B81040022", token);
}

function gen_ECDSA_secp256k1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-secp256k1", "06052B8104000A", token);
}

function gen_ECDSA_brainpoolP192r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-brainpoolP192r1", "06052B8104000A", token);
}

function gen_ECDSA_brainpoolP224r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-brainpoolP224r1", "06092B2403030208010105", token);
}

function gen_ECDSA_brainpoolP256r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-brainpoolP256r1", "06092B2403030208010107", token);
}

function gen_ECDSA_brainpoolP320r1(session: graphene.Session, token = false) {
    return gen_ECDSA(session, "test ECDSA-brainpoolP320r1", "06092B2403030208010109", token);
}

function gen_AES_128(session: graphene.Session, token = false) {
    return gen_AES(session, 128, token);
}
function gen_AES_192(session: graphene.Session, token = false) {
    return gen_AES(session, 192, token);
}
function gen_AES_256(session: graphene.Session, token = false) {
    return gen_AES(session, 256, token);
}

function print_test_gen_header() {
    const TEMPLATE = "| %s | %s | %s |";
    console.log(TEMPLATE, rpad("Algorithm", 25), lpad("Generate", 8), lpad("Generate/s", 10));
    console.log("|-%s-|-%s:|-%s:|".replace(/\s/g, "-"), rpad("", 25, "-"), lpad("", 8, "-"), lpad("", 10, "-"));
}

function print_test_gen_row(alg: string, t1: string, t2: number) {
    const TEMPLATE = "| %s | %s | %s |";
    console.log(TEMPLATE, rpad(alg.toUpperCase(), 25), lpad(t1, 8), lpad(t2, 10));
}

function open_session(params: TestOptions) {
    const { slot, pin } = params;

    const session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);

    if (pin) {
        session.login(pin);
    }

    return session;
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

function delete_test_keys(params: TestOptions) {
    const session = open_session(params);
    try {
        session.destroy({ label: TEST_KEY_LABEL });
    } catch (err) {
        //
    }
    session.close();
}

async function test_gen(params: TestOptions, prefix = "", postfix = "") {
    try {
        const { slot, pin, alg, token, it } = params;

        const testAlg = prefix + "-" + postfix;
        if (alg === "all" || alg === prefix || alg === testAlg) {
            let session: graphene.Session | null = null;
            let time = 0;
            try {
                session = open_session(params);

                const promises: Array<Promise<graphene.IKeyPair | graphene.SecretKey>> = [];
                for (let i = 0; i < params.it; i++) {
                    promises.push(gen[prefix][postfix](session, token)); // key generation
                }

                const sTime = new Date();
                const keys = await Promise.all(promises);
                const eTime = new Date();
                time = eTime.getTime() - sTime.getTime();
            } catch (err) {
                console.log(`${testAlg} ${err.message}`);
            } finally {
                console.log("Test finished:", time);
                if (session) {
                    session.close();

                    delete_test_keys(params);
                }
            }
            const t1 = Math.round((time / it) * 1000) / 1000 + "ms";
            const t2 = Math.round((1000 / (time / it)) * 1000) / 1000;
            print_test_gen_row(testAlg, t1, t2);
            return true;
        }
        return false;
    } catch (e) {
        console.log(e.message);
        // debug("%s-%s\n  %s", prefix, postfix, e.message);
    }
    return false;
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
        const algOption = new AlgorithmOption();
        this.options.push(algOption);
        // --pin
        this.options.push(new PinOption());
        // --it
        this.options.push(new IterationOption());
        // --token
        this.options.push(new TokenOption());
    }

    protected async onRun(params: TestOptions): Promise<Command> {
        const slot = params.slot;

        if (!check_gen_algs(params.alg)) {
            const error = new Error("No such algorithm");
            throw error;
        }
        console.log();
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
