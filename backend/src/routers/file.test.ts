import { Hono } from "hono";
import { testClient } from "hono/testing";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import file from "./file";
import path from "path";
import { before, after } from "node:test";
import { writeFile, unlink } from "fs/promises";
const app = new Hono();
app.route("/file", file);

describe("File API", () => {
  const testFileName = "testfile";
  const testFilePath = path.resolve(
    __dirname,
    "../../draw-chart",
    `${testFileName}.csv`
  );

  before(async () => {
    await writeFile(testFilePath, "name,age\nJohn Doe,30\nJoe, 25");
  });

  after(async () => {
    try {
      await unlink(testFilePath);
    } catch (error) {
    }
  });

  it("should accept a file smaller than 50MB", async () => {
    const formData = new FormData();
    const file_ = new Blob(["Hello"], { type: "text/plain" });
    formData.append("file", file_, "hello.csv");

    const response = await file.request("/", {
      method: "POST",
      body: formData,
    });

    // console.log("res",response);

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.message, "File received");
  });

  it("should return the columns of the file", async () => {
    const res = await file.request("/testfile.csv", {
      method: "POST",
      body: JSON.stringify({
        column_1: "name",
        column_2: "age",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.message, "Columns parsed.");
    assert.deepEqual(data.columns.length, 2);
  });

  it("should delete the file", async () => {
    const res = await file.request("/testfile.csv", {
      method: "DELETE",
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.message, "File deleted");
  });

  it("should return 404 if file does not exist", async () => {
    const res = await file.request("/non-existent.csv", {
      method: "DELETE",
    });
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.message, "File does not exist.");
  });
});
