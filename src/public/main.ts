import { Node, parse, RawNode, save } from "./parser.js";

class App {
	private vtsDisplay: HTMLParagraphElement;
	private jsonDisplay: HTMLParagraphElement;

	constructor() {
		this.vtsDisplay = document.getElementById("vts") as HTMLParagraphElement;
		this.jsonDisplay = document.getElementById("json") as HTMLParagraphElement;

		const vtsBtn = document.getElementById("vts-in") as HTMLButtonElement;
		const jsonBtn = document.getElementById("json-in") as HTMLButtonElement;

		vtsBtn.addEventListener("click", () => this.setVts());
		jsonBtn.addEventListener("click", () => this.setJson());
	}

	private validateVts(node: Node) {
		const spawns = node.getNodes("UnitSpawner", true);
		const ids = new Set<number>();

		spawns.forEach(spawn => {
			const id = spawn.getValue("unitInstanceID") as number;
			if (ids.has(id)) {
				console.error(`Duplicate ID ${id} found. Second occurrence on ${spawn.getValue("unitName")} (${spawn.getValue("unitID")})`);
			} else {
				ids.add(id);
			}
		});
	}

	private setVts() {
		const vts = prompt("Enter VTS");
		this.vtsDisplay.innerHTML = this.parseString(vts);

		const node = parse(vts.split("\n").map(line => line.trim()));
		if (!node) {
			console.error(`Failed to parse VTS`);
		} else {
			console.log(`Parsed VTS:`);
			console.log(node);
			this.validateVts(node);
			this.jsonDisplay.innerHTML = this.parseObj(node);
		}
	}

	private setJson() {
		const json = prompt("Enter JSON");
		this.jsonDisplay.innerHTML = this.parseString(json);

		const node = this.jsonToNode(json);
		if (!node) {
			console.error(`Failed to parse JSON`);
		} else {
			console.log(`Parsed JSON:`);
			console.log(node);
			this.validateVts(node);
			this.vtsDisplay.innerHTML = this.parseString(save(node));
		}
	}

	private jsonToNode(json: string): Node {
		const data = JSON.parse(json) as RawNode;
		function recurse(nodeData: RawNode) {
			const node = new Node(nodeData.name);

			for (const key in nodeData.values) {
				node.setValue(key, nodeData.values[key]);
			}
			nodeData.nodes.forEach(child => node.addNode(recurse(child)));

			return node;
		}

		return recurse(data);
	}

	private parseString(str: string) {
		return str.split("\n").join("<br>").split(" ").join("&nbsp;").split("\t").join("&nbsp;&nbsp;&nbsp;&nbsp;");
	}

	private parseObj(obj: object) {
		return this.parseString(JSON.stringify(obj, null, 2));
	}

	// private updateOutput(obj: object) {
	// 	this.jsonDisplay.innerHTML = JSON.stringify(obj, null, 2).split("\n").join("<br>").split(" ").join("&nbsp;");
	// }
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