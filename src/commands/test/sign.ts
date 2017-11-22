// import { Command } from "../../command";
// import { TestOptions } from "./helper";



// async function text_sign(){
//     try {
//         const alg = prefix + "-" + postfix;
//         if (cmd.alg === "all" || cmd.alg === prefix || cmd.alg === alg) {
//             let key: IKeyPair | SecretKey | null = null;
//             try {
//                 const tGen = new defs.Timer();
//                 tGen.start();
//                 key = gen[prefix][postfix](session, cmd.token);
//                 tGen.stop();
//                 // create buffer
//                 const buf = new Buffer(BUF_SIZE);
//                 const t1 = new defs.Timer();
//                 let sig: Buffer;
//                 let digested = buf;
//                 if (digestAlg) {
//                     const digest = session.createDigest(digestAlg);
//                     digested = digest.once(buf);
//                 }
//                 /**
//                  * TODO: We need to determine why the first call to the device is so much slower,
//                  * it may be the FFI initialization. For now we will exclude this one call from results.
//                  */
//                 test_sign_operation(session, digested, key, signAlg);
//                 t1.start();
//                 sig = test_sign_operation(session, digested, key, signAlg);
//                 for (let i = 1; i < cmd.it; i++) {
//                     sig = test_sign_operation(session, digested, key, signAlg);
//                 }
//                 t1.stop();

//                 const t2 = new defs.Timer();
//                 t2.start();
//                 for (let i = 0; i < cmd.it; i++) {
//                     test_verify_operation(session, digested, key, signAlg, sig);
//                 }
//                 t2.stop();

//                 const r1 = Math.round((t1.time / cmd.it) * 1000) / 1000 + "ms";
//                 const r2 = Math.round((t2.time / cmd.it) * 1000) / 1000 + "ms";
//                 const rs1 = Math.round((1000 / (t1.time / cmd.it)) * 1000) / 1000;
//                 const rs2 = Math.round((1000 / (t2.time / cmd.it)) * 1000) / 1000;
//                 print_test_sign_row(alg, r1, r2, rs1, rs2);
//             } catch (err) {
//                 console.log(`${alg} ${err.message}`);
//             } finally {
//                 if (key) {
//                     deleteKeys(session, key);
//                 }
//             }
//         }
//         return true;
//     } catch (e) {
//         console.log(e.message);
//         // debug("%s-%s\n  %s", prefix, postfix, e.message);
//     }
//     return false;
// }

// interface SignOptions extends TestOptions {
//     buf: number;
// }

// export class SignCommand extends Command {
//     public name = "sign";
//     public description = [
//         "test sign and verification performance",
//         "",
//         "Supported algorithms:",
//         "  rsa, rsa-1024, rsa-2048, rsa-4096,",
//         "  ecdsa, ecdsa-secp160r1, ecdsa-secp192r1,",
//         "  ecdsa-secp256r1, ecdsa-secp384r1,",
//         "  ecdsa-secp256k1, ecdsa-brainpoolP192r1, ecdsa-brainpoolP224r1,",
//         "  ecdsa-brainpoolP256r1, ecdsa-brainpoolP320r1",
//     ];

//     constructor(parent?: Command) {
//         super(parent);

//         // this.options.push();
//     }

//     protected async onRun(options: Assoc<any>): Promise<Command> {
//         if (cmd.slot) {
//             console.log();
//             defs.check_module();
//             if (!check_sign_algs(cmd.alg)) {
//                 const error = new Error("No such algorithm");
//                 throw error;
//             }

//             console.log();
//             print_test_sign_header();
//             test_sign(consoleApp.session, cmd, "rsa", "1024", "SHA1_RSA_PKCS");
//             test_sign(consoleApp.session, cmd, "rsa", "2048", "SHA1_RSA_PKCS");
//             test_sign(consoleApp.session, cmd, "rsa", "4096", "SHA1_RSA_PKCS");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp160r1", "ECDSA_SHA1");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp192r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp256r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp384r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp256k1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP192r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP224r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP256r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP320r1", "ECDSA", "SHA256");
//             console.log();
//         } else {
//             defs.check_session();
//             if (!check_sign_algs(cmd.alg)) {
//                 const error = new Error("No such algorithm");
//                 throw error;
//             }
//             console.log();
//             print_test_sign_header();
//             test_sign(consoleApp.session, cmd, "rsa", "1024", "SHA1_RSA_PKCS");
//             test_sign(consoleApp.session, cmd, "rsa", "2048", "SHA1_RSA_PKCS");
//             test_sign(consoleApp.session, cmd, "rsa", "4096", "SHA1_RSA_PKCS");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp160r1", "ECDSA_SHA1");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp192r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp256r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp384r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "secp256k1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP192r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP224r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP256r1", "ECDSA", "SHA256");
//             test_sign(consoleApp.session, cmd, "ecdsa", "brainpoolP320r1", "ECDSA", "SHA256");
//             console.log();
//         }

//         return this;
//     }

// }