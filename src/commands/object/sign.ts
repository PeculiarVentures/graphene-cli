import * as graphene from "graphene-pk11";

import { Command } from "../../command";

import {SlotOption} from "../../options/slot";
import {DataOption} from "./options/data";
import {Option} from "../../options";
import {HandleOption} from "./options/handle";
import {get_session} from "../slot/helper";
import {AlgorithmOption} from "./options/alg";


interface signOptions extends Option{
    slot: number;
    handle:string;
    data:string;
    alg:string;
}

export class SignCommand extends Command{
    public name = "sign";
    public description = [
        "Signs with a key",
        "",
        "Supported algorithms:",
        "  rsa-1024, rsa-2049, rsa-4096",
        "  ecdsa",
    ];

    constructor(parent?: Command) {
        super(parent);

        this.options.push(new SlotOption());
        this.options.push(new HandleOption());
        this.options.push(new DataOption());
        this.options.push(new AlgorithmOption());

    }
    protected async onRun(params:signOptions):Promise<Command>{
        const session = get_session();

        let alg: graphene.MechanismType;

        if(graphene.MechanismEnum[params.alg.toUpperCase() as any] !== undefined){
            alg = graphene.MechanismEnum[params.alg.toUpperCase() as any];
        }else{
            throw new Error("No mechanism found")
        }
        if (!session.getObject(Buffer.from(params.handle,'hex'))) {
            throw new Error("Cannot find signing key");
        }
        const privObj = session.getObject(Buffer.from(params.handle,'hex')).toType<graphene.Key>();

        var signature = session.createSign(alg,privObj).once(Buffer.from(params.data,'hex'));
        console.log(signature.toString('hex'));

        return this;
    }
}
