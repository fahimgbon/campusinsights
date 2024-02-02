import {InsightDatasetKind} from "./IInsightFacade";
import Section from "./Section";

export default class Dataset {
	private id: string;
	private kind: InsightDatasetKind = InsightDatasetKind.Sections;
	private numRows: number;
	private sections: Section[] = [];
	constructor(id: string, numRows: number, sections: Section[]) {
		this.id = id;
		this.numRows = numRows;
		this.sections = sections;
	}

	public getId(): string {
		return this.id;
	}

	public getKind(): InsightDatasetKind {
		return this.kind;
	}

	public getNumRows(): number {
		return this.numRows;
	}

	public getSections(): Section[] {
		return this.sections;
	}
}

