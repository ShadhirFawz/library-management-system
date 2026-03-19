const request = require("supertest");

describe("Help-service basic health", () => {
  it("GET /health returns running", async () => {
    process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/library_help_test";
    const app = require("../serverApp");
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.service).toBe("Help Service");
  });
});

