"use strict";

const { BadRequestError, NotFoundError } = require("../expressError");
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies, filters by arguments passed in
   * pass in queryFilter like:
   *  {name: "compname", minEmployees: 5, maxEmployees: 10}
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(queryFilters = {}) {
    const { minEmployees, maxEmployees } = queryFilters;
    if (minEmployees && maxEmployees && minEmployees > maxEmployees) {
      throw new BadRequestError("minEmployees must be <= maxEmployees");
    }

    const { whereString, queryParams } = this.generateWhereString(queryFilters);

    //include whereString in SQL, empty string if no filters passed in
    const sqlSelect = `SELECT handle,
    name,
    description,
    num_employees AS "numEmployees",
    logo_url AS "logoUrl"
    FROM companies
    ${whereString}
    ORDER BY name`;

    const companiesRes = await db.query(sqlSelect, queryParams);

    return companiesRes.rows;
  }

  /** generate whereString for passed in search filters
   * pass in queryFilters like: {name, minEmployees, maxEmployees}
   * return object like: {
   *  whereString: 'WHERE name ilike $1 and min_employees <=10',
   *  queryParams: [ %compName%, 1, 5]
   *  }
   */

  static generateWhereString(queryFilters) {
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


  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
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
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
