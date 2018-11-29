import {randomBytes} from "crypto";
import {KeyType, ObjectClass, Session, Storage} from "graphene-pk11";
import * as NodeRSA from "node-rsa";
import ITemplate = GraphenePkcs11.ITemplate;
import {KeyComponentsPublic} from "node-rsa";
import {KeyComponentsPrivate} from "node-rsa";
import PublicKey = GraphenePkcs11.PublicKey;
import PrivateKey = GraphenePkcs11.PrivateKey;
import * as c from "./const";
import {PAD_CHAR} from "./const";
import {ITemplatePair} from "./types";

// @ts-ignore
import rsaUtils =  require("node-rsa/src/utils");
/**
 * formats text with paddings
 * @param text
 * @param size
 * @param end       if true - puts padding chars to the end, else to the begin
 * @param spaceChar
 */
export function pad(text: string, size: number, end = false, spaceChar = PAD_CHAR) {
    text = text.toString();
    let res: string;
    let padding = "";
    if (text.length < size) {
        padding = Array(size - text.length).fill(spaceChar).join("");
    }
    if (!end) {
        res = text + padding;
    } else {
        res = padding + text;
    }

    return res;
}

/**
 * Adds padding from left
 * @param text Source string value
 * @param size Final size of string
 * @param paddingChar Padding char. Optional. Default is ' '
 */
export function lpad(text: any, size: number, paddingChar = PAD_CHAR) {
    return pad(text, size, true, paddingChar);
}

/**
 * Adds padding from right
 * @param text Source string value
 * @param size Final size of string
 * @param paddingChar Padding char. Optional. Default is ' '
 */
export function rpad(text: any, size: number, paddingChar = PAD_CHAR) {
    return pad(text, size, false, paddingChar);
}

export function tpad(text: string, size: number = 0, paddingChar = PAD_CHAR) {
    const padding = Array(size).fill(paddingChar).join("");
    return `${padding}${text}`;
}

/**
 * Prints caption to stdout with underline
 *
 * ### View:
 * ```
 * <name>
 * ===================================
 * ```
 * @param name name of caption
 */
export function print_caption(name: string) {
    console.log(`\n${name}\n${c.CAPTION_UNDERLINE}\n`);
}

export class Handle {

    /**
     * Converts PKCS11 Handle to string
     *
     * @static
     * @param {Buffer} buffer
     * @returns {string}
     */
    public static toString(buffer: Buffer): string {
        const buf = Buffer.alloc(8);
        buf.fill(0);
        for (let i = 0; i < buffer.length; i++) {
            buf[i] = buffer[i];
        }
        return buffer_to_hex(revert_buffer(buf));
    }

    /**
     * Converts hex value to PKCS11 Handle
     *
     * @static
     * @param {string} hex
     * @returns {Buffer}
     */
    public static toBuffer(hex: string): Buffer {
        return revert_buffer(Buffer.from(prepare_hex(hex), "hex"));
    }
}

/**
 * Adds 0 if hex value has odd length
 *
 * @param {string} hex
 * @returns
 */
function prepare_hex(hex: string) {
    let res = hex;
    while (res.length < 16) {
        res = "0" + res;
    }
    return res;
}

/**
 * Reverts Buffer
 *
 * @param {Buffer} buffer
 * @returns
 */
function revert_buffer(buffer: Buffer) {
    if (buffer.length > 8) {
        throw new TypeError("Wrong Buffer size");
    }
    const b = Buffer.alloc(8);
    b.fill(0);
    for (let i = 0; i < buffer.length; i++) {
        b[buffer.length - 1 - i] = buffer[i];
    }
    return b;
}

/**
 * Converts Buffer to string and cut all 0s from the beginning
 *
 * @param {Buffer} buffer
 * @returns
 */
function buffer_to_hex(buffer: Buffer) {
    return buffer.toString("hex").replace(/^0*/, "");
}

/**
 * Prints Boolean. X - true, ' ' - false
 * @param {boolean} v
 */
export function print_bool(v: number) {
    return v ? "x" : " ";
}

export function print_description(description: string | string[], padSize = 0) {
    if (typeof description === "string") {
        return description;
    } else {
        const res = description.map((item, index) => !index ? item : tpad(item, padSize)).join("\n");
        return description.length > 1 ? res + "\n" : res;
    }
}

export function createTemplate(label: string, extractable: boolean, keyUsages: string[]): ITemplatePair {
    const id = randomBytes(20);
    return {
        privateKey: {
            token: true,
            class: ObjectClass.PRIVATE_KEY,
            keyType: KeyType.RSA,
            private: true,
            label,
            id,
            extractable,
            derive: false,
            sign: keyUsages.indexOf("sign") > -1,
            decrypt: keyUsages.indexOf("decrypt") > -1,
            unwrap: keyUsages.indexOf("unwrapKey") > -1,
        },
        publicKey: {
            token: true,
            class: ObjectClass.PUBLIC_KEY,
            keyType: KeyType.RSA,
            private: false,
            label,
            id,
            verify: keyUsages.indexOf("verify") > -1,
            encrypt: keyUsages.indexOf("encrypt") > -1,
            wrap: keyUsages.indexOf("wrapKey") > -1,
        },
    };
}

export function int32toBuffer(value: number | Buffer): Buffer {
    if (value instanceof Buffer) { return value; }
    const buf = Buffer.alloc(4);
    buf[0] = (value & 0xff000000) >> 24;
    buf[1] = (value & 0x00ff0000) >> 16;
    buf[2] = (value & 0x0000ff00) >> 8;
    buf[3] = (value & 0x000000ff);
    return buf;
}

/**
 *
 * @param session
 * @param rsa
 * @param label
 * @param extractable
 * @param keyUsages
 */
export function importRSAPublicKey(session: Session, rsa: NodeRSA, label: string,
                                   extractable: boolean, keyUsages: string[] = []) {
    const template = createTemplate(label, extractable, keyUsages).publicKey;
    const key = rsa.exportKey("components-public");
    template.publicExponent = int32toBuffer(key.e);
    template.modulus = key.n;
    return session.create(template).toType<PublicKey>();
}

export function importRSAPrivateKey(session: Session, rsa: NodeRSA, label: string,
                                    extractable: boolean, keyUsages: string[] = []) {
    const template = createTemplate(label, extractable, keyUsages).privateKey;
    const key = rsa.exportKey("components");
    template.publicExponent = int32toBuffer(key.e);
    template.modulus = key.n;
    template.privateExponent = key.d;
    template.prime1 = key.p;
    template.prime2 = key.q;
    template.exp1 = key.dmp1;
    template.exp2 = key.dmq1;
    template.coefficient = key.coeff;
    return session.create(template).toType<PrivateKey>();
}
export function exportPublicKey(key: Storage): NodeRSA {
    const pkey: ITemplate = key.getAttribute({
        publicExponent: null,
        modulus: null,
    });
    const rsa = new NodeRSA();
    rsa.importKey({
        n: pkey.modulus,
        e: rsaUtils.get32IntFromBuffer(pkey.publicExponent),
    } as KeyComponentsPublic, "components-public");
    return rsa;
}

export function exportPrivateKey(key: Storage): NodeRSA {
    const pkey: ITemplate = key.getAttribute({
        publicExponent: null,
        modulus: null,
        privateExponent: null,
        prime1: null,
        prime2: null,
        exp1: null,
        exp2: null,
        coefficient: null,
    });
    const rsa =  new NodeRSA();
    rsa.importKey({
      e: rsaUtils.get32IntFromBuffer(pkey.publicExponent),
      n: pkey.modulus,
      d: pkey.privateExponent,
      p: pkey.prime1,
      q: pkey.prime2,
      dmp1: pkey.exp1,
      dmq1: pkey.exp2,
      coeff: pkey.coefficient,
  } as KeyComponentsPrivate, "components");
    return rsa;
}
