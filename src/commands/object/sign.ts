import * as graphene from "graphene-pk11";

import { Command } from "../../command";
import {get_session} from "../slot/helper";
import {GEN_KEY_LABEL} from "../../const";
import {SlotOption} from "../../options/slot";
import {PinOption} from "../../options/pin";
import {DataOption} from "./options/data";
import {Option} from "../../options";

interface signOptions extends Option{
    lib: string;
    slot?: number;
    pin?:string;
    data?:string;
}

export class SignCommand extends Command{
    public name = "sign";
    public description = "Signs with an SECP256k1 Key";

    constructor(parent?: Command) {
        super(parent);
        // --slot
        this.options.push(new SlotOption());
        // --pin
        this.options.push(new PinOption());
        // --data
        this.options.push(new DataOption());

    }
    protected async onRun(params:signOptions):Promise<Command>{
        const mod = graphene.Module.load(params.lib);
        mod.initialize();

        if(!params.slot){
            console.log("No slot found. Defaulting to 0.");
            params.slot = 0;
        }

        const slot = mod.getSlots(params.slot, true);
        const session = slot.open(graphene.SessionFlag.SERIAL_SESSION);


        if (params.pin) {
            session.login(params.pin);
        }else{
            console.log("Session did not log in. May not work.");
        }

        let key: graphene.Key | null = null;
        //#region Find signing key

        const objects = session.find({ id: GEN_KEY_LABEL });
        for (let i = 0; i < objects.length; i++) {
            const obj = objects.items(i);
            if (obj.class === graphene.ObjectClass.PRIVATE_KEY ||
                obj.class === graphene.ObjectClass.SECRET_KEY
            ) {
                key = obj.toType<graphene.Key>();
                break;
            }

        }
        if (!key) {
            throw new Error("Cannot find signing key");
        }
        var sign = session.createSign("ECDSA_SHA256",key.privateKey);
        if(!params.data){
            console.log("No data found. Signing empty string");
            params.data = '';
        }

        sign.update(params.data);
        var signature = sign.final();
        console.log("Signature ECDSA_SHA256:",signature.toString('hex'));

        return this;
    }




}