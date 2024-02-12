export class QueryValidator {

	public idsArray: string[] = [];
	public fieldsArray: string[] = ["avg", "pass", "fail", "audit",
		"year", "dept", "id", "instructor", "title", "uuid"];

	public isQueryValid(query: any): boolean {
		const mainKeys = Object.keys(query as object);
		if (mainKeys.length < 2 ||
			mainKeys.length > 2 ||
			!mainKeys.includes("WHERE") ||
			!mainKeys.includes("OPTIONS") ||
			typeof query.OPTIONS !== "object" ||
			typeof query.WHERE !== "object") {

			return false;
		}

		const areOptionsValid = this.areOptionsValid(query);

		if (!areOptionsValid) {
			return false;
		}

		const isWhereValid = this.isWhereValid(query);

		if (!isWhereValid) {
			return false;
		}

		return true;
	}

	public areOptionsValid(query: any): boolean {
		const optionsObject: any = query.OPTIONS;
		const optionsObjectKeys = Object.keys(optionsObject);

		if (optionsObjectKeys.length === 0 ||
			optionsObjectKeys.length > 2 ||
			!optionsObjectKeys.includes("COLUMNS")) {
			return false;
		}

		const columns: any = optionsObject["COLUMNS"];

		if (typeof columns !== "object" ||
			columns.length === 0) {
			return false;
		}

		const cols = [];
		for(const column of columns) {
			let currKey = column.split("_");
			if (!column.includes("_") || currKey.length > 2) {
				return false;
			}
			if (!this.idsArray.includes(currKey[0])) {
				this.idsArray.push(currKey[0]);
			}
			if (this.idsArray.length > 1) {
				return false;
			}
			if (!this.fieldsArray.includes(currKey[1])) {
				return false;
			}
			cols.push(currKey[1]);
		}

		if (optionsObjectKeys.length === 2 && !optionsObjectKeys.includes("ORDER")) {
			return false;
		}

		const order = optionsObject["ORDER"];
		if (typeof order !== "string") {
			return false;
		}

		if (!order.includes("_") ||
			order.split("_").length !== 2 ||
			this.idsArray[0] !== order.split("_")[0] ||
			!cols.includes(order.split("_")[1])) {
			return false;
		}

		return true;
	}

	public isWhereValid(query: any): boolean {

		const objects = [];
		const whereObject: any = query.WHERE;
		objects.push(whereObject);


		while (objects.length > 0) {

			const object: any = objects[0];
			objects.splice(0, 1);
			const key = Object.keys(object)[0];

			if (typeof object !== "object" || JSON.stringify(object) === "[]") {
				return false;
			}

			if (key === "AND" || key === "OR" || key === "NOT") {

				if (typeof object[key] !== "object") {
					return false;
				}

				for (const newObject of object[key]) {
					objects.push(newObject);
				}

			} else if (
				key === "GT" ||
				key === "LT" ||
				key === "EQ" ||
				key === "IS") {

				if (Object.keys(object[key]).length !== 1) {
					return false;
				}

				const cObject = object[key];
				const validateComparorObject = this.validateComparor(cObject, key);
				if (!validateComparorObject) {
					return false;
				}
			}
		}
		return true;
	}

	public validateComparor(cObject: any, key: any): boolean {
		const cKey = Object.keys(cObject)[0];

		if (!cKey.includes("_") || cKey.split("_").length > 2) {
			return false;
		}

		const cKeyIdString = cKey.split("_")[0];
		const cKeyValue = cKey.split("_")[1];

		if (!this.fieldsArray.includes(cKeyValue)) {
			return false;
		}

		if (!this.idsArray.includes(cKeyIdString)) {
			this.idsArray.push(cKeyIdString);
		}

		if (this.idsArray.length > 1) {
			return false;
		}

		const value = Object.values(cObject)[0];

		if (key === "EQ" || key === "LT" || key === "GT") {
			if (typeof value !== "number") {
				return false;
			}
		} else if (key === "IS") {
			if (typeof value !== "string") {
				return false;
			}
		}

		return true;
	}

}
