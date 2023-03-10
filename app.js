const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(express.json());
app.use(
  session({
    secret: "secret word",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next) => {
  if (req.session.email) {
    res.locals.isloggedIn = true;
  } else {
    res.locals.isloggedIn = false;
  }
  next();
});

const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "xenol",
});
connection.connect((error) => {
  error ? console.error(error) : console.log("DB successfully connected"); //ternary operators
});

app.get("/", (req, res) => {
  res.render("home");
});

function logTimesstamp(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]${req.method}${req.url}`);
  next();
}
app.get("/users", (req, res) => {
  res.render("about");
});
//custom middleware function
app.get("/about", logTimesstamp, (req, res) => {
  res.render("about");
});

app.get("/product", (req, res) => {
  res.render("product");
});
app.get("/product", (req, res) => {
  res.render("product");
});
app.post("/product", (req, res) => {
  connection.query(
    "INSERT INTO product(product_id,product_name,price)VALUES(?,?,?)",
    [req.body.id, req.body.name, req.body.price],
    (error) => {
      if (error) {
        console.log(error);
        res.status(500).render(error);
      } else {
        res.render("product", { message: "product added to DB" });
      }
    }
  );
  app.post("/product/:id", (req, res) => {
    res.render("product");
  });
  // res.render("product",{message:"product added to DB"})
});
app.get("/login", logTimesstamp, (req, res) => {
  res.render("login");
});
app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    res.redirect("/");
  });
});
app.post("/login", (req, res) => {
  // console.log(req.body);
  //check if email exist in db
  //if it does exist,compare the provided with the existing password
  //if password is correct ,then create a session for them
  connection.query(
    "SELECT email,password FROM companies WHERE email=?",
    [req.body.email],
    (error, result) => {
      if (error) {
        res.status(500).render("error");
      } else {
        if (result.length > 0) {
          //compare passwords
          bcrypt.compare(req.body.password, result[0].password);
          if (result[0].password === req.body.password) {
            req.session.email = result[0].email;
            res.redirect("/");
          } else {
            res.render("login", { error: "password is incorrect" });
          }
        } else {
          res.render("login", { error: "Email not registered!" });
        }
      }
    }
  );
  // res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const user = req.body;
  if (user.password === user.confirm_password) {
    //successful login
    connection.query(
      "select email FROM companies WHERE email=?",
      [user.email],
      (error, result) => {
        if (error) {
          console.log(error);
          res.status(500).render("error");
        } else {
          //check the length of the result(if greater than zero the email already exist in db else continue to register/save data to db)
          if (result.lenght > 0) {
            res.render("register", {
              error: true,
              error: "Email is already registered!",
              data: req.body,
            });
          } else {
            bcrypt.hash(req.body.password, 6, function (err, hash) {
              // Store hash in your password DB.

              // Store hash in your password DB.
              console.log(hash);
              connection.query(
                "INSERT INTO companies(company_name,email,password,domain_name,num_of_employees,description,service)VALUES(?,?,?,?,?,?,?)",
                [
                  user.COmpany,
                  user.email,
                  hash,

                  user.domain,
                  user.num_of_employees,
                  user.description,
                  "general-3",
                ],
                (error) => {
                  // error ? res.status(500).render("error") : res.redirect("/login");
                  if (error) {
                    console.log(error);
                    res.status(500).render("error");
                  } else {
                    res.redirect("/login");
                  }
                }
              );
            });
          }
        }
      }
    );
    //contribute to save data in db
  } else {
    //render register with an error
    res.render("register", {
      error: true,
      password: "password and confirm do not match",
      data: req.body,
    });
  }
});
app.listen(3000, () => {
  console.log("listen on port 3000");
});
