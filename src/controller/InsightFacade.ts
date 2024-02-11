import JSZip from "jszip";
import fs from "fs-extra";
import {InsightDatasetKind, IInsightFacade, InsightError, InsightDataset, InsightResult} from "./IInsightFacade";
import Section from "./Section";
import Dataset from "./Dataset";
import path from "path";

const persistDir = "./data";

export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string, Dataset>;
	private data: Map<string, Section[]>; // data in content param is the most complicated; helpful to have access to

	constructor() {
		this.datasets = new Map<string, Dataset>();
		this.data = new Map<string, Section[]>();

		// Call the async initialize method immediately after construction
		this.initialize()
			.then(() => console.log("Initialization completed successfully"))
			.catch((error) => console.error(`Failed to initialize: ${error}`));
	}

	private async initialize(): Promise<void> {
		try {
			await this.loadDatasets();
		} catch (error) {
			throw new Error(`Failed to initialize: ${error}`);
		}
	}

	public removeDataset(id: string): Promise<string> {
		throw new Error("Method not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		throw new Error("Method not implemented.");
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return Array.from(this.datasets.values());
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.isValidId(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		// Check if a file with the same ID already exists in the persistDir directory
		const filePath = path.join(persistDir, `${id}.json`);
		const exists = await fs.pathExists(filePath);
		if (exists) {
			return Promise.reject(new InsightError("Dataset with ID " + id + " already exists."));
		}

		let zip = new JSZip();
		return zip.loadAsync(content, {base64: true})
			.then((unzippedContents: JSZip) => this.processZipContents(id, kind, unzippedContents))
			.catch((error) => {
				return Promise.reject(new InsightError(error));
			});
	}

	private processZipContents(id: string, kind: InsightDatasetKind, zipContents: JSZip): Promise<string[]> {
		if (kind !== InsightDatasetKind.Sections) {
			return Promise.reject(new InsightError("Invalid kind"));
		}

		let folderName = "courses/";
		// files is of type JSZip.JSZipObject[] - ChatGPT:
		let files = zipContents.folder(folderName)?.file(/.*/);

		if (!files || files.length === 0) {
			return Promise.reject(new InsightError("Empty or invalid folder"));
		}

		return this.parseAndSaveSections(id, files);
	}

	private async parseAndSaveSections(id: string, files: JSZip.JSZipObject[]): Promise<string[]> {
		let sectionData: Section[] = [];
		let parseFilePromises: Array<Promise<void>> = [];

		for (let file of files) {
			parseFilePromises.push(this.parseFileContent(file, sectionData));
			// console.log("id:", id);
			// console.log("file:", file);
			// console.log("Section Data", sectionData);
		}

		try {
			await Promise.all(parseFilePromises);

			if (sectionData.length === 0) {
				throw new InsightError("No valid section found");
			}

			let dataset = new Dataset(id, JSON.stringify(sectionData), InsightDatasetKind.Sections);
			this.datasets.set(id, dataset);
			this.data.set(id, sectionData);

			let rows = 0;
			for (let section of sectionData) {
				rows++;
			}

			dataset.numRows = rows;
			await this.saveDataset(id, dataset, sectionData); // Await saveDataset() call
			return Array.from(this.datasets.keys());
		} catch (error) {
			throw new InsightError(`Failed to parse and save sections: ${error}`);
		}
	}

	private parseFileContent(file: JSZip.JSZipObject, sectionData: Section[]): Promise<void> {
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
				for (let section of result) {
					// console.log("Section:", section);
					// console.log("Professor1:", section.Professor);
					if (this.isValidSection(section)) {
						// console.log("Professor2:", section.Professor);
						let newSection = new Section(
							section.id,
							section.Course,
							section.Title,
							section.Professor,
							section.Subject,
							section.Year,
							section.Avg,
							section.Pass,
							section.Fail,
							section.Audit
						);
						// console.log("NewSection:", newSection);
						// Add the section to sectionData
						sectionData.push(newSection);
					}
				}
				// } else {
				// 	throw new InsightError("Nothing in the result key"); // !!! Necessary check?
				// }
			});
	}

	private isValidId(id: string): boolean {
        // Taken from interface
		return /^[^\s_]+$/.test(id);
	}

	private isValidSection(section: any): boolean {
        // A section is valid if it contains every field which can be used by a query and !!! if they are the correct types (should i check?)
		let fields = ["id", "Course", "Title", "Professor", "Subject", "Year", "Avg", "Pass", "Fail", "Audit"];
		for (let field of fields) {
			if (!(field in section)) {
				return false;
			}
		}
		return true;
	}

	private async loadDatasets(): Promise<void> {
		try {
			// Check if the data directory exists
			const exists = await fs.promises.access(persistDir, fs.constants.F_OK)
				.then(() => true)
				.catch(() => false);
			if (exists) {
				// Get the files in the data directory
				const files = await fs.promises.readdir(persistDir);

				// Load the datasets asynchronously
				await Promise.all(files.map(async (file) => {
					try {
						// Get the file path
						const filePath = path.join(persistDir, file);

						// Read the file content
						const data = await fs.promises.readFile(filePath, "utf-8");

						// Parse the JSON data
						const json = JSON.parse(data);

						// Get the id, content, and kind from the JSON
						const id = json.id;
						const content = json.content;
						const kind = json.kind;

						// Create a new Dataset object with those parameters
						const dataset = new Dataset(id, content, kind);

						// Add the dataset to datasets
						// console.log("Last Set:", this.datasets);
						this.datasets.set(id, dataset);
					} catch (error) {
						console.error(`Failed to load dataset from file ${file}: ${error}`);
					}
				}));
			}
		} catch (error) {
			throw new Error(`Failed to load datasets: ${error}`);
		}
	}

	private async saveDataset(id: string, dataset: Dataset, data: Section[]): Promise<void> {
		try {
			// Ensure the data directory exists
			await fs.promises.mkdir(persistDir, {recursive: true});

			// Get the file path
			const filePath = path.join(persistDir, `${id}.json`);

			// Create a JSON object with the dataset and the data
			const json = {
				id: dataset.id,
				content: dataset.content,
				kind: dataset.kind,
				data: data
			};

			// console.log("JSON", json);
			// Write the JSON object to the file
			await fs.promises.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
		} catch (error) {
			throw new Error(`Failed to save dataset: ${error}`);
		}
	}

}

