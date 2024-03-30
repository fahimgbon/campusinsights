import Server from "../../src/rest/Server";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";

import {getContentFromArchives} from "../TestUtil";

describe("Facade D3", function () {

	let server: Server;
	const SERVER_URL = "http://localhost:4321";

	before(function () {
		server = new Server(4321);
		return server.start();
	});

	after(function () {
		return server.stop();
	});

	beforeEach(function () {
		console.log("Setting up test environment");
	});

	afterEach(function () {
		console.log("Ending test environment");
	});


	// Sample on how to format PUT requests
	it("PUT test for courses dataset", function () {
		const id = "courses";
		const kind = InsightDatasetKind.Sections;

		const ENDPOINT_URL = "/dataset/" + id + "/" + kind;
		return getContentFromArchives("courses.zip")
			.then((ZIP_FILE_DATA) => {
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log("status:", res.status);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.error("error:", err.message);
						expect.fail();
					});
			})
			.catch((err) => {
				console.error("error:", err.message);
			});
	});


    // Test for DELETE endpoint
	it("DELETE test for courses dataset", function () {
		const id = "courses";
		const kind = InsightDatasetKind.Sections;

		const ADD_ENDPOINT_URL = "/dataset/" + id + "/" + kind;
		const DELETE_ENDPOINT_URL = "/dataset/" + id;
		return getContentFromArchives("courses.zip")
			.then((ZIP_FILE_DATA) => {
				return request(SERVER_URL)
					.put(ADD_ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log("status:", res.status);
						expect(res.status).to.be.equal(200);
						return request(SERVER_URL)
							.delete(DELETE_ENDPOINT_URL)
							.then(function (result: Response) {
								console.log("status:", result.status);
								expect(result.status).to.be.equal(200);
								expect(result.body.result).to.be.equal("courses");
							})
							.catch(function (err) {
								console.error("error:", err.message);
								expect.fail();
							});
					})
					.catch(function (err) {
						console.error("error:", err.message);
						expect.fail();
					});
			})
			.catch((err) => {
				console.error("error:", err.message);
			});
	});

	// Test for POST endpoint
	it("POST test for query", function () {
		const id = "courses";
		const kind = InsightDatasetKind.Sections;

		const ADD_ENDPOINT_URL = "/dataset/" + id + "/" + kind;
		console.log("ENDPOINT", ADD_ENDPOINT_URL);
		const QUERY_ENDPOINT_URL = "/query";
		const query = {
			WHERE: {
				AND: [
					{
						LT: {
							sections_avg: 1
						}
					},
					{
						IS: {
							sections_dept: "fr*"
						}
					}
				]
			},
			OPTIONS: {
				COLUMNS: [
					"sections_dept",
					"sections_id",
					"sections_avg"
				],
				ORDER: "sections_avg"
			}
		};
		return getContentFromArchives("courses.zip")
			.then((ZIP_FILE_DATA) => {
				return request(SERVER_URL)
					.put(ADD_ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log("status:", res.status);
						expect(res.status).to.be.equal(200);
						return request(SERVER_URL)
							.post(QUERY_ENDPOINT_URL)
							.send(query)
							.then(function (result: Response) {
								console.log("status:", result.status);
								expect(result.status).to.be.equal(200);
								expect(result.body.result).to.be.an("array");
							})
							.catch(function (err) {
								console.error("error:", err.message);
								expect.fail();
							});
					})
					.catch(function (err) {
						console.error("error:", err.message);
						expect.fail();
					});
			})
			.catch((err) => {
				console.error("error:", err.message);
			});
	});

    // Test for GET endpoint
	it("GET test for datasets", function () {
		const ENDPOINT_URL = "/datasets";
		return request(SERVER_URL)
			.get(ENDPOINT_URL)
			.then(function (res: Response) {
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				expect.fail(err.message);
			});
	});

	// Test for PUT endpoint with invalid dataset id
	it("PUT test with invalid dataset id", function () {
		const id = "";
		const kind = InsightDatasetKind.Sections;

		const ENDPOINT_URL = "/dataset/" + id + "/" + kind;
		return getContentFromArchives("courses.zip")
			.then((ZIP_FILE_DATA) => {
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log("status:", res.status);
						expect(res.status).to.be.equal(400);
					})
					.catch(function (err) {
						console.error("error:", err.message);
						expect.fail();
					});
			})
			.catch((err) => {
				console.error("error:", err.message);
			});
	});

	// Test for DELETE endpoint with non-existent dataset id
	it("DELETE test with non-existent dataset id", function () {
		const id = "courses";
		const nonExistentId = "non_existent_id";
		const kind = InsightDatasetKind.Sections;

		const ADD_ENDPOINT_URL = "/dataset/" + id + "/" + kind;
		const DELETE_ENDPOINT_URL = "/dataset/" + nonExistentId;
		return getContentFromArchives("courses.zip")
			.then((ZIP_FILE_DATA) => {
				return request(SERVER_URL)
					.put(ADD_ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(`PUT test for courses dataset - status: ${res.status}`);
						expect(res.status).to.be.equal(200);
						return request(SERVER_URL)
							.delete(DELETE_ENDPOINT_URL)
							.then(function (result: Response) {
								console.log(`DELETE test with non-existent dataset id - status: ${result.status}`);
								expect(result.status).to.be.equal(404);
							})
							.catch(function (err) {
								console.error(`DELETE test with non-existent dataset id - error: ${err.message}`);
								expect.fail();
							});
					})
					.catch(function (err) {
						console.error(`PUT test for courses dataset - error: ${err.message}`);
						expect.fail();
					});
			})
			.catch((err) => {
				console.error(`Error reading courses.zip - error: ${err.message}`);
			});
	});


	// Test for DELETE endpoint with invalid dataset id
	it("DELETE test with invalid dataset id", function () {
		const id = "invalid_id";

		const ENDPOINT_URL = "/dataset/" + id;
		return request(SERVER_URL)
			.delete(ENDPOINT_URL)
			.then(function (res: Response) {
				console.log("status:", res.status);
				expect(res.status).to.be.equal(400);
			})
			.catch(function (err) {
				console.error("error:", err.message);
				expect.fail();
			});
	});


	// Test for POST endpoint with invalid query
	it("POST test with invalid query", function () {
		const QUERY_ENDPOINT_URL = "/query";
		const query = {
			WHERE: {
				OR: "123"
			},
			OPTIONS: {
				COLUMNS: [
					"sections_dept",
					"sections_id",
					"sections_avg"
				],
				ORDER: "sections_avg"
			}
		};

		return request(SERVER_URL)
			.post(QUERY_ENDPOINT_URL)
			.send(query)
			.then(function (res: Response) {
				console.log("status:", res.status);
				expect(res.status).to.be.equal(400);
			})
			.catch(function (err) {
				console.error("error:", err.message);
				expect.fail();
			});
	});

});
