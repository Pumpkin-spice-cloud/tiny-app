/* eslint-disable camelcase */
/* eslint-disable func-style */
const helper = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const urlDatabase = {};
const sampleUrlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: ""
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: ""
  }
};

const users = {};

const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key']

}));


//Account registration
app.get("/register", (req, res) => {
  let id = req.session.user_id;
  let templateVars = { user: '' };
  templateVars.user = users[id];
  res.render("urls_registration", templateVars);
});


app.post("/register", (req, res) => {
  let userId = helper.generateRandomString(5);

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Fill in your fields, ya doofus');
  }
  if (helper.checkDataInObject(req.body.email, 'email', users)) {
    res.status(400);
    res.send('Use another email, bud');
  }
  users[userId] = {};
  users[userId].id = userId;
  users[userId].email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId].password = hashedPassword;

  //Add some sample url links upon registration
  const userSampleUrlDatabase = sampleUrlDatabase;
  for (let shortURL in userSampleUrlDatabase) {
    userSampleUrlDatabase[shortURL].userId = userId;
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL] = userSampleUrlDatabase[shortURL];
  }

  req.session.user_id = userId;//cookie userid assign
  res.redirect('/urls');

});




//User login and logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  let id = req.session.user_id;
  let templateVars = { user: '' };
  templateVars.user = users[id];
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { password, email } = req.body;

  let userId = helper.getUserByEmail(email, users);
  let user = users[userId];
  let savedHashedPassword = user.password;

  if (bcrypt.compareSync(password, savedHashedPassword)) {
    req.session.user_id = userId; //upon successful login, store userId as encrypted cookie
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send('Wrong password or username bud');
  }
});

//url management
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  let userId = req.session.user_id;
  if (userId === urlDatabase[shortURL].userId) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.send("you don't have permission to do this, friend");
  }
});

//go to edit page
// app.post(`/urls/:shortURL/toedit`, (req, res) => {
//   res.redirect(`/urls/${req.params.shortURL}`);
// });

//update the edited info
app.post(`/urls/:shortURL/`, (req, res) => {
  let shortURL = req.params.shortURL;
  let id = req.session.user_id;
  if (id === urlDatabase[shortURL].userId) {
    delete urlDatabase[shortURL];
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = req.body.longURL;
    urlDatabase[shortURL].userId = id;

    res.redirect('/urls');
  }

});


//create new urls
app.get("/urls/new", (req, res) => {
  let id = req.session.user_id;
  let templateVars = { user: '' };
  templateVars.user = users[id];
  if (helper.checkDataInObject(id, 'id', users)) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});



//create a new shortURL for a input of longURL on urls/new
app.post("/urls", (req, res) => {

  let short = helper.generateRandomString(6);
  urlDatabase[short] = {
    longURL: req.body.longURL,
    userId: req.session.user_id
  };

  res.redirect(`/urls/${short}`);

});

//redirect to longURL from short URL
app.get("/u/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let templateVars = {user: '' };
  templateVars.user = users[id];

  if (id === undefined) {
    templateVars.user = undefined;
  }
  if (urlDatabase[req.params.shortURL]) {

    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.render('urls_missing',templateVars);
  }

});

//display current urls list
app.get("/urls", (req, res) => {
  let id = req.session.user_id;
  let templateVars = { urls: {}, user: '' };
  templateVars.urls = helper.urlsForUser(id, urlDatabase);
  templateVars.user = users[id];

  if (id === undefined) {
    templateVars.user = undefined;
  }
  res.render("urls_index", templateVars);
});

//edit associated longURL
app.get("/urls/:shortURL", (req, res) => {
  let id = req.session.user_id;
  let shortUrlInput = req.params.shortURL;
  let allowedURLs = helper.urlsForUser(id, urlDatabase);
  let templateVars = {};

  for (let shortURL in allowedURLs) {
    if (shortUrlInput === shortURL) {
      templateVars = { shortURL: shortUrlInput, longURL: urlDatabase[shortUrlInput].longURL, user: {} };
    }

  }
  if (helper.checkDataInObject(id, 'id', users)) {
    templateVars.user = users[id];
  }
  if (helper.checkDataInObject(id, 'id', users) === false) {
    templateVars.user = undefined;
  }

  if (templateVars.shortURL === undefined) {
    templateVars.shortURL = undefined;
    templateVars.longURL = undefined;
  }

  res.render("urls_show", templateVars);
});








app.set('view engine', 'ejs');
app.get("/", (req, res) => {
  let id = req.session.user_id;
  if (helper.checkDataInObject(id, 'id', users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





