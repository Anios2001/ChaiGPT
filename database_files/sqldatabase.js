const Database = require("./databaseClass");
const mysql = require("mysql2/promise");
const { Connector } = require("@google-cloud/cloud-sql-connector");
const {
  getToken,
  getHash,
  getHashes,
  getCrypticHash,
  checkPassword,
} = require("../token_files/getToken");
class SQLDatabase extends Database {
  connection;
  clientOpts;
  pool;
  connector;
  SQLDatabase() {}
  async createConnection() {
    // this.connection = await mysql.createConnection(this.connectionProperties);
    // this.connection.connect();
    this.connection = await this.pool.getConnection();
  }
  
  async defineConnectionStrings() {
    const connector = new Connector();
    this.clientOpts = await connector.getOptions({
      instanceConnectionName: "micro-spanner-404517:asia-south1:mysqlcloud",
      ipType: "PUBLIC",
    });
    this.pool = await mysql.createPool({
      ...this.clientOpts,
      user: "aniket",
      password: "aniket9644#",
      database: "chaigpt",
    });

    // this.connectionProperties = {
    //   host: "localhost",
    //   port: 13306,
    //   user: "root",
    //   database: "chaigpt",
    //   password: "aniket",
    // };
  }
  async changePrivellege(userPrivelleges){
    try {
      var enabledUsers= Array(0);
      var disabledUsers= Array(0);

      for(let user of userPrivelleges){
        if(user.allowed == 'ENABLED')
          enabledUsers.push(user.user_id);
        else
          disabledUsers.push(user.user_id);
      }
      console.log(userPrivelleges);
      console.log(enabledUsers);
      console.log(disabledUsers);
      const sqlQuery1= `Update users set allowed="ENABLED" where user_id in (?)`;
      const result1 = await this.connection.execute(sqlQuery1,[enabledUsers.join(',')]);
      const sqlQuery2= `Update users set allowed="DISABLED" where user_id in (?)`;
      const result2 = await this.connection.execute(sqlQuery2,[disabledUsers.join(',')]);
      console.log("Affected Rows",result1[0].changedRows + result2[0].changedRows);
      return {"rowsUpdated":result1[0].changedRows + result2[0].changedRows};
    }
    catch(e){
      console.error("MySQLUpdateError", e);
      return {"error":e};
    }
  }
  async getAllUsers(){
    try {
      const [rows,fields] = await this.connection.query(`Select * from users`);
      console.log(rows);
      return {'users':rows};
    }
    catch(e){
      console.error("MySQLUpdateError", e);
      return {'error':e};
    }
  }
  async checkMemberShip(user_id) {
    try {
      const result = await this.connection.query(
        `select count(*) as items from users where user_id like '${user_id}' and allowed like 'ENABLED'`
      );
      console.log(result[0][0].items);
      return result[0][0].items > 0;
    } catch (e) {
      console.error("MySQLSelectionError", e);
    }
  }
  provideMetaData() {}
  async testConnection() {
    try {
      const [res] = await this.connection.query("Select 2*3");
      console.log(res);
      await this.connection.end();
      console.log(res);
    } catch (err) {
      console.error("MySQLConnectionTestError", err);
    }
  }
  getJSONArray() {}
  batchUpdate() {}
  batchInsert() {}
  async singleOperation(user_id, record) {
    record.sale_id = getHash(record);
    record.user_id = user_id;
    var insertionError = null;
    var res = null;
    record.net = record.price - record.discount;
    try {
      const [rows, fields] = await this.connection.query(
        `insert into sales values ('${record.sale_id}','${record.user_id}','${record.vendor_name}',${record.weight},${record.rate_per_kg},${record.price},${record.discount},${record.net},'${record.timestamp}')`
      );
      return record;
    } catch (e) {
      console.error("MySQLDataInsertionError", e);
      return {};
    }
  }
  //let datePart= date.toISOString().split('T')[0];
  //let timePart= date.toISOString().split('T')[1].split('Z')[0];
  //let sqlDateTimeFormat= datePart + ' ' + timePart
  insertNewRecord(sale_data) {}
  async createNewUser(userdata) {
    try {
      const [rows, fields] = await this.connection.query(
        `insert into users values ('${userdata.token}','${userdata.email}','${userdata.pass}','${userdata.address}','${userdata.phone}','${userdata.name}',"DISABLED")`
      );
      if (rows && rows.affectedRows) return rows.affectedRows;
      else return 0;
    } catch (e) {
      console.error("MySQLDataInsertionError", e);
      return -1;
    }
  }
  async deleteRecord(sale_id, user_id) {
    try {
      const [rows, fields] = await this.connection.query(
        `delete from sales where user_id='${user_id}' and sale_id='${sale_id}'`
      );
      return rows.affectedRows == 1;
    } catch (e) {
      console.error("MySQLDataDeletionError", e);
      return false;
    }
  }
  closeConnection() {}
  async sumColumnRows(column, auth_id) {
    try {
      // console.log(auth_id);
      const [rows, fields] = await this.connection.query(
        `Select sum(${column}) as totalNet from sales where user_id like '${auth_id}'`
      );
      // console.log(rows);
      return rows[0].totalNet;
    } catch (e) {
      console.error(`Error while calculation sum of ${column} `, e);
      return -1;
    }
  }
  async sumTodaysColumnValue(column, auth_id) {
    try {
      const [rows, fields] = await this.connection.query(
        `Select sum(${column}) as totalNet from sales where user_id like '${auth_id}' and date(timestamp)=curdate()`
      );
      if (rows[0].totalNet == null) rows[0].totalNet = 0;
      return rows[0].totalNet;
    } catch (e) {
      console.error(`Error while calculation sum of ${column} `, e);
      return -1;
    }
  }
  async sumColumnRowsValue(column, auth_id, columnCmp, value) {
    try {
      const [rows, fields] = await this.connection.query(
        `Select sum(${column}) as totalNet from sales where user_id like '${auth_id}' and ${columnCmp} =='${value}'`
      );
      // console.log(rows);
      return rows[0].totalNet;
    } catch (e) {
      console.error(`Error while calculation sum of ${column} `, e);
      return -1;
    }
  }
  async avgColumnRows(column, auth_id) {
    try {
      const [rows, fields] = await this.connection.query(
        `Select avg(${column}) as totalNet from sales where user_id like '${auth_id}'`
      );
      // console.log(rows);
      return rows[0].totalNet;
    } catch (e) {
      console.error(`Error while calculation sum of ${column} `, e);
      return -1;
    }
  }
  async checkRegisteration(auth_data) {
    try {
      const [rows, fields] = await this.connection.query(
        `Select * from users where email like '${auth_data.email}'`
      );
      
      const passCorrect = await checkPassword(
        auth_data.password,
        rows[0].password
      );
      const isAllowed= await this.connection.query(`Select allowed from users where email like '${auth_data.email}'`);
      console.log(isAllowed);
      if (passCorrect && isAllowed[0][0]['allowed']=='ENABLED') return { isRegistered: true, auth_id: rows[0].user_id,allowed:true };
      else if(passCorrect && isAllowed[0][0]['allowed']=='DISABLED') return {isRegistered:true, auth_id: rows[0].user_id,allowed:false};
      else return { isRegistered: false, auth_id: "" };
    } catch (e) {
      console.error("MySQLDataSelectionError", e);
      return {};
    }
  }
  async checkAdminRegisteration(auth_data){
    try {
      const [rows, fields] = await this.connection.query(
        `Select * from admins where email like '${auth_data.email}'`
      );
      if(rows.length == 0)
        return {isRegistered:false,auth_id: ""};
      const passCorrect = await checkPassword(
        auth_data.password,
        rows[0].password
      );
      if (passCorrect) return { isRegistered: true, auth_id: rows[0].email};
      else return { isRegistered: false, auth_id: "" };
    } catch (e) {
      console.error("MySQLDataSelectionError", e);
      return {};
    }
  }
  async getSaleRecords(auth_id) {
    try {
      const [rows, fields] = await this.connection.query(
        `Select * from sales where user_id like '${auth_id}'`
      );
      //console.log(rows);
      return { isSuccess: true, list: rows };
    } catch (e) {
      console.error("MySQLDataSelectionError", e);
      return { isSuccess: false };
    }
  }
}
module.exports = SQLDatabase;
// const databaseOb = new SQLDatabase();
// databaseOb
//   .defineConnectionStrings()
//   .then(() =>
//     databaseOb.createConnection().then(() => databaseOb.checkAdminRegisteration({email:"aniketpoptani10@gmail.com",password:"aniket9644#"}).then(result=>console.log(result)))
//   );
