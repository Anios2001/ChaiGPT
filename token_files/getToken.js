const jwt = require('jsonwebtoken');
function getToken(data){
    return jwt.sign(data, "IWAMKFjkdas784398837dfjh");
}
module.exports= {getToken};
