"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Jobs = require("./jobs");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//title, salary, equity, company_handle
/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 10000,
    equity: '0.1',
    company_handle: "c1"
  };

  test("works", async function () {
    let job = await Jobs.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
        {
            title: "new",
            salary: 10000,
            equity: '0.1',
            company_handle: "c1"
          },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Jobs.create(newJob);
      await Jobs.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Jobs.findAll();
    console.log(jobs)
    expect(jobs).toEqual([{
        title: "new1",
        salary: 100000,
        equity: .1,
        company_handle: "c1"
    }]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Jobs.get(1);
    expect(job).toEqual({
        title: "new",
        salary: 10000,
        equity: .1,
        company_handle: "c1"
      });
  });

  test("not found if no such company", async function () {
    try {
      await Jobs.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "new2",
    salary: 1000,
    equity: .2,
  };

  test("works", async function () {
    let job = await Jobs.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      ...updateData,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
        title: "new2",
        salary: 1000,
        equity: .2,
        company_handle: "c1"
      }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
        title: "new",
        salary: null,
        equity: null,
      }

    let job = await Jobs.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
        title: "new",
        salary: null,
        equity: null,
        company_handle: "c1"
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Jobs.update(1000, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Jobs.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Jobs.remove(1);
    const res = await db.query(
        "SELECT id, title FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Jobs.remove(10000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
