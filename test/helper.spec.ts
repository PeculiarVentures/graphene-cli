import {expect} from "chai";
import {get32IntFromBuffer, int32toBuffer} from "../src/helper";

describe("helper.ts", function() {
    describe("int32toBuffer", () => {
        (new Array(1000)).fill(0)
            .map(() => Math.floor(Math.random() * 1000000))
            .forEach((n) => {

                it(`Expect to get32IntFromBuffer(int32toBuffer(${n})) = ${n}`, () => {
                    const buf = int32toBuffer(n);
                    expect(get32IntFromBuffer(buf)).to.be.equal(n);
                });
            });
        // it(`Expect to number `, () => {
        //     const buf = int32toBuffer(100);
        //     expect(get32IntFromBuffer(buf)).to.be.equal(100);
        // });
    });
});
