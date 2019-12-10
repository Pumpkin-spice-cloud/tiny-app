/* eslint-disable func-style */
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  
  let short = generateRandomString(6);
  urlDatabase[short] = req.body.longURL;
  console.log(short, urlDatabase[short]);
  res.redirect(`/urls/${short}`);
  // Respond with 'Ok' (we will replace this)
});
app.post("/urls", (req, res) => {
  console.log('ok');
  res.send('ok');
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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
