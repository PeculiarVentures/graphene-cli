import * as crypto from "crypto";
import * as graphene from "graphene-pk11";

function build_gcm_params(iv: Buffer) {
    return new graphene.AesGcmParams(iv);
}

function generate_iv(blockSize: number) {
    return crypto.randomBytes(blockSize);
}

const AES_CBC = {
    name: "AES_CBC_PAD",
    params: Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
};

const AES_GCM = {
    name: "AES_GCM",
    params: build_gcm_params(generate_iv(16)),
};

const RSA_OAEP = {
    name: "RSA_PKCS_OAEP",
    params: new graphene.RsaOaepParams(graphene.MechanismEnum.SHA1, graphene.RsaMgf.MGF1_SHA1, undefined),
};

export function prepare_data(key: graphene.Key, mech: graphene.MechanismEnum): { data: Buffer, alg: graphene.MechanismType } {
    switch (mech) {
        case graphene.MechanismEnum.AES_CBC:
            return {
                // 32 bytes
                data: Buffer.from([
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
                    1, 2,
                ]),
                alg: AES_CBC,
            };
        case graphene.MechanismEnum.AES_GCM:
            return {
                // 32 bytes
                data: Buffer.from([
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
                    1, 2,
                ]),
                alg: AES_GCM,
            };
        case graphene.MechanismEnum.RSA_PKCS_OAEP:
            return {
                // 32 bytes
                data: Buffer.from([
                    1, 2, 3, 4, 5, 6, 7, 8,
                ]),
                alg: RSA_OAEP,
            };
        default:
            throw new Error("Unsupported  mechanism");
    }
}
