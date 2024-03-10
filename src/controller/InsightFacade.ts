import JSZip from "jszip";
import fs from "fs-extra";
import {
	InsightDatasetKind,
	IInsightFacade,
	InsightError,
	InsightDataset,
	InsightResult,
	NotFoundError,
	ResultTooLargeError} from
	"./IInsightFacade";
import Section from "./Section";
import Dataset from "./Dataset";
import path from "path";
import {KindProcessor} from "./KindProcessor";
import SectionProcessor from "./SectionProcessor";
import RoomProcessor from "./RoomProcessor";
import Room from "./Room";
import {QueryValidator} from "../performQuery/QueryValidator";
import {ApplyQuery} from "../performQuery/ApplyQuery";

const persistDir = "./data";

export default class InsightFacade implements IInsightFacade {
	// private static datasets: Map<string, Dataset> = new Map<string, Dataset>();
	public datasets: Map<string, Dataset>;
	// public data: Map<string, Section[]>; // data in content param is the most complicated; helpful to have access to
	public data: Map<string, (Section[] | Room[])>;

	constructor() {
		this.datasets = new Map<string, Dataset>();
		// console.log("Constructor:", this.datasets.keys);
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

	public async removeDataset(id: string): Promise<string> {
		if (!this.isValidId(id)) {
			return Promise.reject(new InsightError("Invalid id"));
		}

		const filePath = path.join(persistDir, `${id}.json`);
		const exists = await fs.pathExists(filePath);
		if (!exists) {
			throw new NotFoundError("Dataset not found");
		}

		try {
			await fs.unlink(filePath);
			this.datasets.delete(id); // Also remove from memory
		} catch (error) {
			throw new InsightError(`Failed to remove dataset from disk: ${error}`);
		}

		return id;
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const queryValidator = new QueryValidator();
		const isQueryValid = queryValidator.isQueryValid(query);
		if(!isQueryValid) {
			return Promise.reject(new InsightError("Insight Error: the query is not valid."));
		}
		const sections = this.data.get(queryValidator.idsArray[0]);
		if(!sections) {
			return Promise.reject(new InsightError("Insight Error: dataset not found."));
		}
		const applyQuery = new ApplyQuery();
		const results = applyQuery.getSections(sections, query);
		if (!results) {
			return Promise.reject(new ResultTooLargeError());
		}
		return Promise.resolve(results as InsightResult[]);
	}

	// worried may not work for multiple instances of insightafacade because i'm using datasets variable instead of json content
	public async listDatasets(): Promise<InsightDataset[]> {
		// console.log("Values:", [...this.datasets.values()]);
		return Array.from(this.datasets.values()).map((dataset) => ({
			id: dataset.id,
			kind: dataset.kind,
			numRows: dataset.numRows
		}));
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
			.then((unzippedContents: JSZip) => {
				let processor: KindProcessor;
				if (kind === InsightDatasetKind.Rooms) {
					processor = new RoomProcessor(this); // ChatGPT - Passing a reference to the InsightFacade instance to the class so I can modify the data/datasets variables
				} else if (kind === InsightDatasetKind.Sections) {
					processor = new SectionProcessor(this);
				} else {
					return Promise.reject(new InsightError("Invalid kind"));
				}
				return processor.processZipContents(id, kind, unzippedContents);
			})
			.catch((error) => {
				return Promise.reject(new InsightError(error));
			});
	}


	// ChatGPT
	public isValidId(id: string): boolean {
		return /^[^\s_][^_]*[^\s_]$/.test(id.trim());
	}

	public async loadDatasets(): Promise<void> {
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
						// console.log("Last Set:", this.datasets.keys);
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

	public async saveDataset(id: string, dataset: Dataset, data: (Section[] | Room[])): Promise<void> {
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


