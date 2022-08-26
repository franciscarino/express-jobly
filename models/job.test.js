"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  j1Id,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "J4",
    salary: 40000,
    equity: "0.0004",
    companyHandle: "c3",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "J4",
      salary: 40000,
      equity: "0.0004",
      companyHandle: "c3",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle as "companyHandle"
           FROM jobs
           WHERE company_handle = 'c3'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "J4",
        salary: 40000,
        equity: "0.0004",
        companyHandle: "c3",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Jobs.create(newJob);
      await Jobs.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "J1",
        salary: 100000,
        equity: 0.0001,
        company_handle: "c1",
      },
      {
        id: expect.any(Number),
        title: "J2",
        salary: 200000,
        equity: 0.0002,
        company_handle: "c2",
      },
      {
        id: expect.any(Number),
        title: "J3",
        salary: 300000,
        equity: 0.0003,
        company_handle: "c2",
      },
    ]);
  });
});

// /************************************** get */

// Job ID (j1Id) saved from _testCommon
describe("get", function () {
  test("works", async function () {
    let job = await Job.get(j1Id);
    expect(job).toEqual({
      id: j1Id,
      title: "J1",
      salary: 100000,
      equity: 0.0001,
      company_handle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "J1-udpate",
    salary: 100001,
    equity: 0.00005,
  };

  test("works", async function () {
    let job = await Job.update(j1Id, updateData);
    expect(job).toEqual({
      title: "J1-udpate",
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
            WHERE id = ${j1Id}`
    );
    expect(result.rows).toEqual([
      {
        id: j1Id,
        title: "J1-udpate",
        salary: 100001,
        equity: 0.00005,
        company_handle: "c1",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "J1-udpate",
      salary: null,
      equity: null,
    };

    let job = await jJb.update(j1Id, updateDataSetNulls);
    expect(job).toEqual({
      id: j1Id,
      title: "J1-udpate",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE id = ${j1Id}`
    );
    expect(result.rows).toEqual([
      {
        id: j1Id,
        title: "J1-udpate",
        salary: null,
        equity: null,
        company_handle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(j1Id, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(j1Id);
    const res = await db.query(`SELECT handle FROM jobs WHERE id=${j1Id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
