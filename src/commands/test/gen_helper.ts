import * as graphene from "graphene-pk11";

import { TEST_KEY_ID, TEST_KEY_LABEL } from "../../const";

function gen_AES(session: graphene.Session, len: number, token = false) {
    return session.generateKey(
        graphene.KeyGenMechanism.AES,
        {
            keyType: graphene.KeyType.AES,
            id: TEST_KEY_ID,
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
    );
}

function gen_RSA(session: graphene.Session, size: number, exp: Buffer = Buffer.from([3]), token = false) {
    return session.generateKeyPair(
        graphene.KeyGenMechanism.RSA,
        {
            id: TEST_KEY_ID,
            label: TEST_KEY_LABEL,
            token,
            modulusBits: size,
            publicExponent: exp,
            wrap: true,
            encrypt: true,
            verify: true,
        },
        {
            id: TEST_KEY_ID,
            label: TEST_KEY_LABEL,
            token,
            private: true,
            sign: true,
            decrypt: true,
            unwrap: true,
        },
    );
}

function gen_ECDSA(session: graphene.Session, name: string, hexOid: string, token = false) {
    return session.generateKeyPair(
        graphene.KeyGenMechanism.ECDSA,
        {
            keyType: graphene.KeyType.ECDSA,
            id: TEST_KEY_ID,
            label: TEST_KEY_LABEL,
            token,
            verify: true,
            paramsEC: Buffer.from(hexOid, "hex"),
        },
        {
            id: TEST_KEY_ID,
            label: TEST_KEY_LABEL,
            token,
            private: true,
            sign: true,
        },
    );
}

export const gen: { [alg: string]: { [spec: string]: (session: graphene.Session, token?: boolean) => graphene.IKeyPair | graphene.SecretKey } } = {
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
