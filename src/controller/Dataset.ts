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

	public setId(id: string): void {
		this.id = id;
	}

	public setContent(content: string): void {
		this.content = content;
	}

	public setKind(kind: InsightDatasetKind): void {
		this.kind = kind;
	}

	public setNumRows(numRows: number): void {
		this.numRows = numRows;
	}
}
