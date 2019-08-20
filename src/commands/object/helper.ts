import * as graphene from "graphene-pk11";
import { Handle, rpad } from "../../helper";

export function print_object_header() {
    console.log("| %s | %s | %s |", rpad("ID", 4), rpad("Class", 15), rpad("Label", 30));
    console.log("|%s|%s|%s|", rpad("", 6, "-"), rpad("", 17, "-"), rpad("", 32, "-"));
}

export function print_object_row(obj: graphene.Storage) {
    console.log(
        "| %s | %s | %s |",
        rpad(Handle.toString(obj.handle), 4),
        rpad(graphene.ObjectClass[obj.class], 15),
        rpad(obj.label, 30));
}

export function print_object_info(obj: graphene.Storage) {
    const TEMPLATE = "| %s | %s |";
    const COL_1 = 20;
    const COL_2 = 25;
    console.log(TEMPLATE, rpad("Name", COL_1), rpad("Value", COL_2));
    console.log(TEMPLATE.replace(/\s/g, "-"), rpad("", COL_1, "-"), rpad("", COL_2, "-"));
    console.log(TEMPLATE, rpad("Handle", COL_1), rpad(Handle.toString(obj.handle), COL_2));
    console.log(TEMPLATE, rpad("Class", COL_1), rpad(graphene.ObjectClass[obj.class], COL_2));
    console.log(TEMPLATE, rpad("Label", COL_1), rpad(obj.label, COL_2));
    console.log(TEMPLATE, rpad("Token", COL_1), rpad(obj.token, COL_2));
    console.log(TEMPLATE, rpad("Private", COL_1), rpad(obj.private, COL_2));
    console.log(TEMPLATE, rpad("Modifiable", COL_1), rpad(obj.modifiable, COL_2));

    if (obj.class === graphene.ObjectClass.PRIVATE_KEY) {
        const o: graphene.PrivateKey = obj.toType<graphene.PrivateKey>();
        console.log(TEMPLATE, rpad("ID", COL_1), rpad(o.id.toString("hex"), COL_2));
        console.log(TEMPLATE, rpad("Mechanism", COL_1), rpad(graphene.KeyGenMechanism[o.mechanism], COL_2));
        console.log(TEMPLATE, rpad("Local", COL_1), rpad(o.local, COL_2));
        console.log(TEMPLATE, rpad("Sensitive", COL_1), rpad(o.sensitive, COL_2));
        console.log(TEMPLATE, rpad("Extractable", COL_1), rpad(o.extractable, COL_2));
        console.log(TEMPLATE, rpad("Derive", COL_1), rpad(o.derive, COL_2));
        console.log(TEMPLATE, rpad("Decrypt", COL_1), rpad(o.decrypt, COL_2));
        console.log(TEMPLATE, rpad("Sign", COL_1), rpad(o.sign, COL_2));
        console.log(TEMPLATE, rpad("Sign recover", COL_1), rpad(o.signRecover, COL_2));
        console.log(TEMPLATE, rpad("Unwrap", COL_1), rpad(o.unwrap, COL_2));
    } else if (obj.class === graphene.ObjectClass.PUBLIC_KEY) {
        const o: graphene.PublicKey = obj.toType<graphene.PublicKey>();
        console.log(TEMPLATE, rpad("ID", COL_1), rpad(o.id.toString("hex"), COL_2));
        console.log(TEMPLATE, rpad("Mechanism", COL_1), rpad(graphene.KeyGenMechanism[o.mechanism], COL_2));
        console.log(TEMPLATE, rpad("Local", COL_1), rpad(o.local, COL_2));
        console.log(TEMPLATE, rpad("Derive", COL_1), rpad(o.derive, COL_2));
        console.log(TEMPLATE, rpad("Encrypt", COL_1), rpad(o.encrypt, COL_2));
        console.log(TEMPLATE, rpad("Verify", COL_1), rpad(o.verify, COL_2));
        console.log(TEMPLATE, rpad("Wrap", COL_1), rpad(o.wrap, COL_2));
    } else if (obj.class === graphene.ObjectClass.SECRET_KEY) {
        const o: graphene.SecretKey = obj.toType<graphene.SecretKey>();
        console.log(TEMPLATE, rpad("ID", COL_1), rpad(o.id.toString("hex"), COL_2));
        console.log(TEMPLATE, rpad("Mechanism", COL_1), rpad(graphene.KeyGenMechanism[o.mechanism], COL_2));
        console.log(TEMPLATE, rpad("Local", COL_1), rpad(o.local, COL_2));
        console.log(TEMPLATE, rpad("Sensitive", COL_1), rpad(o.sensitive, COL_2));
        console.log(TEMPLATE, rpad("Extractable", COL_1), rpad(o.extractable, COL_2));
        console.log(TEMPLATE, rpad("Derive", COL_1), rpad(o.derive, COL_2));
        console.log(TEMPLATE, rpad("Encrypt", COL_1), rpad(o.encrypt, COL_2));
        console.log(TEMPLATE, rpad("Decrypt", COL_1), rpad(o.decrypt, COL_2));
        console.log(TEMPLATE, rpad("Sign", COL_1), rpad(o.sign, COL_2));
        console.log(TEMPLATE, rpad("Verify", COL_1), rpad(o.verify, COL_2));
        console.log(TEMPLATE, rpad("Unwrap", COL_1), rpad(o.unwrap, COL_2));
        console.log(TEMPLATE, rpad("Wrap", COL_1), rpad(o.wrap, COL_2));
    }
}
