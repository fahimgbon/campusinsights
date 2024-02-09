import JSZip from "jszip";
import fs from "fs-extra";
import {InsightDatasetKind, IInsightFacade, InsightError, InsightDataset, InsightResult} from "./IInsightFacade";
import Section from "./Section";
import Dataset from "./Dataset";

const persistDir = "./data";

export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string, Dataset>;
	private data: Map<string, Section[]>; // data in content param is the most complicated; helpful to have access to

	constructor() {
		this.datasets = new Map<string, Dataset>();
		this.data = new Map<string, Section[]>();
        // Load cached datasets from disk
		this.loadDatasets();
	}

	public removeDataset(id: string): Promise<string> {
		throw new Error("Method not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		throw new Error("Method not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		throw new Error("Method not implemented.");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.isValidId(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		if (this.datasets.has(id)) {
			return Promise.reject(new InsightError("Dataset with ID " + id + " already exists."));
		}

		let zip = new JSZip();
		// loadAsync is specific to JSZip in comparison to Buffer.from(content, "base64"); loading contents of zip based on passed in param
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

	private parseAndSaveSections(id: string, files: JSZip.JSZipObject[]): Promise<string[]> {
		let sectionData: Section[] = [];
		let parseFilePromises: Array<Promise<void>> = [];

		for (let file of files) {
			parseFilePromises.push(this.parseFileContent(id, file, sectionData));
		}

		return Promise.all(parseFilePromises)
			.then(() => {
				if (sectionData.length === 0) {
					return Promise.reject(new InsightError("No valid section found"));
				}
				// !!! Passing in sectionContent into dataset
				let dataset = new Dataset(id, JSON.stringify(sectionData), InsightDatasetKind.Sections);
				this.datasets.set(id, dataset);
				this.data.set(id, sectionData);
				this.saveDataset(id, dataset, sectionData);

				// Returns all dataset IDs stored in memory
				return Array.from(this.datasets.keys());
			});
	}

	private parseFileContent(id: string, file: JSZip.JSZipObject, sectionData: Section[]): Promise<void> {
		return file.async("text")
			.then((text: string) => {
				let json = JSON.parse(text);
				if (!("result" in json) || !Array.isArray(json.result)) {
					throw new InsightError("Invalid file format: 'result' field missing or not an array");
				}
				let result = json.result;

				// checks every element of result array, ie every section
				if (result.length > 0) {
					for (let section of result) {
						if (this.isValidSection(section)) {
							let newSection = new Section(
								section.uuid,
								section.id,
								section.title,
								section.instructor,
								section.dept,
								section.year,
								section.avg,
								section.pass,
								section.fail,
								section.audit
							);

							// Add the section to sectionData
							sectionData.push(newSection);

							// Increment numRows by 1
							let currentDataset = this.datasets.get(id);
							if (currentDataset) {
								currentDataset.numRows++;
							} else {
								// !!! should this be NotFoundError?
								throw new InsightError("Dataset not found");
							}
						}
					}
				} else {
					throw new InsightError("Nothing in the result key"); // !!! Necessary check?
				}
			});
	}


	private isValidId(id: string): boolean {
        // Taken from interface
		return /^[^\s_]+$/.test(id);
	}

	private isValidSection(section: any): boolean {
        // A section is valid if it contains every field which can be used by a query and !!! if they are the correct types (should i check?)
		let fields = ["dept", "id", "avg", "instructor", "title", "pass", "fail", "audit", "uuid", "year"];
		for (let field of fields) {
			if (!(field in section)) {
				return false;
			}
		}
		return true;
	}

	private loadDatasets(): void {
        // Check if the data directory exists
		if (fs.existsSync(persistDir)) {
            // Get the files in the data directory
			let files = fs.readdirSync(persistDir);

            // Iterate through the files and load the datasets
			for (let file of files) {
                // Get the file path
				let filePath = persistDir + "/" + file;

                // Read the file content as JSON
				let json = fs.readJsonSync(filePath);

                // Get the id, content, and kind from the JSON !!!
				let id = json.id;
				let content = json.content;
				let kind = json.kind;

                // Create a new Dataset object with those paramaters
				let dataset = new Dataset(id, content, kind);

                // Add the dataset to datasets
				this.datasets.set(id, dataset);
			}
		}
	}

	private saveDataset(id: string, dataset: Dataset, data: Section[]): void {
		fs.ensureDirSync(persistDir);

        // Get the file path
		let filePath = persistDir + "/" + id + ".json";

        // Create a JSON object with the dataset and the data
		let json = {
			id: dataset.id,
			content: dataset.content,
			kind: dataset.kind,
			data: data
		};

        // Write the JSON object to the file
		fs.writeJsonSync(filePath, json);
	}
}

