import { Node, parse, save } from "./parser.js";
class App {
    constructor() {
        this.vtsDisplay = document.getElementById("vts");
        this.jsonDisplay = document.getElementById("json");
        const vtsBtn = document.getElementById("vts-in");
        const jsonBtn = document.getElementById("json-in");
        vtsBtn.addEventListener("click", () => this.setVts());
        jsonBtn.addEventListener("click", () => this.setJson());
    }
    validateVts(node) {
        const spawns = node.getNodes("UnitSpawner", true);
        const ids = new Set();
        spawns.forEach(spawn => {
            const id = spawn.getValue("unitInstanceID");
            if (ids.has(id)) {
                console.error(`Duplicate ID ${id} found. Second occurrence on ${spawn.getValue("unitName")} (${spawn.getValue("unitID")})`);
            }
            else {
                ids.add(id);
            }
        });
    }
    setVts() {
        const vts = prompt("Enter VTS");
        this.vtsDisplay.innerHTML = this.parseString(vts);
        const node = parse(vts.split("\n").map(line => line.trim()));
        if (!node) {
            console.error(`Failed to parse VTS`);
        }
        else {
            console.log(`Parsed VTS:`);
            console.log(node);
            this.validateVts(node);
            this.jsonDisplay.innerHTML = this.parseObj(node);
        }
    }
    setJson() {
        const json = prompt("Enter JSON");
        this.jsonDisplay.innerHTML = this.parseString(json);
        const node = this.jsonToNode(json);
        if (!node) {
            console.error(`Failed to parse JSON`);
        }
        else {
            console.log(`Parsed JSON:`);
            console.log(node);
            this.validateVts(node);
            this.vtsDisplay.innerHTML = this.parseString(save(node));
        }
    }
    jsonToNode(json) {
        const data = JSON.parse(json);
        function recurse(nodeData) {
            const node = new Node(nodeData.name);
            for (const key in nodeData.values) {
                node.setValue(key, nodeData.values[key]);
            }
            nodeData.nodes.forEach(child => node.addNode(recurse(child)));
            return node;
        }
        return recurse(data);
    }
    parseString(str) {
        return str.split("\n").join("<br>").split(" ").join("&nbsp;").split("\t").join("&nbsp;&nbsp;&nbsp;&nbsp;");
    }
    parseObj(obj) {
        return this.parseString(JSON.stringify(obj, null, 2));
    }
}
function init() {
    console.log(`Init`);
    window.onload = () => {
        console.log("Window loaded");
        const app = new App();
        // @ts-ignore
        window.app = app;
    };
}
init();
