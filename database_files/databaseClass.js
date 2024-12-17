const mysql = require("mysql2");
class Database {
  connection;

  constructor(database_type) {
    if (this.constructor == Database)
      throw new Error("Unable to initiallize Abstract Class Database");
    this.database_type = database_type;
  }
  createConnection() {
    this.connection = mysql.createConnection({});
  }
  defineConnectionStrings() {}
  provideMetaData() {}
  getJSONArray() {}
  batchUpdate() {}
  batchInsert() {}
  singleOperation() {}
  insertNewRecord() {}
  createNewUser() {}
  closeConnection() {}
  checkRegisteration(token_id) {}
}
module.exports = Database;
