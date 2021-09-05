const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const port = 3000;

const dbConnection = require("./config/db");
const uploadFile = require("./middlewares/uploads");
const uploads = require("./middlewares/uploads");

// const { query } = require("express");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Todo
hbs.registerPartials(__dirname + "/views/partials");
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//READ
app.get("/", (req, res) => {
  const query = "SELECT * FROM tb_product ORDER BY id DESC";
  dbConnection.query(query, (err, rows) => {
    let data;
    if (err) throw err;
    if (rows.length === 0) {
      console.log("data Kosong");
      data = "";
      res.render("index", {
        datas: data,
      });
    } else {
      data = rows;
      res.render("index", {
        datas: data,
        isLogin: req.session.isLogin,
      });
    }
  });
});

// LOGIN
app.get("/login", (req, res) => {
  res.render("login");
});

let coockie;
// THIS AFTER LOGIN
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let query = `SELECT *, MD5(password) as password FROM tb_user WHERE email = '${email}' AND password = '${password}'`;
  dbConnection.query(query, (err, rows) => {
    if (err) throw err;
    console.log(rows);

    if (rows.length === 0) {
      return res.render("login", {
        passwordWrong: true,
      });
    }

    req.session.user = {
      id: rows[0].id,
      email: rows[0].email,
      password: rows[0].password,
      address: rows[0].address,
      status: rows[0].status,
    };

    coockie = req.session.user;
    console.log("asede", coockie.email);

    if (rows[0].status === "1") {
      res.redirect("/homePage-user");
    } else {
      res.redirect("/homePage-admin");
    }
  });
});

// HOME PAGE USER
app.get("/homePage-user", (req, res) => {
  const query = "SELECT * FROM tb_product ORDER BY id DESC";
  dbConnection.query(query, (err, rows) => {
    req.session.isLogin = true;
    // isLogin = true;
    data = rows;
    res.render("homePageUser", {
      isLogin: req.session.isLogin,
      admin: false,
      datas: data,
      coockie,
    });
    console.log(coockie);
  });
});

// HOME PAGE USER
app.get("/homePage-admin", (req, res) => {
  const query = "SELECT * FROM tb_product ORDER BY id DESC";
  dbConnection.query(query, (err, rows) => {
    req.session.isLogin = true;
    data = rows;
    // isLogin = true;
    res.render("homePageAdmin", {
      isLogin: req.session.isLogin,
      admin: true,
      datas: data,
      coockie,
    });
  });
});

// LOGOUT
app.get("/logout", (req, res) => {
  res.render("index", {
    isLogin: false,
    admin: false,
    datas: data,
  });
});

//GET PAGE ADD-PRODUCT
app.get("/add-product", (req, res) => {
  req.session.isLogin = true;
  res.render("addProduct", {
    isLogin: req.session.isLogin,
    admin: true,
  });
});

//PROSES ADD PRODUCT
app.post("/proses-addProduct", uploadFile("photo"), (req, res, next) => {
  let { name, description, price, stock, category, brand } = req.body;
  let photo = req.file.filename;
  let error = false;

  if (name.length === 0 || description.length === 0 || price.length === 0 || photo.length === 0 || stock.length === 0 || category.length === 0 || brand.length === 0) {
    console.log("Please enter complete product data");
    res.render("addProduct", {
      name,
      description,
      price,
      stock,
      category,
      brand,
      error: true,
    });
  } else {
    let query = `INSERT INTO tb_product (name,description,price,photo,stock,category_id,brand_id) VALUES ("${name}","${description}","${price}","${photo}","${stock}","${category}","${brand}")`;
    dbConnection.query(query, (err, rows) => {
      if (err) throw err;
      res.redirect("/homePage-admin");
    });
  }
});

//REGISTER
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/proses-register", (req, res, next) => {
  let { email, password, status, address } = req.body;
  let error = false;
  success = false;

  if (email.length === 0 || password.length === 0 || address.length === 0 || status === "Choose Status...") {
    error = true;
    console.log("Please enter complete your data");
    res.render("register", {
      email,
      password,
      status,
      address,
      error: true,
    });
  } else {
    let query = `INSERT INTO tb_user (email,password,status,address) VALUES ("${email}","${password}","${status}","${address}")`;
    dbConnection.query(query, (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        res.render("register", {
          success: true,
        });
      }
    });
  }
});

//UPDATE
app.get("/edit-product/(:id)", (req, res) => {
  let id = req.params.id;
  let query = `SELECT * FROM tb_product WHERE id = ${id}`;

  dbConnection.query(query, (err, rows, field) => {
    if (err) throw err;
    console.log(rows);
    res.render("edit", {
      isLogin: req.session.isLogin,
      admin: true,
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      price: rows[0].price,
      photo: rows[0].photo,
      stock: rows[0].stock,
      category: rows[0].category_id,
      brand: rows[0].brand_id,
    });
  });
});

// PROSES UPDATE
// todo
app.post("/proses-edit/:id", uploadFile("photo"), (req, res, next) => {
  let id = req.params.id;
  let { name, description, price, stock, category, brand } = req.body;
  let photo = req.file.filename;

  let error = false;

  if (name.length === 0 || description.length === 0 || price.length === 0 || photo.length === 0 || stock.length === 0 || category.length === 0 || brand.length === 0) {
    error = true;
    console.log("Please enter complete product data");
    res.render("edit", {
      name,
      description,
      price,
      photo,
      stock,
      category,
      brand,
      error: true,
    });
  }
  let query = `UPDATE tb_product SET 
      name = "${name}",
      description = "${description}",
      price = "${price}",
      photo = "${photo}",
      stock = "${stock}",
      category_id = "${category}",
      brand_id = "${brand}",
      update_at = NOW() 
      WHERE id = "${id}"`;
  dbConnection.query(query, (err, rows, field) => {
    console.log(rows);
    if (err) throw err;
    res.redirect("/homePage-admin");
  });
});

//DELETE
// todo
app.get("/delete-product/(:id)", (req, res) => {
  let id = req.params.id;
  let query = `DELETE FROM tb_product WHERE id = ${id}`;
  dbConnection.query(query, (err, rows) => {
    if (err) throw err;
    res.redirect("/homePage-admin");
  });
});

//CREATE SERVER
app.listen(port, () => {
  console.log("Server is Connect");
});
