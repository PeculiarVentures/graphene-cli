import * as c from "./const";
import { PAD_CHAR } from "./const";

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
        const res = description.map((item, index) => !index ? item : tpad(item, padSize)).join("\n") ;
        return description.length > 1 ? res + "\n" : res;
    }
}
