import {InsightError, InsightResult} from "../controller/IInsightFacade";
import Section from "../controller/Section";

export class ApplyQuery {

	public errorThrown = false;

	public getSections(sections: Section[], query: any): object | string {
		this.errorThrown = false;

		const whereObject = query.WHERE;
		if (Object.keys(whereObject).length === 0) {
			if (sections.length > 5000) {
				return "resultTooLarge";
			}
			return this.makeInsightResult(sections, query.OPTIONS);
		}

		const sectionsFiltered = this.filterSections(sections, query.WHERE);

		if (sections.length > 5000) {
			return "resultTooLarge";
		}
		if(this.errorThrown) {
			return "error";
		}
		return this.makeInsightResult(sectionsFiltered, query.OPTIONS);
	}

	public makeInsightResult(sections: Section[], options: any): object {

		const results: any[] = [];
		let item = {};
		const columns = options["COLUMNS"];

		if (options.ORDER) {
			const order = options.ORDER.split("_")[1];
			console.log(order);
			sections.sort(
				(a, b) => (a as any)[order] - (b as any)[order]
			);
		}

		for(const section of sections) {
			item = {};
			for(const column of columns) {
				const key = column.split("_");
				(item as any)[column] = (section as any)[key[1]];
			}
			results.push(item);

		}

		return results;
	}

	public filterSections(sections: Section[], where: any): Section[] {

		const validSections = [];
		for (const section of sections) {
			const isSectionVaid = this.isSectionValid(section, where);
			if (isSectionVaid) {
				validSections.push(section);
			}
		}

		return validSections;
	}

	public isSectionValid(section: Section, currQuery: any): boolean {

		const mainKey = Object.keys(currQuery)[0];

		if(mainKey === "NOT") {
			return !this.isSectionValid(section, currQuery.NOT);
		} else if (mainKey === "IS") {
			return this.IS(section, currQuery);
		} else if (mainKey === "GT" || mainKey === "LT" || mainKey === "EQ") {
			return this.compare(section, currQuery);
		} else if (mainKey === "AND" || mainKey === "OR") {
			const andOrMainKey = Object.keys(currQuery)[0];
			const object = (currQuery as Record<string, any>)[andOrMainKey];

			if (andOrMainKey === "AND") {
				return object.every((member: any) => this.isSectionValid(section, member));
			} else if (andOrMainKey === "OR") {
				return object.some((member: any) => this.isSectionValid(section, member));
			}
		}
		throw new InsightError();
	}

	public IS(section: Section, currQuery: any) {
		const mainKey = Object.keys(currQuery.IS)[0];
		const value = currQuery.IS[mainKey];
		const valueOfSectionCol = (section as any)[mainKey.split("_")[1]];

		if (value === "*" || value === "**") {
			return true;
		}

		const charArray = [];

		for(const char of value) {
			charArray.push(char);
		}

		if (charArray.filter((char) => char === "*").length > 2) {
			this.errorThrown = true;
		}

		if (charArray.filter((char) => char === "*").length === 2 &&
		(!value.startsWith("*") || !value.endsWith("*"))) {
			this.errorThrown = true;
		}

		if (value.startsWith("*") && value.endsWith("*")) {
			return valueOfSectionCol.includes(value.substring(1, value.length - 1));
		} else if (value.endsWith("*")) {
			return valueOfSectionCol.includes(value.substring(0, value.length - 1));
		} else if (value.startsWith("*")) {
			return valueOfSectionCol.includes(value.substring(1, value.length));
		} else {
			return value === valueOfSectionCol;
		}
	}

	public compare(section: Section, currQuery: any): boolean {
		const mainKey = Object.keys(currQuery)[0];
		const mainObject = (currQuery as Record<string, any>)[mainKey];
		const compareObjectKey =  Object.keys(mainObject)[0];
		const valueOfSectionCol = (section as any)[compareObjectKey.split("_")[1]];
		const value = mainObject[compareObjectKey];

		if(mainKey === "GT") {
			return valueOfSectionCol > value;
		} else if (mainKey === "EQ") {
			return valueOfSectionCol === value;
		} else if (mainKey === "LT") {
			return valueOfSectionCol < value;
		}

		throw new InsightError();
	}
}
