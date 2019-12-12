/* eslint-disable func-style */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
let cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "example"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "example"
  }
};

const users = {};

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
  users[userID].id = userID;
  users[userID].email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID].password = hashedPassword;

  res.cookie('user_id', userID);
  res.redirect('/urls');

});




//login and logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;


  if (checkDataInUsers(email, 'email')) {
    for (let userID in users) {
      let savedPassword = users[userID].password;

      if (bcrypt.compareSync(password, savedPassword)) {

        let temp = users[userID];
        if (temp.email === email) {
          let user_id;
          user_id = userID;
          res.cookie('user_id', user_id);
          res.redirect("/urls");
        }
      }
    }

  } else {
    res.status(403);
    res.send('wrong password/username bud');
  }






});


//url management

app.post(`/urls/:shortURL/delete`, (req, res) => {
  let shortURL = req.params.shortURL;
  let id = req.cookies.user_id;
  if (id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  }
  res.send("you don't have permission to do this, friend");

});

//go to edit page
app.post(`/urls/:shortURL/toedit`, (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//update the edited info
app.post(`/urls/:shortURL/edit`, (req, res) => {
  let shortURL = req.params.shortURL;
  let id = req.cookies.user_id;
  if (id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = req.body.longURL;
    urlDatabase[shortURL].userID = id;

    res.redirect('/urls');
  }

});


//create new urls
app.get("/urls/new", (req, res) => {
  let id = req.cookies.user_id;
  let templateVars = { user: '' };
  templateVars.user = users[id];
  if (id === undefined) {
    templateVars = undefined;
    res.redirect('/login');
  }
  //temporarily takeout verify if login function
  // } else if (checkDataInUsers(id, 'id')) {
  //   res.render("urls_new", templateVars);
  // } else {
  //   res.redirect('/login');
  // }
  res.render('urls_new', templateVars);

});



//create a new shortURL for a input of longURL on urls/new
app.post("/urls", (req, res) => {

  let short = generateRandomString(6);
  urlDatabase[short] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  res.redirect(`/urls/${short}`);

});

//redirect to longURL from short URL
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

//display current urls list
app.get("/urls", (req, res) => {
  let id = req.cookies.user_id;
  let templateVars = { urls: {} };
  templateVars.urls = urlsForUser(id);
  templateVars.user = users[id];

  if (id === undefined) {
    templateVars.user = undefined;
  }
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});

//edit associated longURL
app.get("/urls/:shortURL", (req, res) => {
  let id = req.cookies.user_id;
  let allowedURLs = urlsForUser(id);
  let templateVars = {};
  for (let shortURL in allowedURLs) {
    if (req.params.shortURL === shortURL) {
      templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: {} };

    }

  }
  templateVars.user = users[id];

  if (templateVars.shortURL === undefined) {
    templateVars.shortURL = '';
    templateVars.longURL = '';
  }
  if (id === undefined) {
    templateVars.user = undefined;
  }
  res.render("urls_show", templateVars);
});








app.set('view engine', 'ejs');
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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


function urlsForUser(id) {
  let output = {};
  for (let shortURL in urlDatabase) {
    let currentURL = urlDatabase[shortURL];
    if (currentURL.userID === id || currentURL.userID === 'example') {
      output[shortURL] = { longURL: currentURL.longURL };
    }
  }
  return output;
}