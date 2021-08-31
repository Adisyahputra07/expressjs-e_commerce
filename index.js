const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const port = 8000;

const mysql = require("mysql");
const dbConnection = require("./config/db");
const { query } = require("express");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
// Todo
hbs.registerPartials(__dirname + "/views/partials");
// supaya bisa di akses
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HOME PAGE PUBLIC
app.get("/homePagePublic", (req, res) => {
  let data;
  const query = "SELECT * FROM tb_product ORDER BY id DESC";
  dbConnection.query(query, (err, rows) => {
    data = rows;
    res.render("homePagePublic", {
      datas: data,
    });
  });
});

//READ
app.get("/", (req, res) => {
  const query = "SELECT * FROM tb_product ORDER BY id DESC";
  dbConnection.query(query, (err, rows) => {
    let data;
    if (err) {
      console.log(err);
      data = "";
      res.render("index", {
        datas: data,
      });
    } else {
      data = rows;
      res.render("index", {
        datas: data,
      });
    }
  });
});

//GET PAGE ADD-PRODUCT
app.get("/add-product", (req, res) => {
  res.render("addProduct");
});

//PROSES ADD PRODUCT
app.post("/proses-addProduct", (req, res, next) => {
  let { name, description, price, photo, stock, category, brand } = req.body;
  let error = false;

  if (name.length === 0 || description.length === 0 || price.length === 0 || photo.length === 0 || stock.length === 0 || category.length === 0 || brand.length === 0) {
    console.log("Please enter complete product data");
    res.render("addProduct", {
      name,
      description,
      price,
      photo,
      stock,
      category,
      brand,
      error: true,
    });
  } else {
    let query = `INSERT INTO tb_product (name,description,price,photo,stock,category_id,brand_id) VALUES ("${name}","${description}","${price}","${photo}","${stock}","${category}","${brand}")`;
    dbConnection.query(query, (err, rows) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
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
      title: "Edit Product",
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
app.post("/proses-edit/:id", (req, res, next) => {
  let id = req.params.id;
  let { name, description, price, photo, stock, category, brand } = req.body;
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
    res.redirect("/");
  });
});

//DELETE
// todo
app.get("/delete-product/(:id)", (req, res) => {
  let id = req.params.id;
  let query = `DELETE FROM tb_product WHERE id = ${id}`;
  dbConnection.query(query, (err, rows) => {
    if (err) throw err;
    res.redirect("/");
  });
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

// LOGIN
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/proses-login", (req, res) => {
  let { email, password } = req.body;
  let query = `SELECT * FROM tb_user WHERE email = '${email}' AND password = '${password}'`;
  dbConnection.query(query, (err, rows) => {
    if (err) {
      // todo
      return res.render("login", {
        passwordWrong: true,
      });
    }

    if (rows[0].status == 1) {
      let data;
      const query = "SELECT * FROM tb_product ORDER BY id DESC";
      dbConnection.query(query, (err, rows) => {
        data = rows;
        res.render("homePageUser", {
          datas: data,
          title: "Ex Coffee",
        });
      });
    } else {
      res.redirect("/");
    }
  });
});

//CREATE SERVER
app.listen(port, () => {
  console.log("Server is Connect");
});
