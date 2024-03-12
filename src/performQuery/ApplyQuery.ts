import {InsightError, InsightResult} from "../controller/IInsightFacade";
import Room from "../controller/Room";
import Section from "../controller/Section";

export class ApplyQuery {

	public getSections(sectionsOrRooms: Section[] | Room[], query: any, isRoom: boolean): object | null {

		const whereObject = query.WHERE;
		if (Object.keys(whereObject).length === 0) {
			if (sectionsOrRooms.length > 5000) {
				return null;
			}
			return this.makeInsightResult(sectionsOrRooms, query.OPTIONS, undefined);
		}

		let sectionsFiltered = this.filterSections(sectionsOrRooms, query.WHERE);

		if (sectionsFiltered.length > 5000) {
			return null;
		}

		if (query.TRANSFORMATIONS) {
			const sectionsFiltered2 = this.applyTransformations(sectionsFiltered, query.TRANSFORMATIONS, query);
			return this.makeInsightResult(sectionsFiltered, query.OPTIONS, sectionsFiltered2);
		}
		return this.makeInsightResult(sectionsFiltered, query.OPTIONS, undefined);
	}

	public applyTransformations(sectionsOrRooms: any[], trans: any, query: any) {
		const groupKeys = trans.GROUP;
		const groups: Record<string , any[]> = {};

		for (const sectionOrRoom of sectionsOrRooms) {
			const sectionProperties: Record<string, any> = {};
			for (const key of groupKeys) {
				const colName = key.split("_")[1];
				const colValue = sectionOrRoom[colName];
				sectionProperties[key] = colValue;
			}
			let mainKey = JSON.stringify(sectionProperties);
			if (!groups[mainKey]) {
				let tempArr = [];
				tempArr.push(sectionOrRoom);
				groups[mainKey] = tempArr;
			} else {
				groups[mainKey].push(sectionOrRoom);
			}
		}

		const finalResult: object[] = [];
		for(const groupKey in groups) {
			const curr: Record<string, any> = {};
			const numeric = ["avg" , "pass" , "fail" , "audit" , "year", "lat", "lon", "seats"];
			for(const otherKey in JSON.parse(groupKey)) {
				if(numeric.includes(otherKey)) {
					curr[otherKey] = Number(JSON.parse(groupKey)[otherKey]);
				} else {
					curr[otherKey] = JSON.parse(groupKey)[otherKey];
				}
			}

			for(const rule of trans.APPLY) {
				curr[Object.keys(rule)[0] as any] = this.applyRule(rule, groups[groupKey]);
			}
			finalResult.push(curr);
		}
		return finalResult;
	}

	public applyRule(rule: any, sectionsOrRooms: any[]) {
		let key = Object.keys(rule)[0];

		if (Object.keys((rule as any)[key])[0] === "MAX") {
			const index = rule[key][Object.keys((rule as any)[key])[0]].split("_")[1];
			const values = sectionsOrRooms.map((item) => item[index]);
			return Math.max(...values);
		}

		if (Object.keys((rule as any)[key])[0] === "MIN") {
			const index = rule[key][Object.keys((rule as any)[key])[0]].split("_")[1];
			const values = sectionsOrRooms.map((item) => item[index]);
			return Math.min(...values);
		}

		if (Object.keys((rule as any)[key])[0] === "AVG") {
			const index = rule[key][Object.keys((rule as any)[key])[0]].split("_")[1];
			const values = sectionsOrRooms.map((item) => item[index]);
			let sum = 0;
			for(const value of values) {
				sum += value;
			}
			return sum / values.length;
		}

		if (Object.keys((rule as any)[key])[0] === "SUM") {
			const index = rule[key][Object.keys((rule as any)[key])[0]].split("_")[1];
			const values = sectionsOrRooms.map((item) => item[index]);
			let sum = 0;
			for(const value of values) {
				sum += value;
			}
			return sum;
		}

		if (Object.keys((rule as any)[key])[0] === "COUNT") {
			return sectionsOrRooms.length;
		}

		return {};
	}

	public makeInsightResult(sectionsOrRooms: any[], options: any, transfomations: any[] | undefined): object {

		const results: any[] = [];
		let item = {};
		const columns = options["COLUMNS"];

		if (typeof options.ORDER === "string") {
			const order = options.ORDER.split("_")[1];
			sectionsOrRooms.sort(
				(a, b) => (a as any)[order] - (b as any)[order]
			);
		} else if (options.ORDER && options.ORDER.dir && options.ORDER.keys) {
			const order = options.ORDER.dir;
			if (order === "UP") {
				transfomations?.sort(
					(a, b) => {
						for (const key of options.ORDER.keys) {
							if((a as any)[key] !== (b as any)[key]) {
								return (a as any)[key] - (b as any)[key];
							}
						}
						return 0;
					});
			} else {
				transfomations?.sort(
					(a, b) => {
						for (const key of options.ORDER.keys) {
							if((a as any)[key] !== (b as any)[key]) {
								return (b as any)[key] - (a as any)[key];
							}
						}
						return 0;
					});
			}
			return this.transformationsHelper(transfomations as any[]);
		}

		for(const section of sectionsOrRooms) {
			item = {};
			for(const column of columns) {
				const key = column.split("_");
				(item as any)[column] = (section as any)[key[1]];
			}
			results.push(item);
		}
		return results;

	}

	public transformationsHelper(transfomations: any[]) {
		const results: any[] = [];
		let item = {};

		for(const section of transfomations) {
			results.push(section);
		}
		return results;
	}

	public filterSections(sectionsOrRooms: Section[] | Room[], where: any) {

		const validSections = [];
		for (const sectionOrRoom of sectionsOrRooms) {
			const isSectionVaid = this.isSectionValid(sectionOrRoom, where);
			if (isSectionVaid) {
				validSections.push(sectionOrRoom);
			}
		}

		return validSections;
	}

	public isSectionValid(sectionOrRoom: Section | Room, currQuery: any): boolean {

		const mainKey = Object.keys(currQuery)[0];

		if(mainKey === "NOT") {
			return !this.isSectionValid(sectionOrRoom, currQuery.NOT);
		} else if (mainKey === "IS") {
			return this.IS(sectionOrRoom, currQuery);
		} else if (mainKey === "GT" || mainKey === "LT" || mainKey === "EQ") {
			return this.compare(sectionOrRoom, currQuery);
		} else if (mainKey === "AND" || mainKey === "OR") {
			const andOrMainKey = Object.keys(currQuery)[0];
			const object = (currQuery as Record<string, any>)[andOrMainKey];

			if (andOrMainKey === "AND") {
				return object.every((member: any) => this.isSectionValid(sectionOrRoom, member));
			} else if (andOrMainKey === "OR") {
				return object.some((member: any) => this.isSectionValid(sectionOrRoom, member));
			}
		}
		throw new InsightError();
	}

	public IS(sectionOrRoom: Section | Room, currQuery: any): boolean {
		const mainKey = Object.keys(currQuery.IS)[0];
		const value = currQuery.IS[mainKey];
		const valueOfSectionCol = (sectionOrRoom as any)[mainKey.split("_")[1]];

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

	public compare(sectionOrRoom: Section | Room, currQuery: any): boolean {
		const mainKey = Object.keys(currQuery)[0];
		const mainObject = (currQuery as Record<string, any>)[mainKey];
		const compareObjectKey =  Object.keys(mainObject)[0];
		const valueOfSectionCol = (sectionOrRoom as any)[compareObjectKey.split("_")[1]];
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
