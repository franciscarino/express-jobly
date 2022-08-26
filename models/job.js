"use strict";

const { BadRequestError, NotFoundError } = require("../expressError");
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be {title, salary, equity, companyHandle }
   *
   * Returns {id, title, salary, equity, companyHandle }
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle as "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs* */

  static async findAll() {
    const sqlSelect = `SELECT title, salary, equity, company_handle
    FROM jobs
    ORDER BY title`;

    const jobsRes = await db.query(sqlSelect);

    return jobsRes.rows;
  }

  /** generate whereString for passed in search filters
   * pass in queryFilters like: {name, minEmployees, maxEmployees}
   * return object like: {
   *  whereString: 'WHERE name ilike $1 and min_employees <=10',
   *  queryParams: [ %compName%, 1, 5]
   *  }
   */

  static _generateWhereString(queryFilters) {
    let whereString = "";
    let queryParams = [];

    if (Object.keys(queryFilters).length != 0) {
      whereString = "WHERE ";
      if (queryFilters.name) {
        queryParams.push(`%${queryFilters.name}%`);
        whereString += `name ilike $${queryParams.length} `;
      }
      if (queryFilters.minEmployees) {
        whereString += queryParams.length > 0 ? "and " : "";
        queryParams.push(queryFilters.minEmployees);
        whereString += `num_employees >= $${queryParams.length} `;
      }
      if (queryFilters.maxEmployees) {
        whereString += queryParams.length > 0 ? "and " : "";
        queryParams.push(queryFilters.maxEmployees);
        whereString += `num_employees <= $${queryParams.length} `;
      }
    }
    return { whereString, queryParams };
  }

  /** Given a job handle, return data about job.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, jobHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const jobRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM jobs
           WHERE handle = $1`,
      [handle]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);
  }
}

module.exports = Job;
