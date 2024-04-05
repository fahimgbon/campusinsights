import Server from "../../src/rest/Server";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";

import {clearDisk, getContentFromArchives} from "../TestUtil";
import * as fs from "fs-extra";

let SECTIONS_ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/courses_valid.zip");
let ROOMS_ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/campus.zip");

describe("Facade D3", function () {
	let server: Server;
	const SERVER_URL = "http://localhost:4321";

	before(async function () {
		await clearDisk();
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
	it("PUT test for sections - Pass", function () {
		try {
			const id = "sections";
			const kind = InsightDatasetKind.Sections;

			const ENDPOINT_URL = "/dataset/" + id + "/" + kind;
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(SECTIONS_ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					console.log("status:", res.status);
					expect(res.status).to.be.equal(200);
					expect(res.body).to.have.property("result");
				})
				.catch(function (err) {
					console.error("error:", err.message);
					expect.fail();
				});
		} catch (err) {
			console.error("error:", err);
		}
	});

	it("PUT test for rooms - Pass", function () {
		try {
			const id = "rooms";
			const kind = InsightDatasetKind.Rooms;

			const ENDPOINT_URL = "/dataset/" + id + "/" + kind;
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ROOMS_ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					console.log("status:", res.status);
					expect(res.status).to.be.equal(200);
					expect(res.body).to.have.property("result");
				})
				.catch(function (err) {
					console.error("error:", err.message);
					expect.fail();
				});
		} catch (err) {
			console.error("error:", err);
		}
	});

	it("PUT test for sections - Fail", function () {
		try {
			let INVALID_SECTIONS_ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/courses_empty.zip");
			const id = "invalidSections";
			const kind = InsightDatasetKind.Sections;

			const ENDPOINT_URL = "/dataset/" + id + "/" + kind;
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(INVALID_SECTIONS_ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					expect(res.status).to.be.equal(400);
					expect(res.body).to.have.property("error");
					expect(res.body.error).to.be.a("string");
				})
				.catch(function (err) {
					console.error("error:", err.message);
					expect.fail();
				});
		} catch (err) {
			console.error("error:", err);
		}
	});

	it("PUT test for rooms - Fail", function () {
		try {
			let INVALID_ROOMS_ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/invalid_campus.zip");
			const id = "invalidRooms";
			const kind = InsightDatasetKind.Rooms;

			const ENDPOINT_URL = "/dataset/" + id + "/" + kind;
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(INVALID_ROOMS_ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					console.log("status:", res.status);
					expect(res.status).to.be.equal(400);
					expect(res.body).to.have.property("error");
					expect(res.body.error).to.be.a("string");
				})
				.catch(function (err) {
					console.error("error:", err.message);
					expect.fail();
				});
		} catch (err) {
			console.error("error:", err);
		}
	});

	it("DELETE test - Pass", function () {
		try {
			const id = "sections";

			const ENDPOINT_URL = "/dataset/" + id;
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then(function (res: Response) {
					console.log("status:", res.status);
					expect(res.status).to.be.equal(200);
					expect(res.body).to.have.property("result");
				})
				.catch(function (err) {
					console.error("error:", err.message);
					expect.fail();
				});
		} catch (err) {
			console.error("error:", err);
		}
	});

	it("DELETE test - NotFound Fail", function () {
		try {
			const id = "random";

			const ENDPOINT_URL = "/dataset/" + id;
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then(function (res: Response) {
					expect(res.status).to.be.equal(404);
					expect(res.body).to.have.property("error");
					expect(res.body.error).to.be.a("string");
				})
				.catch(function (err) {
					console.error("error:", err.message);
					expect.fail();
				});
		} catch (err) {
			console.error("error:", err);
		}
	});

	it("DELETE test - ID Fail", function () {
		try {
			const id = "_";

			const ENDPOINT_URL = "/dataset/" + id;
			return request(SERVER_URL)
				.delete(ENDPOINT_URL)
				.then(function (res: Response) {
					expect(res.status).to.be.equal(400);
					expect(res.body).to.have.property("error");
					expect(res.body.error).to.be.a("string");
				})
				.catch(function (err) {
					console.error("error:", err.message);
					expect.fail();
				});
		} catch (err) {
			console.error("error:", err);
		}
	});


	it("POST test - Pass", function () {
		const ENDPOINT_URL = "/query";
		const query = {
			WHERE: {
				GT: {
					sections_avg: 97
				}
			},
			OPTIONS: {
				COLUMNS: [
					"sections_dept",
					"sections_avg"
				],
				ORDER: "sections_avg"
			}
		};
		return request(SERVER_URL)
			.post(ENDPOINT_URL)
			.send(query)
			.then(function (res: Response) {
				expect(res.status).to.be.equal(200);
				expect(res.body).to.have.property("result");
			})
			.catch(function (err) {
				expect.fail(err.message);
			});
	});

	it("POST test - Fail", function () {
		const ENDPOINT_URL = "/query";
		const query = {
			OPTIONS: {
				COLUMNS: [
					"sections_dept",
					"sections_avg"
				],
				ORDER: "sections_avg"
			}
		};
		return request(SERVER_URL)
			.post(ENDPOINT_URL)
			.send(query)
			.then(function (res: Response) {
				expect(res.status).to.be.equal(400);
				expect(res.body).to.have.property("error");
				expect(res.body.error).to.be.a("string");
			})
			.catch(function (err) {
				expect.fail(err.message);
			});
	});

	it("GET test", function () {
		const ENDPOINT_URL = "/datasets";
		return request(SERVER_URL)
			.get(ENDPOINT_URL)
			.then(function (res: Response) {
				expect(res.status).to.be.equal(200);
				expect(res.body).to.have.property("result");
			})
			.catch(function (err) {
				expect.fail(err.message);
			});
	});

});
