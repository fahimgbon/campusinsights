import JSZip from "jszip";
import {KindProcessor} from "./KindProcessor";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import Dataset from "./Dataset";
import Section from "./Section";
import InsightFacade from "./InsightFacade";


export default class SectionProcessor implements KindProcessor {
	private insightFacade: InsightFacade;

	constructor(insightFacade: InsightFacade) {
		this.insightFacade = insightFacade;
	}

	public processZipContents(id: string, kind: InsightDatasetKind, zipContents: JSZip): Promise<string[]> {
		if (kind !== InsightDatasetKind.Sections) {
			return Promise.reject(new InsightError("Invalid kind"));
		}

		let folderName = "courses/";
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
			this.insightFacade.datasets.set(id, dataset);
			this.insightFacade.data.set(id, sectionData);

			let rows = 0;
			// console.log("Rows init", rows);
			// console.log("Rows dataset init", dataset.numRows);
			for (let section of sectionData) {
				rows++;
			}

			dataset.numRows = rows;

			await this.insightFacade.saveDataset(id, dataset, sectionData); // Await saveDataset() call
			return Array.from(this.insightFacade.datasets.keys());
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
}
