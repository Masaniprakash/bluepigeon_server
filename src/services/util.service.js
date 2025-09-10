const { to } = require('await-to-js');

module.exports.to = async (promise) => {
  let err, res;

  [err, res] = await to(promise);

  if (err) return [err];

  return [null, res];

};

module.exports.ReE = function (res, err, code) {
  // Error Web Response
  if (typeof err == "object" && typeof err.message != "undefined") {

    err = err.message;

  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json({ success: false, error: err });

};

module.exports.ReS = function (res, data, code) {
  // Success Web Response
  let send_data = { success: true };

  if (typeof data == "object") {

    send_data = Object.assign(data, send_data); //merge the objects

  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json(send_data);

};

module.exports.TE = function (err_message, log) {
  // TE stands for Throw Error
  if (log === true) {

    console.error(err_message);

  }

  throw new Error(err_message);

};

function isNull(field) {

  return (
    field === undefined ||
    field === "null" ||
    field === "undefined" ||
    field === "" ||
    field === null
  );

}

module.exports.isNull = isNull;

function isObject(obj) {

  return Object.prototype.toString.call(obj) === "[object Object]";

}

module.exports.isObject = isObject;

function isEmpty(obj) {

  return !Object.keys(obj).length > 0;

}
module.exports.isEmpty = isEmpty;

module.exports.isEmail = (email) => {

  // const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const reg = /^[a-z0-9]+[.]?[a-z0-9]{0,30}@[a-z]+(\.(in|co|com|net)+)$/;

  if (reg.test(email)) {

    return true;

  } else {

    return false;

  }

};

module.exports.genrateUserName = (name) => {

  if (String(name).length < 0) return "";

  name = name[0].toUpperCase() + name.slice(1).trim();

  min = Math.ceil(0);

  max = Math.floor(900);

  let num = Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  
  let str = `${String(name).slice(0, 4)}${num}`;

  return str;

};

module.exports.firstLetterCap = (data) => {

  let normal = String(data).toLowerCase();

  if (normal.length < 0) {

    return '';

  } else {

    normal = normal[0].toUpperCase() + normal.slice(1).trim();

    return normal;
    
  }
}

module.exports.firstNameSecondNameCap = (data) => {

  let normal = String(data).toLowerCase();
  
  if (normal.length < 0) {

    return '';
      
  } else {

    let arr = normal.split(' ');
    let str = '';
    arr.forEach((item) => {
        str += item[0].toUpperCase() + item.slice(1).trim() + ' ';
    });

    return str;

  }
}

module.exports.findDuplicateValue = (arr) => {

  let dulicate = arr.filter((item, index) => arr.indexOf(item) != index);

  return dulicate;
  
}