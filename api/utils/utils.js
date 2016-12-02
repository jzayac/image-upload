'use strict'

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.uid = function(len) {
  let buf = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charlen = chars.length;

 for (let i = 1; i < len + 1; i++) {
   buf.push(chars[getRandomInt(0, charlen - 1)]);
 }

 return buf.join('');
}

exports.stringToUrl = function(str) {
  let url = str.trim();
  url = url.replace(/(\s)/g, '-');
  return url;
}

exports.responseHelper = function(res, err, data, info) {
  if (err) {
    res.status(500).send();
    return false;
  }
  // probably not good idea
  // if (!err && data === false) {
  //   res.status(401).send();
  //   return false;
  //
  // }
  if (info) {
    if (info.error) {
      res.status(info.status).json({
        error: info.error,
      });
    } else {
      res.status(info.status).send();
    }
    return false;
  }

  if (!data) {
    res.status(404).send();
    return false;
  }
  return true;
}
