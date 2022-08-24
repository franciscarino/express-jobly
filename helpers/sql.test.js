const { sqlForPartialUpdate } = require("./sql.js");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works", function () {
    const dataToUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = { firstName: "first_name" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });

  test("empty data to update", function () {
    const dataToUpdate = {};
    const jsToSql = { firstName: "first_name" };

    try {
      const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
