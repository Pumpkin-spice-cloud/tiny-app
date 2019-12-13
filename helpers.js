/* eslint-disable func-style */


function generateRandomString(length) {

  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;


}

function checkDataInObject(string, type, database) {
  for (let data in database) {
    let temp = database[data];
    if (temp[type] === string) {
      return true;
    }
  }
  return false;
}


function urlsForUser(id, database) {
  let output = {};
  for (let shortURL in database) {
    let currentURL = database[shortURL];
    if (currentURL.userId === id) {
      output[shortURL] = { longURL: currentURL.longURL };
    }
  }
  return output;
}

function getUserByEmail(email, database) {
  let userOutput;
  for (let user in database) {
    if (database[user].email === email) {
      userOutput = user;
    }
  }
  return userOutput;
}

module.exports = { generateRandomString, checkDataInObject, urlsForUser, getUserByEmail };