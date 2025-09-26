const jwt = require('jsonwebtoken');
// const config = require('../zoom_config');

exports.get_base_url = async () => {
    const base_url = "https://api.zoom.us/v2";
    return base_url;
}

// exports.get_jwt_token = async () => {
//     const payload = {
//         iss: config.APIKey,
//         exp: ((new Date()).getTime() + 5000)
//     };
//     const token = jwt.sign(payload, config.APISecret);
//     return token;
// }