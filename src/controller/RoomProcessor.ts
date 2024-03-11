import JSZip from "jszip";
import {KindProcessor} from "./KindProcessor";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import Dataset from "./Dataset";
import InsightFacade from "./InsightFacade";
import Room from "./Room";
import * as http from "http";
import * as parse5 from "parse5";

export default class RoomProcessor implements KindProcessor {
	// private node: DefaultTreeNode.Element;
	private insightFacade: InsightFacade;
	// private treeAdapter = parse5.treeAdapters.default;

	constructor(insightFacade: InsightFacade) {
		this.insightFacade = insightFacade;
	}

	// 	// Get the 'index.htm' file
	// 	// Parse the 'index.htm' file to get the building information - links; using parse5 to extract the buildings
	// 	// parseIndexFile
	// 	// Process each building
	// 	// check if a node meets condition to be considered a building period before we consider if its a valid building
	// 	// goal is to turn the node into JSON
	// 	// geolocation
	// 	// smells to for section vs room class; for if statement to determine kind type and for processing the zip initially

	public async processZipContents(id: string, kind: InsightDatasetKind, zipContents: JSZip): Promise<string[]> {
		if (kind !== InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Invalid kind"));
		}

		let indexFile = zipContents.file("index.htm");

		if (!indexFile) {
			return Promise.reject(new InsightError("Invalid index file"));
		}

		// Parse the index file and get the building short names and hrefs
		let buildings = await this.parseIndexFile(indexFile);

		// Filter the building files based on the hrefs in the index file
		let buildingFiles = buildings.map((building) => {
			// Remove './' from the start of the href path
			let path = building.href.startsWith("./") ? building.href.slice(2) : building.href;
			return zipContents.file(path);
		}).filter((file) => file !== null) as JSZip.JSZipObject[];

		// Pass the buildings array to parseAndSaveRooms
		return this.parseAndSaveRooms(id, buildingFiles, buildings);
	}


	private async parseIndexFile(file: JSZip.JSZipObject): Promise<Array<{shortname: string, href: string}>> {
		let buildings: Array<{shortname: string, href: string}> = [];

		return file.async("text")
			.then((text: string) => {
				// Parse the HTML file into a document
				const document = parse5.parse(text);
				// console.log("!!! document:", document);

				// Find the table with class "views-table cols-5 table"
				let table = this.findNode(document, "table", "views-table cols-5 table");

				if (table) {
					// Find all table rows within the table
					let rows = this.findNodes(table, "tr");
					// console.log("!!! rows:", rows);

					for (let row of rows) {
						// Find the td with class "views-field views-field-title" within the row
						let td = this.findNode(row, "td", "views-field views-field-title");
						// console.log("!!! td:", td);

						if (td) {
							// Find the a within the td
							let a = this.findNode(td, "a");
							// console.log("!!! a:", a);

							if (a) {
								// Get the href attribute
								let hrefAttr = a.attrs.find((attr: any) => attr.name === "href");

								if (hrefAttr) {
									let href = hrefAttr.value;
									// console.log("!!! href:", href);

									// Extract the shortname from the href
									let parts = href.split("/");
									let lastPart = parts[parts.length - 1]; // Get the last part of the href
									let shortname = lastPart.split(".")[0]; // Split the last part by "." and get the first element
									// console.log("!!! shortname:", shortname);

									if (shortname && href) {
										buildings.push({shortname, href});
									}
								}
							}
						}
					}
				}

				return buildings;
			});
	}

	private async parseFileContent(file: JSZip.JSZipObject, roomData: Room[],
		building: {shortname: string, href: string}): Promise<Array<{shortname: string, href: string}>> {
		let buildings: Array<{shortname: string, href: string}> = [];

		return file.async("text")
			.then(async (text: string) => {
				// Parse the HTML file into a document
				const document = parse5.parse(text);
				// console.log("!!! document:", document);
				let buildingInfo = this.findNodeById(document, "div", "building-info");
				// console.log("!!! buildingInfo:", buildingInfo);
				let fullname;
				let address;

				if (buildingInfo) {
					// Find the h2 and the first two divs within the buildingInfo
					let h2 = this.findNode(buildingInfo, "h2");
					let divs = this.findNodes(buildingInfo, "div");

					if (h2 && divs) {
						// Find the span within the h2
						let span = this.findNode(h2, "span");
						let div2 = divs[1].childNodes[0];

						if (span && div2) {
							// Find the text within the span and the divs
							fullname = this.findNode(span, "#text").value.trim();
							address = this.findNode(div2,"#text").value.trim();
							// console.log("Full Name:", fullname);
							// console.log("Address:", address);
						}
					}
				}

				// Fetch the geolocation of the address
				let geolocation = await this.fetchGeolocation(address);

				// Find the table with class "views-table cols-5 table"
				let table = this.findNode(document, "table", "views-table cols-5 table");
				// console.log("!!! table:", table);

				if (table) {
					// Find all table rows within the table
					let rows = this.findNodes(table, "tr");
					// console.log("!!! rows:", rows);

					for (let row of rows) {
						// Find the td with class "views-field views-field-title" within the row
						let tdNumber = this.findNode(row, "td", "views-field views-field-field-room-number");
						let tdCapacity = this.findNode(row, "td", "views-field views-field-field-room-capacity");
						let tdFurniture = this.findNode(row, "td", "views-field views-field-field-room-furniture");
						let tdType = this.findNode(row, "td", "views-field views-field-field-room-type");
						// console.log("!!! td:", td);

						if (tdNumber && tdCapacity && tdFurniture && tdType) {
							// Find the a within the td
							let a = this.findNode(tdNumber, "a");

							// Extract the room number from the href attribute
							let number = a.attrs.find((attr: any) =>
								attr.name === "href").value.split("-").pop().trim();
							let seats = this.findNode(tdCapacity, "#text").value.trim();
							let furniture = this.findNode(tdFurniture, "#text").value.trim();
							let type = this.findNode(tdType, "#text").value.trim();
							// let shortname = building.shortname;
							// let href = building.href;
							let name = building.shortname + "_" + number;
							// let lat = geolocation.lat;
							// let lon = geolocation.lon;
							// Create a new Room object and add it to the roomData array
							let room = new Room(
								fullname, building.shortname, number, name, seats,
								type, furniture, address, geolocation.lat, geolocation.lon, building.href);
							roomData.push(room);

						}
					}
				}

				return buildings;
			});
	}

	private findNodeById(node: any, nodeName: string, idName: string): any | null {
		if (node && node.nodeName === nodeName && node.attrs.some((attr: any) =>
			attr.name === "id" && attr.value.includes(idName))) {
			return node;
		}
		if (!node || !node.childNodes) {
			return null;
		}
		for (let childNode of node.childNodes) {
			let result: any | null = this.findNodeById(childNode as any, nodeName, idName);
			if (result) {
				return result;
			}
		}
		return null;
	}

	private findNodes(node: any, nodeName: string): any[] {
		let nodes: any[] = [];
		if (node.nodeName === nodeName) {
			// console.log("inner nodeName!!!", node.nodeName);
			nodes.push(node);
		}
		if (node.childNodes) {
			for (let childNode of node.childNodes) {
				nodes = nodes.concat(this.findNodes(childNode as any, nodeName));
			}
		}
		return nodes;
	}

	private async parseAndSaveRooms(id: string, buildingFiles: JSZip.JSZipObject[],
		buildings: Array<{shortname: string, href: string}>): Promise<string[]> {
		let roomData: Room[] = [];

		// Create an array of promises
		let promises = buildingFiles.map((file, i) => {
			if (file) { // Check if file is not null
				return this.parseFileContent(file, roomData, buildings[i]);
			}
		});
		// console.log("!!! promises1:", promises);

		// Wait for all promises to resolve
		await Promise.all(promises).catch((error) => {
			// console.log("An error occurred:", error);
		});
		// console.log("!!! promises2:", promises);

		if (roomData.length === 0) {
			throw new InsightError("No valid rooms found");
		}
		// console.log("!!! roomLength:", roomData.length);

		let dataset = new Dataset(id, JSON.stringify(roomData), InsightDatasetKind.Rooms);
		this.insightFacade.datasets.set(id, dataset);
		this.insightFacade.data.set(id, roomData);

		dataset.numRows = roomData.length;
		// console.log("!!! Numrooms:", roomData.length);

		await this.insightFacade.saveDataset(id, dataset, roomData); // Await saveDataset() call
		return Array.from(this.insightFacade.datasets.keys());
	}

	private findNode(node: any, nodeName: string, className?: string): any | null {
		if (node && node.nodeName === nodeName && (!className || node.attrs.some((attr: any) =>
			attr.name === "class" && attr.value.includes(className)))) {
			return node;
		}

		if (!node || !node.childNodes) {
			return null;
		}

		for (let childNode of node.childNodes) {
			let result: any | null = this.findNode(childNode as any, nodeName, className);
			if (result) {
				return result;
			}
		}

		return null;
	}

	private async fetchGeolocation(address: string): Promise<{lat: number, lon: number}> {
		return new Promise((resolve, reject) => {
			const encodedAddress = encodeURIComponent(address);
			const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team106/${encodedAddress}`;

			http.get(url, (result: http.IncomingMessage) => {
				let data = "";

				result.on("data", (responseData: string) => {
					data += responseData;
				});

				result.on("end", () => {
					const geoResponse = JSON.parse(data);
					if (geoResponse.error) {
						reject(new InsightError(geoResponse.error));
					} else {
						resolve({lat: geoResponse.lat, lon: geoResponse.lon});
					}
				});
			}).on("error", (err: Error) => {
				reject(new InsightError(err.message));
			});
		});
	}

}
