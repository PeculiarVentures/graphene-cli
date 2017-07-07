import { MechanismFlag, Slot, TokenFlag } from "graphene-pk11";
import * as defs from "./defs";
const { consoleApp } = defs;

function print_slot(slot: Slot) {
    defs.print_slot_info(slot);
}

/* ==========
   Slot
   ==========*/
export let cmdSlot = defs.commander.createCommand("slot", {
    description: "open a session to a slot and work with its contents",
    note: defs.NOTE,
})
    .on("call", () => {
        this.help();
    }) as defs.Command;

/**
 * list
 */
export let cmdSlotList = cmdSlot.createCommand("list", {
    description: "enumerates the available slots",
    note: defs.NOTE,
})
    .on("call", () => {
        defs.get_slot_list();
        defs.print_caption("Slot list");
        console.log("Slot count:", consoleApp.slots.length);
        console.log();
        for (let i = 0; i < consoleApp.slots.length; i++) {
            const slot = consoleApp.slots.items(i);
            print_slot(slot);
        }
    }) as defs.Command;

function print_alg_info(slot: Slot, algName: string) {
    const algList = slot.getMechanisms();
    // find alg
    let alg: any = null;
    for (let i = 0; i < algList.length; i++) {
        const item = algList.items(i);
        if (item.name === algName) {
            alg = item;
            break;
        }
    }
    if (!alg) {
        throw new Error("Unsupported algorithm in use");
    }
    const PADDING_1 = 25;
    defs.print_caption("Algorithm info");
    console.log("  %s%s", defs.rpud("Name:", PADDING_1), alg.name);
    console.log("  %s%s", defs.rpud("Min key size:", PADDING_1), alg.minKeySize);
    console.log("  %s%s", defs.rpud("Max key size:", PADDING_1), alg.maxKeySize);
    console.log("  %s%s", defs.rpud("Is hardware:", PADDING_1), !!(alg.flags & MechanismFlag.HW));
    console.log("  %s%s", defs.rpud("Is encrypt:", PADDING_1), !!(alg.flags & MechanismFlag.ENCRYPT));
    console.log("  %s%s", defs.rpud("Is decrypt:", PADDING_1), !!(alg.flags & MechanismFlag.DECRYPT));
    console.log("  %s%s", defs.rpud("Is digest:", PADDING_1), !!(alg.flags & MechanismFlag.DIGEST));
    console.log("  %s%s", defs.rpud("Is sign:", PADDING_1), !!(alg.flags & MechanismFlag.SIGN));
    console.log("  %s%s", defs.rpud("Is sign recover:", PADDING_1), !!(alg.flags & MechanismFlag.SIGN_RECOVER));
    console.log("  %s%s", defs.rpud("Is verify:", PADDING_1), !!(alg.flags & MechanismFlag.VERIFY));
    console.log("  %s%s", defs.rpud("Is verify recover:", PADDING_1), !!(alg.flags & MechanismFlag.VERIFY_RECOVER));
    console.log("  %s%s", defs.rpud("Is generate key:", PADDING_1), !!(alg.flags & MechanismFlag.GENERATE));
    console.log("  %s%s", defs.rpud("Is generate key pair:", PADDING_1), !!(alg.flags & MechanismFlag.GENERATE_KEY_PAIR));
    console.log("  %s%s", defs.rpud("Is wrap key:", PADDING_1), !!(alg.flags & MechanismFlag.WRAP));
    console.log("  %s%s", defs.rpud("Is unwrap key:", PADDING_1), !!(alg.flags & MechanismFlag.UNWRAP));
    console.log("  %s%s", defs.rpud("Is derive key:", PADDING_1), !!(alg.flags & MechanismFlag.DERIVE));
    console.log();
}

/**
 * info
 */
export let cmdSlotInfo = cmdSlot.createCommand("info", {
    description: "returns information about a specific slot",
    note: defs.NOTE,
    example: "Returns an info about slot" + "\n\n" +
    "      > slot info -s 0\n\n" +
    "    Returns an info about algorithm of selected slot" + "\n\n" +
    "      > slot info -s 0 -a SHA1",
})
    .option("slot", defs.options.slot)
    .option("alg", {
        description: "Algorithm name",
    })
    .on("call", (cmd: {
        slot: Slot;
        alg: string;
    }) => {
        if (cmd.alg) {
            if ((defs as any).MechanismEnum[cmd.alg] !== undefined) {
                print_alg_info(cmd.slot, cmd.alg);
            } else {
                throw new Error("Unknown Algorithm name in use");
            }
        } else {
            print_slot(cmd.slot);
        }
    });

function print_slot_algs_header() {
    const TEMPLATE = "| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |";
    console.log(TEMPLATE, defs.rpud("Algorithm name", 25), "h", "s", "v", "e", "d", "w", "u", "g", "D");
    console.log(TEMPLATE.replace(/\s/g, "-"), defs.rpud("", 25, "-"), "-", "-", "-", "-", "-", "-", "-", "-", "-");
}

function print_slot_algs_row(alg: any) {
    const TEMPLATE = "| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |";
    console.log(TEMPLATE,
        defs.rpud(alg.name, 25),
        defs.print_bool(alg.flags & MechanismFlag.DIGEST),
        defs.print_bool(alg.flags & MechanismFlag.SIGN),
        defs.print_bool(alg.flags & MechanismFlag.VERIFY),
        defs.print_bool(alg.flags & MechanismFlag.ENCRYPT),
        defs.print_bool(alg.flags & MechanismFlag.DECRYPT),
        defs.print_bool(alg.flags & MechanismFlag.WRAP),
        defs.print_bool(alg.flags & MechanismFlag.UNWRAP),
        defs.print_bool((alg.flags & MechanismFlag.GENERATE) || (alg.flags & MechanismFlag.GENERATE_KEY_PAIR)),
        defs.print_bool(alg.flags & MechanismFlag.DERIVE),
    );
}

/**
 * algs
 */
export let cmdSlotCiphers = cmdSlot.createCommand("algs", {
    description: "enumerates the supported algorithms",
    note: defs.NOTE,
    example: "Returns a list of mechanisms which can be used with C_DigestInit, C_SignInit\n  and C_VerifyInit" + "\n\n" +
    "  > slot algs -s 0 -f hsv",
})
    .option("slot", defs.options.slot)
    .option("flags", {
        description: "Optional. Flags specifying mechanism capabilities. Default is 'a'" + "\n" +
        "    a - all mechanisms in PKCS11" + "\n" +
        "    h - mechanism can be used with C_DigestInit" + "\n" +
        "    s - mechanism can be used with C_SignInit" + "\n" +
        "    v - mechanism can be used with C_VerifyInit" + "\n" +
        "    e - mechanism can be used with C_EncryptInit" + "\n" +
        "    d - mechanism can be used with C_DecryptInit" + "\n" +
        "    w - mechanism can be used with C_WrapKey" + "\n" +
        "    u - mechanism can be used with C_UnwrapKey" + "\n" +
        "    g - mechanism can be used with C_GenerateKey or C_GenerateKeyPair" + "\n" +
        "    D - mechanism can be used with C_DeriveKey",
        value: "a",
    })
    .on("call", (cmd: {
        slot: Slot;
        flags: string;
    }) => {
        const lAlg = cmd.slot.getMechanisms();

        console.log();
        print_slot_algs_header();
        for (let i = 0; i < lAlg.length; i++) {
            const alg = lAlg.items(i);
            const f = cmd.flags;
            let d = false;
            if (!d && f.indexOf("a") >= 0) {
                d = true;
            }
            if (!d && f.indexOf("h") >= 0 && alg.flags & MechanismFlag.DIGEST) {
                d = true;
            }
            if (!d && f.indexOf("s") >= 0 && alg.flags & MechanismFlag.SIGN) {
                d = true;
            }
            if (!d && f.indexOf("v") >= 0 && alg.flags & MechanismFlag.VERIFY) {
                d = true;
            }
            if (!d && f.indexOf("e") >= 0 && alg.flags & MechanismFlag.ENCRYPT) {
                d = true;
            }
            if (!d && f.indexOf("d") >= 0 && alg.flags & MechanismFlag.DECRYPT) {
                d = true;
            }
            if (!d && f.indexOf("w") >= 0 && alg.flags & MechanismFlag.WRAP) {
                d = true;
            }
            if (!d && f.indexOf("u") >= 0 && alg.flags & MechanismFlag.UNWRAP) {
                d = true;
            }
            if (!d && f.indexOf("g") >= 0 && (alg.flags & MechanismFlag.GENERATE || alg.flags & MechanismFlag.GENERATE_KEY_PAIR)) {
                d = true;
            }
            if (!d) {
                continue;
            }
            print_slot_algs_row(alg);
        }
        console.log();
        console.log("%s algorithm(s) in list", lAlg.length);
        console.log();
    });

export let cmdSlotOpen = cmdSlot.createCommand("open", {
    description: "open a session to a slot",
    note: defs.NOTE,
})
    .option("slot", defs.options.slot)
    .option("pin", defs.options.pin)
    .on("call", (cmd: {
        slot: Slot;
        pin: string;
    }) => {
        if (consoleApp.session) {
            consoleApp.session.logout();
            consoleApp.session.close();
        }
        consoleApp.session = cmd.slot.open();
        const isSessionInitialized = consoleApp.session.slot.getToken().flags & TokenFlag.USER_PIN_INITIALIZED;
        if (!isSessionInitialized) {
            consoleApp.session.login(cmd.pin);
        }
        console.log();
        console.log("Session is started");
        console.log();
    });

export let cmdSlotStop = cmdSlot.createCommand("stop", {
    description: "close the open session",
    note: defs.NOTE,
})
    .on("call", () => {
        if (consoleApp.session) {
            consoleApp.session.logout();
            consoleApp.session.close();
        }
        consoleApp.session = null!;
        console.log();
        console.log("Session is stopped");
        console.log();
    });
