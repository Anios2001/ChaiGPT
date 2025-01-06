const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
function getToken(data) {
  const hash = crypto.createHash("sha256");
  return hash
    .update(jwt.sign(data, "IWAMKFjkdas784398837dfjh"))
    .digest("base64");
}
function getHash(data) {
  const hash = crypto.createHash("sha256");
  hash.update(typeof data != "string" ? JSON.stringify(data) : data);
  return hash.digest("base64");
}
function getHashes(data) {
  let hashes = [];
  for (let element of data) {
    const hash = crypto.createHash("sha256");
    hash.update(typeof data != "string" ? JSON.stringify(data) : data);
    hashes.push(hash);
  }
  return hashes;
}
async function getCrypticHash(data) {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(data, salt);
    return hashedPass;
  } catch (exception) {
    console.error("HASHING_ERROR::", exception);
    return undefined;
  }
}
async function checkPassword(password, hashedPass) {
  return bcrypt.compare(password, hashedPass);
}
//getCrypticHash("aniket9644#").then((str)=>console.log(str));
module.exports = {
  getToken,
  getHash,
  getHashes,
  getCrypticHash,
  checkPassword,
};
