import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import {Buffer} from "buffer";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	private datasets: InsightDataset[] = [];

	// Helpers
	public isValidId(id: string): boolean {
		if (/^[^_]+$/.test(id) && id.trim() === "") {
			return true;
		} else {
			throw new InsightError("Invalid dataset ID");
		}
	}

	// Citation - ChatGPT
	public isBase64(content: string): boolean {
		try {
			Buffer.from(content, "base64"); // Attempt to decode
			return true; // If decoding succeeds, it's base64
		} catch (error) {
			return false; // If decoding fails, it's not base64
		}
	}

	public async processZip(content: string): Promise<string> {
		return Promise.reject("Not implemented.");
		try {
			/* Steps
			-- loadDataset - will load from disk
			-- make sure it is in course/ directory
				1. Create a for each loop to perform actions on each file
				2. * Make sure file is not folder, and is instead JSON, !!! if it is folder, should it be skipped? *
				3. Read file as text and parse it as JSON
				4. Check if  there is a "result" key
					* Check to see if all valid query keys are in result  [InsightResult] *don’t care if there’s extra, !!! Are extra keys still added*
						* If all valid keys are in result, append to list of valid Dataset[] // !!! makeDataset check if any of the keys are missing - let valid = big bool statement + if(valid)
							* !!! 3.3.1 Dataset Processor: Modeling Sections Data w/ class
					* If no "result" key, invalid section, skip and move to the next
				5. Repeat steps for each file
				6. To add the dataset we need to have 1 valid section
			*/
		} catch (error) {
			throw new InsightError("Invalid content");
		}
	}

	public isValidKind(kind: InsightDatasetKind): boolean {
		return kind === InsightDatasetKind.Sections;
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.isValidId(id)) {
			throw new InsightError("Invalid dataset ID");
		}

		if (!this.isBase64(content)) {
			throw new InsightError("Invalid dataset content");
		}

		if (!this.isValidKind(kind)) {
			throw new InsightError("Invalid dataset kind");
		}

		return Promise.resolve([]);
		// declare dataset variable, InsightDataset[]
		// !!! Check if ID already exists - If id is the same as the id of an already added dataset, the dataset should be rejected and not saved.
		// Get zip data
		// Parse course data and extract valid sections
		// The processed data structure should be persisted to disk; your system should be able to load this persisted value into memory for answering queries.
		// Add Dataset somewhere in memory // is this a new variable that needs to be created and if so, what datastructure?
	}

	public async removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}


}
