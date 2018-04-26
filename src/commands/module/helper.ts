import * as graphene from "graphene-pk11";
import { print_caption } from "../../helper";
import { data } from "../../data";

export function print_module_info(mod: graphene.Module) {
    print_caption("Module info");
    console.log(`  Library: ${mod.libFile}`);
    console.log(`  Name: ${mod.libName}`);
    console.log(`  Cryptoki version: ${mod.cryptokiVersion.major}.${mod.cryptokiVersion.minor}`);
    console.log();
}

export function get_module() {
    if (!data.module) {
        throw new Error("Module is not initialized");
    }

    return data.module;
}
