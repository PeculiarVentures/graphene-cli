import * as graphene from "graphene-pk11";
import { TEST_KEY_ID } from "../../const";

export interface TestOptions {
    slot: graphene.Slot;
    alg: string;
    pin?: string;
    it: number;
    thread: number;
}

export function check_sign_algs(alg: string) {
    const list = ["all", "rsa", "rsa-1024", "rsa-2048", "rsa-4096", "ecdsa", "ecdsa-secp160r1", "ecdsa-secp192r1", "ecdsa-secp256r1", "ecdsa-secp384r1", "ecdsa-secp256k1",
        "ecdsa-brainpoolP192r1", "ecdsa-brainpoolP224r1", "ecdsa-brainpoolP256r1", "ecdsa-brainpoolP320r1"];
    return list.indexOf(alg) !== -1;
}
export function check_enc_algs(alg: string) {
    const list = ["all", "aes", "aes-cbc128", "aes-cbc192", "aes-cbc256", "aes-gcm128", "aes-gcm192", "aes-gcm256", "rsa", "rsa-1024", "rsa-2048", "rsa-4096"];
    return list.indexOf(alg) !== -1;
}

export function check_gen_algs(alg: string) {
    return check_sign_algs(alg) || ["aes", "aes-128", "aes-192", "aes-256"].indexOf(alg) !== -1;
}

export function open_session(params: TestOptions) {
    const { slot, pin } = params;

    const session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);

    if (pin) {
        session.login(pin);
    }

    return session;
}

export function delete_test_keys(params: TestOptions) {
    const session = open_session(params);
    try {
        session.destroy({ id: TEST_KEY_ID });
    } catch (err) {
        //
    }
    session.close();
}
