import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {assert, expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives, readFileQueries} from "../TestUtil";

use(chaiAsPromised);

export interface ITestQuery {
	title: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

// describe("InsightFacade", function () {
// 	let facade: IInsightFacade;

// 	// Declare datasets used in tests. You should add more datasets like this!
// 	let sections: string;

// 	before(async function () {
// 		// This block runs once and loads the datasets.
// 		sections = await getContentFromArchives("pair.zip");

// 		// Just in case there is anything hanging around from a previous run of the test suite
// 		await clearDisk();
// 	});

// 	describe("AddDataset", function () {

// 		beforeEach(function () {
// 			// This section resets the insightFacade instance
// 			// This runs before each test
// 			facade = new InsightFacade();
// 		});

// 		afterEach(async function () {
// 			// This section resets the data directory (removing any cached data)
// 			// This runs after each test, which should make each test independent of the previous one
// 			await clearDisk();
// 		});

// 		it("should reject with  an empty dataset id", async function () {
// 			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);

// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
// 		});
// 	});

// 	/*
// 	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
// 	 * You can and should still make tests the normal way, this is just a convenient tool for a majority of queries.
// 	 */
// 	describe("PerformQuery", function () {
// 		before(async function () {
// 			facade = new InsightFacade();

// 			// Add the datasets to InsightFacade once.
// 			// Will *fail* if there is a problem reading ANY dataset.
// 			const loadDatasetPromises = [
// 				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
// 			];

// 			try {
// 				await Promise.all(loadDatasetPromises);
// 			} catch(err) {
// 				throw new Error(`In PerformQuery Before hook, dataset(s) failed to be added. \n${err}`);
// 			}
// 		});

// 		after(async function () {
// 			await clearDisk();
// 		});

// 		describe("valid queries", function() {
// 			let validQueries: ITestQuery[];
// 			try {
// 				validQueries = readFileQueries("valid");
// 			} catch (e: unknown) {
// 				expect.fail(`Failed to read one or more test queries. ${e}`);
// 			}

// 			validQueries.forEach(function(test: any) {
// 				it(`${test.title}`, function () {
// 					return facade.performQuery(test.input).then((result) => {
// 						assert.fail("Write your assertions here!");
// 					}).catch((err: any) => {
// 						assert.fail(`performQuery threw unexpected error: ${err}`);
// 					});
// 				});
// 			});
// 		});

// 		describe("invalid queries", function() {
// 			let invalidQueries: ITestQuery[];

// 			try {
// 				invalidQueries = readFileQueries("invalid");
// 			} catch (e: unknown) {
// 				expect.fail(`Failed to read one or more test queries. ${e}`);
// 			}

// 			invalidQueries.forEach(function(test: any) {
// 				it(`${test.title}`, function () {
// 					return facade.performQuery(test.input).then((result) => {
// 						assert.fail(`performQuery resolved when it should have rejected with ${test.expected}`);
// 					}).catch((err: any) => {
// 						if (test.expected === "InsightError") {
// 							expect(err).to.be.instanceOf(InsightError);
// 						} else {
// 							assert.fail("Query threw unexpected error");
// 						}
// 					});
// 				});
// 			});
// 		});
// 	});
// });

describe("Add Datasets", function() {

	let insightFacade: InsightFacade;

	beforeEach(async function () {
		await clearDisk();
		insightFacade = new InsightFacade();
	});

	it("should not add with underscore in idString", async function() {

		const content = await getContentFromArchives("courses_valid.zip");
		const idString = "test_1";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to find underscore");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add dataset with rooms kind", async function() {

		const content = await getContentFromArchives("courses_valid.zip");
		const idString = "hello123";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Rooms).then((result: string[]) => {
			expect.fail(result, expected, "Failed to check Kind");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add with whitespace idString", async function() {

		const content = await getContentFromArchives("courses_valid.zip");
		const idString = "   ";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to find whitespace");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add with empty idString", async function() {

		const content = await getContentFromArchives("courses_valid.zip");
		const idString = "";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to find whitespace");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should add dataset with valid idString", async function() {

		const content = await getContentFromArchives("courses_valid.zip");
		const idString = "ubc";
		const expected: string[] = [idString];

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
			expect(result).to.deep.equal(expected);
		}).catch((error: any) => {
			expect.fail(error, expected, "Should not have rejected");
		});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(1);
		});
	});

	it("should not add dataset that has been already added", async function() {

		const content = await getContentFromArchives("courses_valid.zip");
		const idString = "ubc";
		const expected: string[] = [idString];
		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail("Failed to reject dataset that is added twice.");
		}).catch((error: any) => {
			expect(error).to.be.instanceOf(InsightError);
		});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(1);
		});
	});

	it("should add dataset courses with valid idString", async function() {

		const content = await getContentFromArchives("courses.zip");
		const idString = "courses";
		const expected: string[] = [idString];

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
			expect(result).to.deep.equal(expected);
		}).catch((error: any) => {
			expect.fail(error, expected, "Should not have rejected");
		});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(1);
		});
	});

	it("should add dataset with valid courses", async function() {
		const sections = await getContentFromArchives("courses_valid.zip");
		const idString = "ubc2";
		const expected: string[] = [idString];

		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
			expect(result).to.deep.equal(expected);
		}).catch((error: any) => {
			expect.fail(error, expected, "Should not have rejected");
		});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(1);
		});
	});

	it("should not add dataset with empty courses folder", async function() {
		const sections = await getContentFromArchives("courses_empty.zip");
		const idString = "ubc35";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to reject invalid content");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add dataset with no valid section", async function() {
		const sections = await getContentFromArchives("courses_no_valid_section.zip");
		const idString = "ubc21";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to reject invalid content");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add dataset with section without all keys", async function() {
		const sections = await getContentFromArchives("courses_almost_valid.zip");
		const idString = "ubc241";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to reject invalid content");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add invalid json", async function() {
		const sections = await getContentFromArchives("invalid_json.zip");
		const idString = "ubc24331";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to reject invalid content");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add content as random string", async function() {
		const idString = "ubc24331";
		const expected = new InsightError("Invalid ID");

		await insightFacade.addDataset(idString, "not base64", InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail(result, expected, "Failed to reject invalid content");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not add dataset through second object", async function() {
		const insightFacade2: InsightFacade = new InsightFacade();

		const content = await getContentFromArchives("courses_valid.zip");
		const content2 = await getContentFromArchives("courses.zip");

		const idString = "ubc";
		const expected: string[] = [idString];
		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);

		await insightFacade2.addDataset(idString, content2, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail("Failed to reject dataset that is added twice.");
		}).catch((error: any) => {
			expect(error).to.be.instanceOf(InsightError);
		});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(1);
		});
	});

	it("should not add dataset duplicate dataset different content", async function() {

		const content = await getContentFromArchives("courses_valid.zip");
		const content2 = await getContentFromArchives("courses.zip");

		const idString = "ubc";
		const expected: string[] = [idString];
		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);

		await insightFacade.addDataset(idString, content2, InsightDatasetKind.Sections).then((result: string[]) => {
			expect.fail("Failed to reject dataset that is added twice.");
		}).catch((error: any) => {
			expect(error).to.be.instanceOf(InsightError);
		});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(1);
		});
	});

});

describe("Remove Datasets", function() {

	let insightFacade: InsightFacade;

	beforeEach(async function () {
		await clearDisk();
		insightFacade = new InsightFacade();
	});

	it("should not remove with underscore in idString", async function() {

		const idString = "test_1";
		const expected = new InsightError("Invalid ID");
		const content = await getContentFromArchives("courses_valid.zip");

		await insightFacade.removeDataset(idString).then((result: string) => {
			expect.fail(result, expected, "Failed to find underscore");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not remove with whitespace idString", async function() {

		const idString = "    ";
		const expected = new InsightError("Invalid ID");
		const content = await getContentFromArchives("courses_valid.zip");

		await insightFacade.removeDataset(idString).then((result: string) => {
			expect.fail(result, expected, "Failed to find underscore");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not remove with empty idString", async function() {

		const idString = "";
		const expected = new InsightError("Invalid ID");
		const content = await getContentFromArchives("courses_valid.zip");

		await insightFacade.removeDataset(idString).then((result: string) => {
			expect.fail(result, expected, "Failed to find underscore");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});
	});

	it("should not remove something not added", async function() {
		const idString = "testing";
		const expected: string[] = [idString];

		await insightFacade.removeDataset(idString).then((result: string) => {
			expect.fail(result, expected, "Failed to find underscore");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(NotFoundError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});

	});

	it("should remove something added", async function() {
		const idString = "testing3244";
		const expected: string = idString;

		const content = await getContentFromArchives("courses_valid.zip");

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections)
			.then(async () => {
				await insightFacade.removeDataset(idString).then((result: string) => {
					expect(result).to.deep.equal(expected);
				});
			})
			.catch((error: any) => {
				expect.fail(error, expected, "Should have removed dataset");
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});

	});

	it("doesnt remove something already removed", async function() {
		const idString = "testing3244";
		const expected: string = idString;

		const content = await getContentFromArchives("courses_valid.zip");
		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
		await insightFacade.removeDataset(idString)
			.then(async () => {
				await insightFacade.removeDataset(idString).then((result: string) => {
					expect.fail("Should have removed dataset");
				});
			})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(NotFoundError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});

	});

	it("doesnt remove something already removed second object", async function() {
		const idString = "testing3244";
		const expected: string = idString;
		const insightFacade2: InsightFacade = new InsightFacade();

		const content = await getContentFromArchives("courses_valid.zip");
		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
		await insightFacade.removeDataset(idString)
			.then(async () => {
				await insightFacade2.removeDataset(idString).then((result: string) => {
					expect.fail("Should have removed dataset");
				});
			})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(NotFoundError);
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});

	});

	it("should remove multiple", async function() {
		const idString = "testing3244";
		const expected: string = idString;

		const idString2 = "testing324422";
		const expected2: string = idString2;

		const content = await getContentFromArchives("courses_valid.zip");
		await insightFacade.addDataset(idString2, content, InsightDatasetKind.Sections);

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections)
			.then(async () => {
				await insightFacade.removeDataset(idString).then((result: string) => {
					expect(result).to.deep.equal(expected);
				});
				await insightFacade.removeDataset(idString2).then((result: string) => {
					expect(result).to.deep.equal(expected2);
				});
			})
			.catch((error: any) => {
				expect.fail(error, expected, "Should have removed dataset");
			});

		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		});

	});

	it("should remove multiple dataset with multiple objects", async function() {
		const idString = "testing3244";
		const expected: string = idString;
		const insightFacade2: InsightFacade = new InsightFacade();

		const idString2 = "testing324422";
		const expected2: string = idString2;

		const content = await getContentFromArchives("courses_valid.zip");
		await insightFacade.addDataset(idString2, content, InsightDatasetKind.Sections);

		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections)
			.then(async () => {
				await insightFacade.removeDataset(idString).then((result: string) => {
					expect(result).to.deep.equal(expected);
				});
				await insightFacade2.removeDataset(idString2).then((result: string) => {
					expect(result).to.deep.equal(expected2);
				});
			})
			.catch((error: any) => {
				expect.fail(error, expected, "Should have removed dataset");
			});

	});

});

describe("List Datasets", function() {

	let insightFacade: InsightFacade;

	beforeEach(async function () {
		await clearDisk();
		insightFacade = new InsightFacade();
	});

	it("should list one dataset", async function() {

        // Setup
		const idString = "some school";
		const sections = await getContentFromArchives("pair.zip");

		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections)
			.then(async () => {
				return insightFacade.listDatasets().then((result: InsightDataset[]) => {
					expect(result).to.deep.equal([{
						id: idString,
						kind: InsightDatasetKind.Sections,
						numRows: 64612
					}]);
				});
			}).catch((error: any) => {
				expect.fail("listDatasets should never reject");
			});

	});

	it("should list empty", async function() {

		return await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.have.lengthOf(0);
		}).catch((error: any) => {
			expect.fail("listDatasets should never reject");
		});

	});

	it("should list empty 2", async function() {

		return await insightFacade.listDatasets().then((result: InsightDataset[]) => {
			expect(result).to.deep.equal([]);
		}).catch((error: any) => {
			expect.fail("listDatasets should never reject");
		});

	});

	it("should list multiple", async function() {

		const sections = await getContentFromArchives("pair.zip");

        // Execution
		await insightFacade.addDataset("ubc38899", sections, InsightDatasetKind.Sections)
			.then(async () => {
				await insightFacade.addDataset("ubc3883299", sections, InsightDatasetKind.Sections)
					.then(async () => {
						return insightFacade.listDatasets().then((result: InsightDataset[]) => {
							expect(result).to.deep.equal([
								{
									id: "ubc38899",
									kind: InsightDatasetKind.Sections,
									numRows: 64612
								},
								{
									id: "ubc3883299",
									kind: InsightDatasetKind.Sections,
									numRows: 64612
								}
							]);
						});
					});
			}).catch((error: any) => {
				expect.fail("listDatasets should never reject");
			});

	});
});


describe("Perform Query", function() {
	let insightFacade: InsightFacade;

	beforeEach(async function () {
		await clearDisk();
		insightFacade = new InsightFacade();
	});

	it("should reject non-object type query", async function() {
		const expected = new InsightError("Invalid ID");

		return await insightFacade.performQuery("not an object").then((result: InsightResult[]) => {
			expect.fail(result, expected, "Failed to reject non object type query");
		})
			.catch((error: any) => {
				expect(error).to.be.instanceOf(InsightError);
			});
	});

});

describe("valid queries", function() {

	beforeEach(async function () {
		await clearDisk();
	});

	const insightFacade: InsightFacade = new InsightFacade();

	let validQueries: ITestQuery[];

	try {

		validQueries = readFileQueries("customValid");

	} catch (e: unknown) {

		expect.fail(`Failed to read one or more test queries. ${e}`);

	}

	validQueries.forEach(function(test: any) {

		it(`${test.title}`, async function () {
			const content = await getContentFromArchives("courses.zip");
			const idString = "sections";
			await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
			return insightFacade.performQuery(test.input).then((result) => {

				expect(result).to.deep.equal(test.expected);

			}).catch((error: string) => {

				expect.fail(`Failed to read one or more test queries. ${error}`);

			});

		});

	});

});

describe("invalid queries", function() {

	beforeEach(async function () {
		await clearDisk();
	});


	const insightFacade: InsightFacade = new InsightFacade();

	let validQueries: ITestQuery[];

	try {

		validQueries = readFileQueries("invalid");

	} catch (e: unknown) {

		expect.fail(`Failed to read one or more test queries. ${e}`);

	}


	validQueries.forEach(function(test: any) {


		it(`${test.title}`, async function () {
			const content = await getContentFromArchives("courses_valid.zip");
			const idString = "sections";
			await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
			return insightFacade.performQuery(test.input).then((result) => {
				expect.fail("Failed to reject invalid query");

			}).catch((error: any) => {

				expect(error).to.be.instanceOf(InsightError);

			});

		});

	});

});

describe("too large query", function() {

	beforeEach(async function () {
		await clearDisk();
	});


	const insightFacade: InsightFacade = new InsightFacade();

	let validQueries: ITestQuery[];

	try {

		validQueries = readFileQueries("tooLarge");

	} catch (e: unknown) {

		expect.fail(`Failed to read one or more test queries. ${e}`);

	}


	validQueries.forEach(function(test: any) {


		it(`${test.title}`, async function () {
			const content = await getContentFromArchives("pair.zip");
			const idString = "sections";
			await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
			return insightFacade.performQuery(test.input).then((result) => {
				expect.fail("Failed to reject too large query");
			}).catch((error: any) => {
				expect(error).to.be.instanceOf(ResultTooLargeError);
			});

		});

	});

});
