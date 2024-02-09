import {InsightDatasetKind, InsightDataset, InsightError} from "./IInsightFacade";
import Section from "./Section";

export default class Dataset implements InsightDataset {
	public id: string;
	public content: string;
	public kind: InsightDatasetKind; // kind is a section
	public numRows: number;

	constructor(id: string, content: string, kind: InsightDatasetKind) {
		this.id = id;
		this.content = content;
		this.kind = kind;
		// !!! if (kind.length > 0) {
		// 	this.numRows = kind.length;
		// } else {
		// 	throw new InsightError("Empty dataset");
		// }
		this.numRows = 0;
	}

	public getId(): string {
		return this.id;
	}

	public getContent(): string {
		return this.content;
	}

	public getKind(): InsightDatasetKind {
		return this.kind;
	}

	public getNumRows(): number {
		return this.numRows;
	}
}

