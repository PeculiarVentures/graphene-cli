// @ts-check
const graphene = require("graphene-pk11");

const mod = graphene.Module.load("/Users/microshine/Downloads/yubico-piv-tool-1.4.3-mac/lib/libykcs11.dylib" );
mod.initialize();

const slot = mod.getSlots(0);
const session = slot.open(graphene.SessionFlag.SERIAL_SESSION)
const objects = session.find();
console.log(objects);

mod.finalize();

console.log("Success");