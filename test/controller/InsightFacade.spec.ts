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
import Dataset from "../../src/controller/Dataset";
import Section from "../../src/controller/Section";
import Room from "../../src/controller/Room";
import RoomProcessor from "../../src/controller/RoomProcessor";
import JSZip from "jszip";


use(chaiAsPromised);

export interface ITestQuery {
	title: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;

}

const notFoundError = new NotFoundError();
const resultTooLargeError = new ResultTooLargeError();

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

// describe("Add Datasets", function() {

// 	let insightFacade: InsightFacade;

// 	beforeEach(async function () {
// 		await clearDisk();
// 		insightFacade = new InsightFacade();
// 	});

// 	it("should not add with underscore in idString", async function() {

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const idString = "test_1";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to find underscore");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	// !!! This should fail once done
// 	it("should not add dataset with rooms kind", async function() {

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const idString = "hello123";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Rooms).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to check Kind");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not add with whitespace idString", async function() {

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const idString = "   ";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to find whitespace");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not add with empty idString", async function() {

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const idString = "";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to find whitespace");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should add dataset with valid idString", async function() {

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const idString = "ubc";
// 		const expected: string[] = [idString];

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect(result).to.deep.equal(expected);
// 		}).catch((error: any) => {
// 			expect.fail(error, expected, "Should not have rejected");
// 		});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(1);
// 		});
// 	});

// 	it("should not add dataset that has been already added", async function() {

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const idString = "ubc";
// 		const expected: string[] = [idString];
// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail("Failed to reject dataset that is added twice.");
// 		}).catch((error: any) => {
// 			expect(error).to.be.instanceOf(InsightError);
// 		});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(1);
// 		});
// 	});

// 	it("should add dataset courses with valid idString", async function() {

// 		const content = await getContentFromArchives("courses.zip");
// 		const idString = "courses";
// 		const expected: string[] = [idString];

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect(result).to.deep.equal(expected);
// 		}).catch((error: any) => {
// 			expect.fail(error, expected, "Should not have rejected");
// 		});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(1);
// 		});
// 	});

// 	it("should add dataset with valid courses", async function() {
// 		const sections = await getContentFromArchives("courses_valid.zip");
// 		const idString = "ubc2";
// 		const expected: string[] = [idString];

// 		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect(result).to.deep.equal(expected);
// 		}).catch((error: any) => {
// 			expect.fail(error, expected, "Should not have rejected");
// 		});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(1);
// 		});
// 	});

// 	it("should not add dataset with empty courses folder", async function() {
// 		const sections = await getContentFromArchives("courses_empty.zip");
// 		const idString = "ubc35";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to reject invalid content");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not add dataset with no valid section", async function() {
// 		const sections = await getContentFromArchives("courses_no_valid_section.zip");
// 		const idString = "ubc21";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to reject invalid content");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not add dataset with section without all keys", async function() {
// 		const sections = await getContentFromArchives("courses_almost_valid.zip");
// 		const idString = "ubc241";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to reject invalid content");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not add invalid json", async function() {
// 		const sections = await getContentFromArchives("invalid_json.zip");
// 		const idString = "ubc24331";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to reject invalid content");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not add content as random string", async function() {
// 		const idString = "ubc24331";
// 		const expected = new InsightError("Invalid ID");

// 		await insightFacade.addDataset(idString, "not base64", InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail(result, expected, "Failed to reject invalid content");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not add dataset through second object", async function() {
// 		const insightFacade2: InsightFacade = new InsightFacade();

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const content2 = await getContentFromArchives("courses.zip");

// 		const idString = "ubc";
// 		const expected: string[] = [idString];
// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);

// 		await insightFacade2.addDataset(idString, content2, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail("Failed to reject dataset that is added twice.");
// 		}).catch((error: any) => {
// 			expect(error).to.be.instanceOf(InsightError);
// 		});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(1);
// 		});
// 	});

// 	it("should not add dataset duplicate dataset different content", async function() {

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		const content2 = await getContentFromArchives("courses.zip");

// 		const idString = "ubc";
// 		const expected: string[] = [idString];
// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);

// 		await insightFacade.addDataset(idString, content2, InsightDatasetKind.Sections).then((result: string[]) => {
// 			expect.fail("Failed to reject dataset that is added twice.");
// 		}).catch((error: any) => {
// 			expect(error).to.be.instanceOf(InsightError);
// 		});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(1);
// 		});
// 	});

// });

// describe("Remove Datasets", function() {

// 	let insightFacade: InsightFacade;

// 	beforeEach(async function () {
// 		await clearDisk();
// 		insightFacade = new InsightFacade();
// 	});

// 	it("should not remove with underscore in idString", async function() {

// 		const idString = "test_1";
// 		const expected = new InsightError("Invalid ID");
// 		const content = await getContentFromArchives("courses_valid.zip");

// 		await insightFacade.removeDataset(idString).then((result: string) => {
// 			expect.fail(result, expected, "Failed to find underscore");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not remove with whitespace idString", async function() {

// 		const idString = "    ";
// 		const expected = new InsightError("Invalid ID");
// 		const content = await getContentFromArchives("courses_valid.zip");

// 		await insightFacade.removeDataset(idString).then((result: string) => {
// 			expect.fail(result, expected, "Failed to find underscore");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not remove with empty idString", async function() {

// 		const idString = "";
// 		const expected = new InsightError("Invalid ID");
// 		const content = await getContentFromArchives("courses_valid.zip");

// 		await insightFacade.removeDataset(idString).then((result: string) => {
// 			expect.fail(result, expected, "Failed to find underscore");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});
// 	});

// 	it("should not remove something not added", async function() {
// 		const idString = "testing";
// 		const expected: string[] = [idString];

// 		await insightFacade.removeDataset(idString).then((result: string) => {
// 			expect.fail(result, expected, "Failed to find underscore");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(NotFoundError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});

// 	});

// 	it("should remove something added", async function() {
// 		const idString = "testing3244";
// 		const expected: string = idString;

// 		const content = await getContentFromArchives("courses_valid.zip");

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections)
// 			.then(async () => {
// 				await insightFacade.removeDataset(idString).then((result: string) => {
// 					expect(result).to.deep.equal(expected);
// 				});
// 			})
// 			.catch((error: any) => {
// 				expect.fail(error, expected, "Should have removed dataset");
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});

// 	});

// 	it("doesnt remove something already removed", async function() {
// 		const idString = "testing3244";
// 		const expected: string = idString;

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
// 		await insightFacade.removeDataset(idString)
// 			.then(async () => {
// 				await insightFacade.removeDataset(idString).then((result: string) => {
// 					expect.fail("Should have removed dataset");
// 				});
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(NotFoundError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});

// 	});

// 	it("doesnt remove something already removed second object", async function() {
// 		const idString = "testing3244";
// 		const expected: string = idString;
// 		const insightFacade2: InsightFacade = new InsightFacade();

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
// 		await insightFacade.removeDataset(idString)
// 			.then(async () => {
// 				await insightFacade2.removeDataset(idString).then((result: string) => {
// 					expect.fail("Should have removed dataset");
// 				});
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(NotFoundError);
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});

// 	});

// 	it("should remove multiple", async function() {
// 		const idString = "testing3244";
// 		const expected: string = idString;

// 		const idString2 = "testing324422";
// 		const expected2: string = idString2;

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		await insightFacade.addDataset(idString2, content, InsightDatasetKind.Sections);

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections)
// 			.then(async () => {
// 				await insightFacade.removeDataset(idString).then((result: string) => {
// 					expect(result).to.deep.equal(expected);
// 				});
// 				await insightFacade.removeDataset(idString2).then((result: string) => {
// 					expect(result).to.deep.equal(expected2);
// 				});
// 			})
// 			.catch((error: any) => {
// 				expect.fail(error, expected, "Should have removed dataset");
// 			});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		});

// 	});

// 	it("should remove multiple dataset with multiple objects", async function() {
// 		const idString = "testing3244";
// 		const expected: string = idString;
// 		const insightFacade2: InsightFacade = new InsightFacade();

// 		const idString2 = "testing324422";
// 		const expected2: string = idString2;

// 		const content = await getContentFromArchives("courses_valid.zip");
// 		await insightFacade.addDataset(idString2, content, InsightDatasetKind.Sections);

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections)
// 			.then(async () => {
// 				await insightFacade.removeDataset(idString).then((result: string) => {
// 					expect(result).to.deep.equal(expected);
// 				});
// 				await insightFacade2.removeDataset(idString2).then((result: string) => {
// 					expect(result).to.deep.equal(expected2);
// 				});
// 			})
// 			.catch((error: any) => {
// 				expect.fail(error, expected, "Should have removed dataset");
// 			});

// 	});

// });

// describe("List Datasets", function() {

// 	let insightFacade: InsightFacade;

// 	beforeEach(async function () {
// 		await clearDisk();
// 		insightFacade = new InsightFacade();
// 	});

// 	it("should list one dataset", async function() {

//         // Setup
// 		const idString = "some school";
// 		const sections = await getContentFromArchives("pair.zip");

// 		await insightFacade.addDataset(idString, sections, InsightDatasetKind.Sections)
// 			.then(async () => {
// 				return insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 					expect(result).to.deep.equal([{
// 						id: idString,
// 						kind: InsightDatasetKind.Sections,
// 						numRows: 64612
// 					}]);
// 				});
// 			}).catch((error: any) => {
// 				expect.fail("listDatasets should never reject");
// 			});

// 	});

// 	it("should list empty", async function() {

// 		return await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(0);
// 		}).catch((error: any) => {
// 			expect.fail("listDatasets should never reject");
// 		});

// 	});

// 	it("should list empty 2", async function() {

// 		return await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.deep.equal([]);
// 		}).catch((error: any) => {
// 			expect.fail("listDatasets should never reject");
// 		});

// 	});

// 	it("should list multiple", async function() {

// 		const sections = await getContentFromArchives("pair.zip");

//         // Execution
// 		await insightFacade.addDataset("ubc38899", sections, InsightDatasetKind.Sections)
// 			.then(async () => {
// 				await insightFacade.addDataset("ubc3883299", sections, InsightDatasetKind.Sections)
// 					.then(async () => {
// 						return insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 							expect(result).to.deep.equal([
// 								{
// 									id: "ubc38899",
// 									kind: InsightDatasetKind.Sections,
// 									numRows: 64612
// 								},
// 								{
// 									id: "ubc3883299",
// 									kind: InsightDatasetKind.Sections,
// 									numRows: 64612
// 								}
// 							]);
// 						});
// 					});
// 			}).catch((error: any) => {
// 				expect.fail("listDatasets should never reject");
// 			});

// 	});
// });


// describe("Perform Query", function() {
// 	let insightFacade: InsightFacade;

// 	beforeEach(async function () {
// 		await clearDisk();
// 		insightFacade = new InsightFacade();
// 	});

// 	it("should reject non-object type query", async function() {
// 		const expected = new InsightError("Invalid ID");

// 		return await insightFacade.performQuery("not an object").then((result: InsightResult[]) => {
// 			expect.fail(result, expected, "Failed to reject non object type query");
// 		})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});
// 	});

// });

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

describe("Dataset Class", function() {
	let dataset: Dataset;

	beforeEach(function () {
		dataset = new Dataset("ubc", "content", InsightDatasetKind.Sections);
	});

	it("should check ID", function() {
		dataset.setId("sfu");
		expect(dataset.getId()).to.equal("sfu");
	});

	it("should check content", function() {
		dataset.setContent("newContent");
		expect(dataset.getContent()).to.equal("newContent");
	});

	it("should check kind", function() {
		dataset.setKind(InsightDatasetKind.Sections);
		expect(dataset.getKind()).to.equal(InsightDatasetKind.Sections);
	});

	it("should check numRows", function() {
		dataset.setNumRows(10);
		expect(dataset.getNumRows()).to.equal(10);
	});
});

describe("Section Class", function() {
	let section: Section;

	beforeEach(function () {
		section = new Section(
			"uuid",
			"id",
			"title",
			"instructor",
			"dept",
			2023,
			80,
			50,
			10,
			5
		);
	});

	it("should check UUID", function() {
		expect(section.getUuid()).to.equal("uuid");
	});

	it("should check ID", function() {
		expect(section.getId()).to.equal("id");
	});

	it("should check title", function() {
		expect(section.getTitle()).to.equal("title");
	});

	it("should check instructor", function() {
		expect(section.getInstructor()).to.equal("instructor");
	});

	it("should check department", function() {
		expect(section.getDept()).to.equal("dept");
	});

	it("should check year", function() {
		expect(section.getYear()).to.equal(2023);
	});

	it("should check average", function() {
		expect(section.getAvg()).to.equal(80);
	});

	it("should check pass count", function() {
		expect(section.getPass()).to.equal(50);
	});

	it("should check fail count", function() {
		expect(section.getFail()).to.equal(10);
	});

	it("should check audit count", function() {
		expect(section.getAudit()).to.equal(5);
	});
});

describe("Room Class", function() {
	let room: Room;

	beforeEach(function () {
		room = new Room(
			"Henry Angus Building",
			"ANGU",
			"347",
			"ANGU_347",
			70,
			"Classroom",
			"Fixed Tables",
			"2053 Main Mall, Vancouver, BC V6T 1Z2",
			49.26486,
			-123.25364,
			"https://learningspaces.ubc.ca/classrooms/angu-347"
		);
	});

	it("should set and get fullname", function() {
		room.setFullname("Henry Angus Building");
		expect(room.getFullname()).to.equal("Henry Angus Building");
	});

	it("should set and get shortname and update name", function() {
		room.setShortname("ALRD");
		expect(room.getShortname()).to.equal("ALRD");
		expect(room.getName()).to.equal("ALRD_347");
	});

	it("should set and get number and update name", function() {
		room.setNumber("098");
		expect(room.getNumber()).to.equal("098");
		expect(room.getName()).to.equal("ANGU_098");
	});

	it("should set and get name", function() {
		const shortname = "ANGU";
		const number = "098";

		room.setName(shortname, number);
		expect(room.getName()).to.equal("ANGU_098");
	});

	it("should set and get seats", function() {
		room.setSeats(260);
		expect(room.getSeats()).to.equal(260);
	});

	it("should set and get type", function() {
		room.setType("Classroom");
		expect(room.getType()).to.equal("Classroom");
	});

	it("should set and get furniture", function() {
		room.setFurniture("Fixed Tables");
		expect(room.getFurniture()).to.equal("Fixed Tables");
	});

	it("should set and get address", function() {
		room.setAddress("2053 Main Mall, Vancouver, BC V6T 1Z2");
		expect(room.getAddress()).to.equal("2053 Main Mall, Vancouver, BC V6T 1Z2");
	});

	it("should set and get latitude", function() {
		room.setLat(49.26486);
		expect(room.getLat()).to.equal(49.26486);
	});

	it("should set and get longitude", function() {
		room.setLon(-123.25364);
		expect(room.getLon()).to.equal(-123.25364);
	});

	it("should set and get href", function() {
		room.setHref("https://learningspaces.ubc.ca/classrooms/angu-098");
		expect(room.getHref()).to.equal("https://learningspaces.ubc.ca/classrooms/angu-098");
	});
});


// describe("RoomProcessor", function() {
// 	let insightFacade: InsightFacade;
// 	let roomProcessor: RoomProcessor;

// 	beforeEach(async function () {
// 		await clearDisk();
// 		insightFacade = new InsightFacade();
// 		roomProcessor = new RoomProcessor(insightFacade);
// 	});

// 	it("should add room dataset with valid idString", async function() {

// 		const content = await getContentFromArchives("campus.zip");
// 		const idString = "ubc";
// 		const expected: string[] = [idString];

// 		await insightFacade.addDataset(idString, content, InsightDatasetKind.Rooms).then((result: string[]) => {
// 			expect(result).to.deep.equal(expected);
// 		}).catch((error: any) => {
// 			expect.fail(error, expected, "Should not have rejected");
// 		});

// 		await insightFacade.listDatasets().then((result: InsightDataset[]) => {
// 			expect(result).to.have.lengthOf(1);
// 		});
// 	});
// 	// it("should process valid zip contents", async function() {
// 	// 	const content = await getContentFromArchives("campus.zip");
// 	// 	const zipContents = await JSZip.loadAsync(content, {base64: true});
// 	// 	const idString = "rooms";
// 	// 	const kind = InsightDatasetKind.Rooms;

// 	// 	await roomProcessor.processZipContents(idString, kind, zipContents)
// 	// 		.then((result: string[]) => {
// 	// 			expect(result).to.include(idString);
// 	// 		})
// 	// 		.catch((error: any) => {
// 	// 			expect.fail(error, "Should not have rejected");
// 	// 		});
// 	// });

// 	// it("should parse valid index file", async function() {
// 	// 	const content = await getContentFromArchives("campus.zip");
// 	// 	const zipContents = await JSZip.loadAsync(content, {base64: true});
// 	// 	const file = zipContents.file("index.htm");

// 	// 	if (file) {
// 	// 		const buildings = await roomProcessor.parseIndexFile(file);
// 	// 		expect(buildings).to.be.an("array").that.is.not.empty;
// 	// 	} else {
// 	// 		expect.fail("index.htm file not found in zip");
// 	// 	}
// 	// });


// 	// it("should parse and save rooms from valid building files", async function() {
// 	// 	const content = await getContentFromArchives("campus.zip");
// 	// 	const zipContents = await JSZip.loadAsync(content, {base64: true});
// 	// 	const idString = "rooms";
// 	// 	const buildingFiles = zipContents.folder("buildings").file(/\.htm$/);

// 	// 	const roomData = await roomProcessor.parseAndSaveRooms(idString, buildingFiles);
// 	// 	expect(roomData).to.be.an("array").that.is.not.empty;
// 	// });
// });

describe("C2 queries", function() {

	beforeEach(async function () {
		await clearDisk();
	});

	const insightFacade: InsightFacade = new InsightFacade();

	let validQueries: ITestQuery[];

	try {

		validQueries = readFileQueries("c2");

	} catch (e: unknown) {

		expect.fail(`Failed to read one or more test queries. ${e}`);

	}

	validQueries.forEach(function(test: any) {

		it(`${test.title}`, async function () {
			const content = await getContentFromArchives("campus.zip");
			const idString = "rooms";
			await insightFacade.addDataset(idString, content, InsightDatasetKind.Rooms);
			return insightFacade.performQuery(test.input).then((result) => {
				expect(result).to.deep.members(test.expected);
			});
		});

	});

});

// describe("C2 section queries", function() {

// 	beforeEach(async function () {
// 		await clearDisk();
// 	});

// 	const insightFacade: InsightFacade = new InsightFacade();

// 	let validQueries: ITestQuery[];

// 	try {

// 		validQueries = readFileQueries("c2room");

// 	} catch (e: unknown) {

// 		expect.fail(`Failed to read one or more test queries. ${e}`);

// 	}

// 	validQueries.forEach(function(test: any) {

// 		it(`${test.title}`, async function () {
// 			const content = await getContentFromArchives("pair.zip");
// 			const idString = "sections";
// 			await insightFacade.addDataset(idString, content, InsightDatasetKind.Sections);
// 			return insightFacade.performQuery(test.input).then((result) => {

// 				expect(result).to.deep.equal(test.expected);

// 			}).catch((error: string) => {

// 				expect.fail(`Inside failed. ${error}`);

// 			});

// 		});

// 	});

// });

// describe("RoomProcessor", function() {
// 	let insightFacade: InsightFacade;
// 	let roomProcessor: RoomProcessor;

// 	beforeEach(async function () {
// 		await clearDisk();
// 		insightFacade = new InsightFacade();
// 		roomProcessor = new RoomProcessor(insightFacade);
// 	});

// 	it("should process valid zip contents", async function() {
// 		const content = await getContentFromArchives("campus.zip");
// 		const zipContents = await JSZip.loadAsync(content, {base64: true});
// 		const idString = "rooms";
// 		const kind = InsightDatasetKind.Rooms;

// 		await roomProcessor.processZipContents(idString, kind, zipContents)
// 			.then((result: string[]) => {
// 				expect(result).to.include(idString);
// 			})
// 			.catch((error: any) => {
// 				expect.fail(error, "Should not have rejected");
// 			});
// 	});

// 	it("should not process invalid zip contents", async function() {
// 		const content = await getContentFromArchives("invalid.zip");
// 		const zipContents = await JSZip.loadAsync(content, {base64: true});
// 		const idString = "rooms";
// 		const kind = InsightDatasetKind.Rooms;

// 		await roomProcessor.processZipContents(idString, kind, zipContents)
// 			.then((result: string[]) => {
// 				expect.fail(result, "Should have rejected");
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});
// 	});

// 	it("should not process zip contents of wrong kind", async function() {
// 		const content = await getContentFromArchives("campus.zip");
// 		const zipContents = await JSZip.loadAsync(content, {base64: true});
// 		const idString = "rooms";
// 		const kind = InsightDatasetKind.Sections; // Wrong kind

// 		await roomProcessor.processZipContents(idString, kind, zipContents)
// 			.then((result: string[]) => {
// 				expect.fail(result, "Should have rejected");
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});
// 	});

// 	it("should handle invalid HTML in zip contents", async function() {
// 		const content = await getContentFromArchives("invalid_html.zip"); // Zip file with invalid HTML
// 		const zipContents = await JSZip.loadAsync(content, {base64: true});
// 		const idString = "rooms";
// 		const kind = InsightDatasetKind.Rooms;

// 		await roomProcessor.processZipContents(idString, kind, zipContents)
// 			.then((result: string[]) => {
// 				expect.fail(result, "Should have rejected");
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});
// 	});

// 	it("should handle geolocation service errors", async function() {
// 		const content = await getContentFromArchives("campus.zip");
// 		const zipContents = await JSZip.loadAsync(content, {base64: true});
// 		const idString = "rooms";
// 		const kind = InsightDatasetKind.Rooms;

//         // Mock the fetchGeolocation method to simulate a geolocation service error
// 		sinon.stub(roomProcessor, "fetchGeolocation").rejects(new Error("Geolocation service error"));

// 		await roomProcessor.processZipContents(idString, kind, zipContents)
// 			.then((result: string[]) => {
// 				expect.fail(result, "Should have rejected");
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});
// 	});

// 	it("should parse valid index file", async function() {
// 		const content = await getContentFromArchives("index.htm");
// 		const file = await JSZip.file(content);

// 		const buildings = await roomProcessor.parseIndexFile(file);
// 		expect(buildings).to.be.an("array").that.is.not.empty;
// 	});

// 	it("should not parse invalid index file", async function() {
// 		const content = await getContentFromArchives("invalid.htm");
// 		const file = await JSZip.file(content);

// 		await roomProcessor.parseIndexFile(file)
// 			.then((result: any) => {
// 				expect.fail(result, "Should have rejected");
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});
// 	});

// 	it("should fetch valid geolocation", async function() {
// 		const address = "2329 West Mall, Vancouver, BC, Canada";
// 		const geolocation = await roomProcessor.fetchGeolocation(address);

// 		expect(geolocation).to.have.property("lat");
// 		expect(geolocation).to.have.property("lon");
// 	});

// 	it("should not fetch invalid geolocation", async function() {
// 		const address = "Invalid Address";

// 		await roomProcessor.fetchGeolocation(address)
// 			.then((result: any) => {
// 				expect.fail(result, "Should have rejected");
// 			})
// 			.catch((error: any) => {
// 				expect(error).to.be.instanceOf(InsightError);
// 			});
// 	});

// 		it("should find a node that satisfies a condition", function() {
// 			const node = {
// 				nodeName: "div",
// 				attrs: [{name: "class", value: "view-content"}],
// 				childNodes: []
// 			};
// 			const condition = (node: any) => node.nodeName === "div";
// 			const result = roomProcessor.findNode(node, condition);

// 			expect(result).to.equal(node);
// 		});

// 		it("should not find a node if no node satisfies the condition", function() {
// 			const node = {
// 				nodeName: "div",
// 				attrs: [{name: "class", value: "view-content"}],
// 				childNodes: []
// 			};
// 			const condition = (node: any) => node.nodeName === "span";
// 			const result = roomProcessor.findNode(node, condition);

// 			expect(result).to.be.null;
// 		});

// 		it("should find nodes that satisfy a condition", function() {
// 			const node = {
// 				nodeName: "div",
// 				attrs: [{name: "class", value: "view-content"}],
// 				childNodes: [
// 					{nodeName: "span", attrs: [], childNodes: []},
// 					{nodeName: "div", attrs: [], childNodes: []}
// 				]
// 			};
// 			const condition = (node: any) => node.nodeName === "div";
// 			const result = roomProcessor.findNodes(node, condition);

// 			expect(result).to.have.lengthOf(2);
// 		});

// 		it("should not find nodes if no nodes satisfy the condition", function() {
// 			const node = {
// 				nodeName: "div",
// 				attrs: [{name: "class", value: "view-content"}],
// 				childNodes: [
// 					{nodeName: "span", attrs: [], childNodes: []},
// 					{nodeName: "div", attrs: [], childNodes: []}
// 				]
// 			};
// 			const condition = (node: any) => node.nodeName === "p";
// 			const result = roomProcessor.findNodes(node, condition);

// 			expect(result).to.be.empty;
// 		});
// 		describe("RoomProcessor", function() {
// 			let insightFacade: InsightFacade;
// 			let roomProcessor: RoomProcessor;

// 			beforeEach(async function () {
// 				await clearDisk();
// 				insightFacade = new InsightFacade();
// 				roomProcessor = new RoomProcessor(insightFacade);
// 			});

// 			// ...

// 			it("should check if a node has a class", function() {
// 				const node = {
// 					nodeName: "div",
// 					attrs: [{name: "class", value: "view-content"}],
// 					childNodes: []
// 				};
// 				const result = roomProcessor.hasClass(node, "view-content");

// 				expect(result).to.be.true;
// 			});

// 			it("should get href attribute of a node", function() {
// 				const node = {
// 					nodeName: "a",
// 					attrs: [{name: "href", value: "/index.htm"}],
// 					childNodes: []
// 				};
// 				const result = roomProcessor.getHref(node);

// 				expect(result).to.equal("/index.htm");
// 			});

// 			it("should get text content of a node", function() {
// 				const node = {
// 					nodeName: "#text",
// 					value: "Hello, world!",
// 					childNodes: []
// 				};
// 				const result = roomProcessor.getTextContent(node);

// 				expect(result).to.equal("Hello, world!");
// 			});

// 			it("should find a table in a node", function() {
// 				const node = {
// 					nodeName: "div",
// 					attrs: [{name: "class", value: "view-content"}],
// 					childNodes: [
// 						{nodeName: "table", attrs: [{name: "class", value: "views-table cols-5 table"}], childNodes: []}
// 					]
// 				};
// 				const result = roomProcessor.findTable(node);

// 				expect(result).to.equal(node.childNodes[0]);
// 			});

// 			it("should find rows in a table", function() {
// 				const node = {
// 					nodeName: "table",
// 					attrs: [{name: "class", value: "views-table cols-5 table"}],
// 					childNodes: [
// 						{nodeName: "tbody", attrs: [], childNodes: [
// 							{nodeName: "tr", attrs: [], childNodes: []},
// 							{nodeName: "tr", attrs: [], childNodes: []}
// 						]}
// 					]
// 				};
// 				const result = roomProcessor.findRows(node);

// 				expect(result).to.have.lengthOf(2);
// 			});

// 			it("should check if a node is a building table", function() {
// 				const node = {
// 					nodeName: "table",
// 					attrs: [{name: "class", value: "views-table cols-5 table"}],
// 					childNodes: []
// 				};
// 				const result = roomProcessor.isBuildingTable(node);

// 				expect(result).to.be.true;
// 			});

// 			it("should create a room from a row", async function() {
// 				const row = {
// 					nodeName: "tr",
// 					attrs: [],
// 					childNodes: [
// 						{nodeName: "td", attrs: [{name: "class", value: "views-field views-field-field-building-code"}], childNodes: [
// 							{nodeName: "#text", value: "DMP", childNodes: []}
// 						]},
// 						// Add more td nodes here for other room properties
// 					]
// 				};
// 				const longname = "Hugh Dempster Pavilion";
// 				const shortname = "DMP";

// 				const room = await roomProcessor.createRoom(row, longname, shortname);

// 				expect(room).to.be.an.instanceOf(Room);
// 				expect(room.shortname).to.equal("DMP");
// 				// Add more assertions here for other room properties
// 			});

// 		});


