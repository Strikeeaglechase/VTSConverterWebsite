function reader(data) {
    let head = 0;
    function read() {
        return data[head++];
    }
    function eof() {
        return head == data.length;
    }
    return [read, eof];
}
function vector(input) {
    const values = input.substring(1, input.length - 1).split(", ");
    return {
        x: parseFloat(values[0]),
        y: parseFloat(values[1]),
        z: parseFloat(values[2])
    };
}
function isVector(v) {
    return v.x != undefined;
}
const validNumbers = "1234567890.-";
const isNumric = (str) => str.split("").every(c => validNumbers.includes(c));
function parseValue(input) {
    if (input === "True")
        return true;
    if (input === "False")
        return false;
    if (input === "null")
        return null;
    if (input === "")
        return "";
    if (isNumric(input))
        return parseFloat(input);
    if (input[0] == "(")
        return vector(input);
    // if (input.includes(";") && !isNumric(input.split(";")[0])) return input.split(";").map(v => parseFloat(v));
    if (input.includes(";"))
        return input.split(";");
    return input;
}
function saveValue(input) {
    if (input === true)
        return "True";
    if (input === false)
        return "False";
    if (input === null)
        return "null";
    if (input === "")
        return "";
    if (Array.isArray(input))
        return input.join(";");
    if (isVector(input))
        return `(${input.x},${input.y},${input.z})`;
    return input.toString();
}
class Node {
    constructor(name) {
        this.values = {};
        this.nodes = [];
        this.name = name;
    }
    addNode(node) {
        this.nodes.push(node);
        return this;
    }
    getNode(name) {
        return this.nodes.find(n => n.name == name);
    }
    getNodes(name, recursive = true) {
        const matching = [];
        this.nodes.forEach(sn => {
            if (recursive)
                sn.getNodes(name).forEach(n => matching.push(n));
            if (sn.name == name)
                matching.push(sn);
        });
        return matching;
    }
    getValue(name) {
        return this.values[name];
    }
    setValue(name, value) {
        this.values[name] = value;
        return this;
    }
}
function parse(data) {
    const [read, eof] = reader(data);
    function _parse(name) {
        read(); // Skip opening {
        const node = new Node(name);
        while (!eof()) {
            const next = read();
            if (next == "}") {
                return node;
            }
            if (next.includes("=")) {
                const name = next.substring(0, next.indexOf(" ="));
                const valueIndex = next.indexOf("= ");
                if (valueIndex == -1)
                    node.setValue(name, "");
                else {
                    const value = parseValue(next.substring(valueIndex + 2));
                    node.setValue(name, value);
                }
            }
            else {
                node.addNode(_parse(next));
            }
        }
    }
    return _parse(read());
}
function save(node, dpth = 0) {
    let text = "";
    text += node.name + "\n" + "\t".repeat(dpth) + "{\n";
    Object.keys(node.values).forEach(key => {
        text += "\t".repeat(dpth + 1) + key + " = " + saveValue(node.values[key]) + "\n";
    });
    node.nodes.forEach(subnode => {
        text += "\t".repeat(dpth + 1) + save(subnode, dpth + 1);
    });
    return text + "\t".repeat(dpth) + "}\n";
}
export { parse, save, Node };
