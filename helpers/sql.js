const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Accepts and object of data to update (dataToUpdate)
 * like:{firstName: 'Aliya', age: 32}
 *
 * and an object of JS column names (jsToSql)
 * like:{firstName: "first_name"}
 *
 * Writes sql query based on JS input.
 *
 * Return Example:
 * {setCols: "first_name=$1, age=$2", values: ['Aliya', 32] }
 *
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  // {setCols: "first_name=$1, age=$2",
  //  values: ['Aliya', 32] }
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
