import {expect, use} from "chai";
import {readFile} from "fs";
import NodeRSA = require("node-rsa");
import {KeyComponentsPublic} from "node-rsa";
import {resolve} from "path";
import {stub} from "sinon";
import {promisify} from "util";
import {importRSAPublicKey, int32toBuffer} from "../src/helper";
use(require("sinon-chai"));
const readFilAsync = promisify(readFile);

const rsaUtils = require("node-rsa/src/utils");

const MAX_INT32 =  Math.pow(2, 32) - 1;

describe("helper.ts", function() {
    describe("int32toBuffer", () => {
        (new Array(100)).fill(0)
            .map(() => Math.floor(Math.random() * MAX_INT32))
            .forEach((n) => {
                it(`Expect to get32IntFromBuffer(int32toBuffer(${n})) = ${n}`, () => {
                    const buf = int32toBuffer(n);
                    expect(rsaUtils.get32IntFromBuffer(buf)).to.be.equal(n);
                });
            });
    });
    describe("importRSAPublicKey", function() {
        let pubKey: Buffer;
        const label = "someLabel";
        const session  = {
            create: stub(),
            toType: stub(),
        };
        before( async () => {
            pubKey = await readFilAsync(resolve("./test/keys/public_pkcs8.pem"));
        });
        beforeEach( () => {
            session.create.reset();
            session.toType.reset();
        });
        it("should import modulus and publicExponent in the hsm", async () => {
            const pkey = new NodeRSA(pubKey.toString(), "pkcs8-public-pem");
            session.create.callsFake((templ) => {
                const rsa2 = new NodeRSA();
                rsa2.importKey({
                    n: templ.modulus,
                    e: templ.publicExponent,
                } as KeyComponentsPublic, "components-public");
                expect(pubKey.toString()).to.be.equal(rsa2.exportKey("pkcs8-public").toString());
                return session;
            });
            importRSAPublicKey(session as any, pkey, label, true);
            expect(session.create).to.have.been.calledOnce;
            expect(session.toType).to.be.calledOnce;
        });
    });
});
