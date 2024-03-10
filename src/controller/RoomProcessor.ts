import JSZip from "jszip";
import {KindProcessor} from "./KindProcessor";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import Dataset from "./Dataset";
import InsightFacade from "./InsightFacade";
import Room from "./Room";


export default class RoomProcessor implements KindProcessor {
	private insightFacade: InsightFacade;

	constructor(insightFacade: InsightFacade) {
		this.insightFacade = insightFacade;
	}

	public processZipContents(id: string, kind: InsightDatasetKind, zipContents: JSZip): Promise<string[]> {
		if (kind !== InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Invalid kind"));
		}

		let folderName = "campus/";
		// files is of type JSZip.JSZipObject[] - ChatGPT:
		let files = zipContents.folder(folderName)?.file(/.*/);

		if (!files || files.length === 0) {
			return Promise.reject(new InsightError("Empty or invalid folder"));
		}

		// !!!
		// return Promise.reject(new InsightError("Empty or invalid folder"));
		return this.parseAndSaveRooms(id, files);
		// Get the 'index.htm' file
		// Parse the 'index.htm' file to get the building information - links; using parse5 to extract the buildings
		// parseIndexFile
		// Process each building
		// check if a node meets condition to be considered a building period before we consider if its a valid building
		// goal is to turn the node into JSON
		// geolocation
		// smells to for section vs room class; for if statement to determine kind type and for processing the zip initially
	}

	private async parseAndSaveRooms(id: string, files: JSZip.JSZipObject[]): Promise<string[]> {
		let roomData: Room[] = [];
		let parseFilePromises: Array<Promise<void>> = [];

		for (let file of files) {
			parseFilePromises.push(this.parseFileContent(file, roomData));
		}

		try {
			await Promise.all(parseFilePromises);

			if (roomData.length === 0) {
				throw new InsightError("No valid rooms found");
			}

			let dataset = new Dataset(id, JSON.stringify(roomData), InsightDatasetKind.Rooms);
			this.insightFacade.datasets.set(id, dataset);
			this.insightFacade.data.set(id, roomData);

			let rows = 0;
			// console.log("Rows init", rows);
			// console.log("Rows dataset init", dataset.numRows);
			for (let room of roomData) {
				rows++;
			}

			dataset.numRows = rows;
			//

			await this.insightFacade.saveDataset(id, dataset, roomData); // Await saveDataset() call
			return Array.from(this.insightFacade.datasets.keys());
		} catch (error) {
			throw new InsightError(`Failed to parse and save rooms: ${error}`);
		}
	}

	private parseFileContent(file: JSZip.JSZipObject, roomData: Room[]): Promise<void> {
		return file.async("text")
			.then((text: string) => {
				// console.log("Text:", text);
				let json = JSON.parse(text);
				if (!("result" in json) || !Array.isArray(json.result)) {
					throw new InsightError("Invalid file format: 'result' field missing or not an array");
				}
				let result = json.result;
				// console.log("Result:", result);

				// checks every element of result array, ie every section
				// if (result.length > 0) {
				for (let room of result) {
					if (this.isValidRoom(room)) {
						let newRoom = new Room(
							room.fullname,
							room.shortname + "_" + room.number,
							room.number,
							room.name,
							room.seats,
							room.type,
							room.furniture,
							room.address,
							room.lat,
							room.lon,
							room.href
						);
						// Add the room to roomData
						roomData.push(newRoom);
					}
				}
				// } else {
				// 	throw new InsightError("Nothing in the result key"); // !!! Necessary check?
				// }
			});
	}

	private isValidRoom(room: any): boolean {
        // A room is valid if it contains every field which can be used by a query and !!! if they are the correct types (should i check?)
		let fields = [
			"fullname",
			"shortname",
			"number",
			"name",
			"seats",
			"type",
			"furniture",
			"address",
			"lat",
			"lon",
			"href"];

		for (let field of fields) {
			if (!(field in room)) {
				return false;
			}
		}
		return true;
	}
}
