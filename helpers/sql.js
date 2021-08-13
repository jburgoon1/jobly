const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //take the keys out of the data you need to update
  const keys = Object.keys(dataToUpdate);
  //if no keys then return an error
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  //map each key with the column name and index
  const cols = keys.map((colName, idx) =>
  //make the column name = to the secure version of passing in data ($1)
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    //make a list of the column names to update
    setCols: cols.join(", "),
    //create the list of values that coorelate to the columns that are being updated
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
