import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Database from './databaseClass.js';

import sqlite3 from 'sqlite3';
import {open} from 'sqlite';

const {
  getToken,
  getHash,
  getHashes,
  getCrypticHash,
  checkPassword
} = await import('../token_files/getToken.js').then(mod => mod.default);
export class SQLiteDatabase extends Database{
    connection;
    SQLiteDatabase(){}
    async createConnection(){
        try{
        
        this.connection = await open({filename: path.join(__dirname,'chaigpt_converted.sqlite'),driver:sqlite3.Database});
        console.log("Conneted to the database");
      }
     catch(error){
       console.error(`Error connecting to database ${error}`);
     }
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
            const result1 = await this.connection.all(sqlQuery1,[enabledUsers.join(',')]);
            const sqlQuery2= `Update users set allowed="DISABLED" where user_id in (?)`;
            const result2 = await this.connection.all(sqlQuery2,[disabledUsers.join(',')]);
            console.log("Affected Rows",result1[0].changes + result2[0].changes);
            return {"rowsUpdated":result1[0].changes + result2[0].changes};
        }
        catch(e){
            console.error("SQLiteUpdateError", e);
            return {"error":e};
        }
    }
    async getAllUsers(){
    try {
      const rows= await this.connection.all(`Select * from users`);
      console.log(rows);
      return {'users':rows};
    }
    catch(e){
      console.error("SQLiteUpdateError", e);
      return {'error':e};
    }
  }
  async checkMemberShip(user_id) {
    try {
      const result = await this.connection.all(
        `select count(*) as items from users where user_id like '${user_id}' and allowed like 'ENABLED'`
      );
      console.log(result);
      return result[0].items > 0;
    } catch (e) {
      console.error("SQLiteDataSelectionError", e);
    }
  }
  provideMetaData() {}
  async testConnection() {
    try {
      const [res] = await this.connection.all("Select 2*3");
      console.log(res);
      await this.connection.end();
      console.log(res);
    } catch (err) {
      console.error("SQLiteConnectionTestError", err);
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
      const rows = await this.connection.all(
        `insert into sales values ('${record.sale_id}','${record.user_id}','${record.vendor_name}',${record.weight},${record.rate_per_kg},${record.price},${record.discount},${record.net},'${record.timestamp}')`
      );
      return record;
    } catch (e) {
      console.error("SQLiteDataInsertionError", e);
      return {};
    }
  }
  //let datePart= date.toISOString().split('T')[0];
  //let timePart= date.toISOString().split('T')[1].split('Z')[0];
  //let sqlDateTimeFormat= datePart + ' ' + timePart
  insertNewRecord(sale_data) {}
  async createNewUser(userdata) {
    try {
      const rows= await this.connection.all(
        `INSERT INTO users VALUES ('${userdata.token}','${userdata.email}','${userdata.pass}','${userdata.address}','${userdata.phone}','${userdata.name}',"DISABLED")`
      );
      if (rows && rows.changes) return rows.changes;
      else return 0;
    } catch (e) {
      console.error("SQLiteDataInsertionError", e);
      return -1;
    }
  }
  
  async deleteRecord(sale_id, user_id) {
    try {
      const rows= await this.connection.all(
        `DELETE FROM sales WHERE user_id='${user_id}' AND sale_id='${sale_id}'`
      );
      console.log(rows);
      return rows.changes == 1;
    } catch (e) {
      console.error("SQLiteDataDeletionError", e);
      return false;
    }
  }
  closeConnection() {}
  async sumColumnRows(column, auth_id) {
    try {
      // console.log(auth_id);
      const rows= await this.connection.all(
        `SELECT SUM(${column}) as totalNet FROM sales WHERE user_id LIKE '${auth_id}'`
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
      const rows = await this.connection.all(
        `SELECT SUM(${column}) as totalNet FROM sales WHERE user_id LIKE '${auth_id}' and DATETIME(timestamp)=DATETIME('now')`
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
      const rows = await this.connection.all(
        `SELECT SUM(${column}) as totalNet FROM sales WHERE user_id LIKE '${auth_id}' AND ${columnCmp} =='${value}'`
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
      const rows = await this.connection.all(
        `SELECT AVG(${column}) as totalNet FROM sales WHERE user_id like '${auth_id}'`
      );
      // console.log(rows);
      return rows[0].totalNet;
    } catch (e) {
      console.error(`Error while calculation sum of ${column} `, e);
      return -1;
    }
  }
  async checkRegisteration(auth_data) {
    console.log("Reaches HEre");
    try {
      const rows = await this.connection.all(
        `SELECT * FROM users WHERE email LIKE '${auth_data.email}'`
      );
      console.log(rows);
      const passCorrect = await checkPassword(
        auth_data.password,
        rows[0].password
      );
      const isAllowed= await this.connection.all(`SELECT allowed FROM users WHERE email like '${auth_data.email}'`);
      console.log(isAllowed);
      if (passCorrect && isAllowed[0]['allowed']=='ENABLED') return { isRegistered: true, auth_id: rows[0].user_id,allowed:true };
      else if(passCorrect && isAllowed[0]['allowed']=='DISABLED') return {isRegistered:true, auth_id: rows[0].user_id,allowed:false};
      else return { isRegistered: false, auth_id: "" };
    } catch (e) {
      console.error("SQLiteDataSelectionError", e);
      return {};
    }
  }
  async checkAdminRegisteration(auth_data){
    try {
      const rows = await this.connection.all(
        `SELECT * FROM admins WHERE email LIKE '${auth_data.email}'`
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
      console.error("SQLiteDataSelectionError", e);
      return {};
    }
  }
  async getTables(){
    try {
      const rows= await this.connection.all(
        `SELECT * FROM users`
      );
      console.log(rows);
      return { isSuccess: true, list: rows };
    } catch (e) {
      console.error("SQLiteDataSelectionError", e);
      return { isSuccess: false };
    }
  }
  async getSaleRecords(auth_id) {
    try {
      const rows= await this.connection.all(
        `SELECT * FROM sales WHERE user_id LIKE '${auth_id}'`
      );
      //console.log(rows);
      return { isSuccess: true, list: rows };
    } catch (e) {
      console.error("SQLiteDataSelectionError", e);
      return { isSuccess: false };
    }
  }   

    async closeConnection(){
        await this.connection.close();
    }
    async initSteps(){
        try{
            const rows= await this.connection.all(`SELECT name FROM sqlite_master WHERE type='table'`);
            console.log(rows);
        }
        catch(e){
           console.log("SQLite Error: ",e);
        }
    }

}


// await db.initSteps();