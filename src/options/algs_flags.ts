import { Option } from "../options";

export class AlgorithmsFlagsOption extends Option {
    public name = "flags";
    public alias = "f";
    public description = [
        "Optional. Flags specifying mechanism capabilities. Default is 'a'",
        "a - all mechanisms in PKCS11",
        "h - mechanism can be used with C_DigestInit",
        "s - mechanism can be used with C_SignInit",
        "v - mechanism can be used with C_VerifyInit",
        "e - mechanism can be used with C_EncryptInit",
        "d - mechanism can be used with C_DecryptInit",
        "w - mechanism can be used with C_WrapKey",
        "u - mechanism can be used with C_UnwrapKey",
        "g - mechanism can be used with C_GenerateKey or C_GenerateKeyPair",
        "D - mechanism can be used with C_DeriveKey",
    ];
    public defaultValue = "a";
}
