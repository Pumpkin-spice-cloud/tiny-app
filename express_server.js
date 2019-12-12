/* eslint-disable func-style */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let cookieParser = require('cookie-parser');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { abc: { id: 'abc' } };

const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


//Registration
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  let userID = generateRandomString(5);

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Fill in your fields, ya doofus');
  }
  if (checkDataInUsers(req.body.email, 'email')) {
    res.status(400);
    res.send('Use another email, bud');
  }
  users[userID] = {};
  users[userID]['id'] = userID;
  users[userID]['email'] = req.body.email;

  users[userID]['password'] = req.body.password;
  res.cookie('user_id', userID);
  res.redirect('/urls');

});





app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (checkDataInUsers(email, 'email')) {
    if (checkDataInUsers(password, 'password')) {
      let user_id;
      for (let user in users) {
        let temp = users[user];
        if (temp.email === email) {
          user_id = user;
        }
      }
      res.cookie('user_id', user_id);
      res.redirect("/urls");

    }
    else {
      res.status(403);
      res.send('wrong password/username bud');
    }
  }
  else {
    res.status(403);
    res.send('wrong password/username bud');
  }
  
  //console.log(username);

  
});

app.post(`/urls/:shortURL/delete`, (req, res) => {


  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
  //console.log(urlDatabase);

});
app.post(`/urls/:shortURL/toedit`, (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
app.post(`/urls/:shortURL/edit`, (req, res) => {
  delete urlDatabase[req.params.shortURL];
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');

});

app.get("/urls/new", (req, res) => {
  let id = req.cookies.user_id;

  // console.log(users[id]);

  let templateVars = { user: '' };
  templateVars.user = users[id];
  if (id === undefined) {
    templateVars = undefined;
  }


  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console

  let short = generateRandomString(6);
  urlDatabase[short] = req.body.longURL;
  //console.log(short, urlDatabase[short]);
  res.redirect(`/urls/${short}`);
  // Respond with 'Ok' (we will replace this)
});


app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});






app.set('view engine', 'ejs');
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let id = req.cookies.user_id;

  // console.log(users[id]);



  let templateVars = { urls: urlDatabase, user: {} };
  templateVars.user = users[id];
  console.log(req.cookies);

  if (id === undefined) {
    templateVars.user = undefined;
  }
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let id = req.cookies.user_id;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: {} };
  templateVars.user = users[id];
  if (id === undefined) {
    templateVars.user = undefined;
  }
  res.render("urls_show", templateVars);
});

function generateRandomString(length) {

  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;


}

function checkDataInUsers(string, type) {
  for (let user in users) {
    let temp = users[user];
    if (temp[type] === string) {
      return true;
    }
  }
  return false;
}


