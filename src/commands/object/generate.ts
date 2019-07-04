import * as graphene from "graphene-pk11";
import {Command} from "../../command";
import {get_session} from "../slot/helper";
import {TokenOption} from "../test/options/token";
import {Option} from "../../options";
import {gen} from "../../gen_helper";
import {AlgorithmOption} from "./options/alg";


interface GenerateOptions extends Option{
    token: boolean;
    alg:string;
}
export class GenerateCommand extends Command{
    public name = "generate";
    public description = [
        "Generates a key",
            "",
            "Supported algorithms:",
            "  rsa-1024, rsa-2048, rsa-4096",
            "  ecdsa-secp160r1, ecdsa-secp192r1, ecdsa-secp256r1",
            "  ecdsa-secp384r1, ecdsa-secp256k1",
            "  ecdsa-brainpoolP192r1, ecdsa-brainpoolP224r1,",
            "  ecdsa-brainpoolP256r1, ecdsa-brainpoolP320r1",
            "  aes-128, aes-192, aes-256",
        ];

    constructor(parent?: Command) {
        super(parent);
        // --token
        this.options.push(new TokenOption());
        //--alg or -a
        this.options.push(new AlgorithmOption())
    }

    protected async onRun(params:GenerateOptions):Promise<Command>{
        const session = get_session();
        generate(params,session,this);


        return this;
    }
}
function generate(params:GenerateOptions, session: graphene.Session, command: GenerateCommand){
    var splitIndex = params.alg.indexOf('-');
    if(splitIndex===-1){
        console.log('Incorrect algorithm format.');
        return;
    }else{
        let alg = params.alg.slice(0,splitIndex);
        let curve = params.alg.slice(splitIndex+1);
        if(!gen[alg][curve]){
            console.log('Invalid algorithm');
            return;
        }
        let name =  alg.toUpperCase()+'-'+curve;
        let key = gen[alg][curve](session, name, params.token);

        if (!(key instanceof graphene.SecretKey)) {
            key.privateKey.setAttribute({id:Buffer.from(key.privateKey.handle)});
            key.publicKey.setAttribute({id:Buffer.from(key.privateKey.handle)});

            //DER/BER encoded public key
            let rawKey = key.publicKey.getAttribute('pointEC').toString('hex');

            //Removed prefix
            let pubKey = rawKey.slice(6);
            let objHandle = key.privateKey.handle.toString('hex');
            if(!command.sharedParams.quiet){
                console.log('Outputting signature and handle: \n');
            }
            console.log(pubKey+objHandle);
        }else if (key instanceof graphene.SecretKey){
            key.setAttribute({id: Buffer.from(key.handle)});
            let objHandle = key.handle.toString('hex');
            if(!command.sharedParams.quiet) {
                console.log('Outputting handle: \n');
            }
            console.log(objHandle)
        }
    }
}
