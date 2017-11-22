function splitCommand(cmd: string) {
    const res: string[] = [];
    let found = false;
    let quote = false;
    let str = "";
    for (let i = 0; i < cmd.length; i++) {
        const char = cmd.charAt(i);
        if (char !== " " || quote) {
            if (char === "\"") {
                quote = !quote;
                continue;
            }
            found = true;
            str += char;
        } else if (str !== "") {
            res.push(str);
            found = false;
            str = "";
        }
    }
    if (str) {
        res.push(str);
    }
    return res;
}

export function parse(input: string) {
    input = input.trim();

    return splitCommand(input);
}
