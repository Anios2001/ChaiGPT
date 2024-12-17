const redis = require("redis");
const Database = require("./databaseClass");

const {
  getToken,
  getHash,
  getHashes,
  getCrypticHash,
  checkPassword,
} = require("../token_files/getToken");
function checkDataAuthenticity(data, token) {
  curr_token = getToken({ email: data.email, password: data.pass });
  if (curr_token == token) return true;
  else return false;
}
class RedisDataBase extends Database {
  client;
  RedisDataBase() {}
  async createConnection() {
    //This connects to local database on 6379 port no
    this.client = redis.createClient({
      url: "redis://localhost:6379",
      legacyMode: false,
    });

    this.client.on("error", (err) => console.error("SERVER::REDISERR", err));
    this.client.on("connect", () => console.error("Connection"));
    this.client.on("reconnecting", () => {
      console.error("Attempting to reconnect to Redis...");
    });

    this.client.on("end", () => {
      console.error("Redis connection closed.");
    });
    await this.client.connect();
  }
  async checkMemberShip(user_id) {
    const exists = await this.client.exists(`user:${user_id}`);
    return exists;
  }
  async defineConnectionStrings() {
    await this.client.ping();
  }
  async getSaleRecords(auth_id) {
    return this.getArrayFromPath("$.sales_data", auth_id);
  }
  async getArrayFromPath(path, auth_id) {
    const records = await this.client.json.get(`user:${auth_id}`, path);
    if (records == null) return { isSuccess: false };
    //sconsole.log(records);
    console.log(`is Array : ${Array.isArray(records.sales_data)}`);
    return { isSuccess: true, list: records.sales_data };
  }
  provideMetaData() {}
  getJSONArray() {}
  async batchInsert(auth_id, sale_records) {
    const hashes = getHashes(sale_records);
    let index;
    for (index = 0; index < sale_records.length; index++) {
      sale_records[index].sale_id = hashes[index];
    }
    const path = `$.sales_data`;
    await insertInSubArray(auth_id, path, sale_records);
  }
  async insertInSubArray(key, path, data) {
    try {
      const result = await this.client.json.arrAppend(
        `user:${key}`,
        path,
        JSON.stringify(data)
      );
      if (result != null && result[0] == 1) return { sale_id: data.sale_id };
    } catch (exception) {
      console.error("RedisDATABASE::Saving User Data", exception);
      console.groupEnd("Database Library");
      return { error: exception };
    }
  }
  async singleOperation(auth_id, sale_record) {
    const sale_id = getHash(sale_record);
    sale_record.sale_id = sale_id;
    const path = `$.sales_data`;
    return this.insertInSubArray(auth_id, path, sale_record);
  }
  async insertNewRecord(userdata) {
    const data_to_insert = userdata ?? "NA";
    if (typeof data_to_insert == "string") {
      console.log("Data is not valid ", typeof userdata);
      console.groupEnd("Database Library");
      return -1;
    } else {
      if (!checkDataAuthenticity(userdata, userdata.token)) {
        console.log(
          "Data was compromised in transit.. Ignoring Save Operation"
        );
        console.groupEnd("Database Library");
        return 202;
      } else {
        data_to_insert.sales_data = [];
        try {
          //Hashing Process
          // const hashed = getCrypticHash(userdata.pass);
          // if (hashed == undefined) return -1;
          // userdata.pass = hashed;
          console.log(data_to_insert);
          await this.client.json.set(`user:${userdata.token}`, "$", {
            email: data_to_insert.email,
            password: data_to_insert.pass,
            token: data_to_insert.token,
            name: data_to_insert.name,
            phone: data_to_insert.phone,
            address: data_to_insert.address,
            sales_data: data_to_insert.sales_data,
          });
          await this.client.hSet(
            `users`,
            data_to_insert.email,
            data_to_insert.token
          );
          return 1;
        } catch (exception) {
          console.error("RedisDATABASE::Saving User Data", exception);
          console.groupEnd("Database Library");
          return -1;
        }
      }
    }
  }
  createNewUser(email, passwordHash) {}
  closeConnection() {}
  async checkRegisteration(user_data) {
    // console.log(user_data);
    const user_id = await this.client.hGet("users", user_data.email);
    // console.log(user_id);
    if (user_id == null) return { isRegistered: false, auth_id: "" };
    const passkey = await this.client.json.get(`user:${user_id}`, {
      path: ".password",
    });
    console.log("PassKey", passkey);
    const passCorrect = await checkPassword(user_data.password, passkey);
    console.log(passCorrect);
    if (passCorrect) return { isRegistered: true, auth_id: user_id };
    else return { isRegistered: false, auth_id: "" };
  }
}
module.exports = RedisDataBase;
