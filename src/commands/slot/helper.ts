import * as graphene from "graphene-pk11";
import { data } from "../../data";
import { Handle, print_bool, print_caption, pad, rpad } from "../../helper";

export function get_session() {
    if (!data.session) {
        throw new Error("Session is not opened");
    }

    return data.session;
}

export function print_slot(slot: graphene.Slot) {
    print_slot_info(slot);
}

export function print_slot_info(slot: graphene.Slot) {
    print_caption("Slot info");
    console.log(`  Handle: ${Handle.toString(slot.handle)}`);
    console.log(`  Description: ${slot.slotDescription}`);
    console.log(`  Manufacturer ID: ${slot.manufacturerID}`);
    console.log(`  Firm version: ${slot.firmwareVersion.major}.${slot.firmwareVersion.minor}`);
    console.log(`  Hardware version: ${slot.hardwareVersion.major}.${slot.hardwareVersion.minor}`);
    console.log(`  Flags:`);
    console.log(`    HW: ${!!(slot.flags & graphene.SlotFlag.HW_SLOT)}`);
    console.log(`    Removable device: ${!!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE)}`);
    console.log(`    Token present: ${!!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT)}`);
    if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
        console.log(`  Token:`);
        const token = slot.getToken();
        console.log(`    Label: ${token.label}`);
        console.log(`    Manufacturer ID: ${token.manufacturerID}`);
        console.log(`    Model: ${token.model}`);
        console.log(`    Serial number: ${token.serialNumber}`);
        console.log(`    Max PIN length: ${token.maxPinLen}`);
        console.log(`    Min PIN length: ${token.minPinLen}`);
        console.log(`    Max session count: ${token.maxSessionCount}`);
        console.log(`    Session count: ${token.sessionCount}`);
        console.log(`    Max RW session count: ${token.maxRwSessionCount}`);
        console.log(`    RW session count: ${token.rwSessionCount}`);
        console.log(`    Total private memory: ${token.totalPrivateMemory}`);
        console.log(`    Free private memory: ${token.freePrivateMemory}`);
        console.log(`    Total public memory: ${token.totalPublicMemory}`);
        console.log(`    Free public memory: ${token.freePublicMemory}`);
        console.log(`    Firm version: ${slot.firmwareVersion.major}.${slot.firmwareVersion.minor}`);
        console.log(`    Hardware version: ${slot.hardwareVersion.major}.${slot.hardwareVersion.minor}`);
        console.log(`    Flags:`);
        console.log(`      Initialized: ${!!(token.flags & graphene.TokenFlag.TOKEN_INITIALIZED)}`);
        console.log(`      Logged in: ${!!(token.flags & graphene.TokenFlag.USER_PIN_INITIALIZED)}`);
    }
    console.log();
}

export function print_alg_info(slot: graphene.Slot, algName: string) {
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
    print_caption("Algorithm info");
    console.log("  %s%s", rpad("Name:", PADDING_1), alg.name);
    console.log("  %s%s", rpad("Min key size:", PADDING_1), alg.minKeySize);
    console.log("  %s%s", rpad("Max key size:", PADDING_1), alg.maxKeySize);
    console.log("  %s%s", rpad("Is hardware:", PADDING_1), !!(alg.flags &  graphene.MechanismFlag.HW));
    console.log("  %s%s", rpad("Is encrypt:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.ENCRYPT));
    console.log("  %s%s", rpad("Is decrypt:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.DECRYPT));
    console.log("  %s%s", rpad("Is digest:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.DIGEST));
    console.log("  %s%s", rpad("Is sign:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.SIGN));
    console.log("  %s%s", rpad("Is sign recover:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.SIGN_RECOVER));
    console.log("  %s%s", rpad("Is verify:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.VERIFY));
    console.log("  %s%s", rpad("Is verify recover:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.VERIFY_RECOVER));
    console.log("  %s%s", rpad("Is generate key:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.GENERATE));
    console.log("  %s%s", rpad("Is generate key pair:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.GENERATE_KEY_PAIR));
    console.log("  %s%s", rpad("Is wrap key:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.WRAP));
    console.log("  %s%s", rpad("Is unwrap key:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.UNWRAP));
    console.log("  %s%s", rpad("Is derive key:", PADDING_1), !!(alg.flags & graphene.MechanismFlag.DERIVE));
    console.log();
}

export function print_slot_algs_header() {
    const TEMPLATE = "| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |";
    console.log(TEMPLATE, rpad("Algorithm name", 25), "h", "s", "v", "e", "d", "w", "u", "g", "D");
    console.log(TEMPLATE.replace(/\s/g, "-"), rpad("", 25, "-"), "-", "-", "-", "-", "-", "-", "-", "-", "-");
}

export function print_slot_algs_row(alg: any) {
    const TEMPLATE = "| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |";
    console.log(TEMPLATE,
        rpad(alg.name, 25),
        print_bool(alg.flags & graphene.MechanismFlag.DIGEST),
        print_bool(alg.flags & graphene.MechanismFlag.SIGN),
        print_bool(alg.flags & graphene.MechanismFlag.VERIFY),
        print_bool(alg.flags & graphene.MechanismFlag.ENCRYPT),
        print_bool(alg.flags & graphene.MechanismFlag.DECRYPT),
        print_bool(alg.flags & graphene.MechanismFlag.WRAP),
        print_bool(alg.flags & graphene.MechanismFlag.UNWRAP),
        print_bool((alg.flags & graphene.MechanismFlag.GENERATE) || (alg.flags & graphene.MechanismFlag.GENERATE_KEY_PAIR)),
        print_bool(alg.flags & graphene.MechanismFlag.DERIVE),
    );
}