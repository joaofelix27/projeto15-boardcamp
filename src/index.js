import express from "express";
import connection from "./db/postgres.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/categories", async (req, res) => {
  const categories = await connection.query("SELECT * FROM categories");
  res.send(categories.rows);
});
app.post("/categories", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.sendStatus(400);
  }
  try {
    const findCategories = await connection.query(
      `SELECT * FROM categories WHERE name='${name}'`
    );
    console.log(findCategories.rows);
    if (findCategories.rows.length === 0) {
      await connection.query("INSERT INTO categories (name) VALUES ($1)", [
        name
      ]);
      return res.sendStatus(201);
    } else {
      return res.sendStatus(409);
    }
  } catch {
    return res.sendStatus(500);
  }
});
app.get("/games", async (req, res) => {
  const { name } = req.query;
  if (name){
    const findGames = await connection.query(
      `SELECT * FROM games WHERE (lower(name) LIKE '${name.toLowerCase()}%')`
    );
    return res.send(findGames.rows);
  } else{
    const findGames = await connection.query("SELECT * FROM games");
    return res.send(findGames.rows);
  }
  
});
app.post("/games", async (req, res) => {
  const { name, image, stockTotal, pricePerDay, categoryId } = req.body;
  const findCategories = await connection.query(
    `SELECT * FROM categories WHERE id=${categoryId}`
  );
  if (!name || stockTotal <= 0 || pricePerDay <= 0 || !findCategories.rows) {
    return res.sendStatus(400);
  }
  try {
    const findGames = await connection.query(
      `SELECT * FROM games WHERE name='${name}'`
    );
    if (findGames.rows.length === 0) {
     await connection.query(
        `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1,$2,$3,$4,$5)`,[name, image, stockTotal, categoryId, pricePerDay]);
      return res.sendStatus(201);
    } else {
      return res.sendStatus(409);
    }
  } catch {
    return res.sendStatus(500);
  }
});
app.get("/customers", async (req, res) => {
  const { cpf } = req.query;
  if (cpf){
    const findCostumers = await connection.query(
      `SELECT * FROM customers WHERE (cpf) LIKE '${cpf}%'`
    );
    return res.send(findCostumers.rows);
  } else{
    const findCostumers = await connection.query("SELECT * FROM customers");
    return res.send(findCostumers.rows);
  }
  
});
app.post("/customers", async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;
  if (!name || cpf.length !== 11 || phone.length < 10 || phone.length>12 ) {
    return res.sendStatus(400); 
  }
  try {
    const findCPF = await connection.query(
      `SELECT * FROM customers WHERE cpf='${cpf}';`
    );
    if (findCPF.rows.length === 0) {
      await connection.query(
        `INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4)`,[name, phone, cpf, birthday]
      );
      return res.sendStatus(201);
    } else {
      return res.sendStatus(409);
    }
  } catch {
    return res.sendStatus(500);
  }
});
app.get("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const findID = await connection.query(
    `SELECT * FROM customers WHERE id='${id}'`
  );
  if(findID.rows.length===0){
    return res.sendStatus(404);
  }
  return res.send(findID.rows);
  
});
app.listen(4000, () => {
  console.log("Server listening on port 4000.");
});
