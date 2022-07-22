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
      `SELECT * FROM games WHERE name='${name}'`
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
        `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ('${name}', '${image}', ${stockTotal}, ${categoryId}, ${pricePerDay});`
      );
      return res.sendStatus(201);
    } else {
      return res.sendStatus(409);
    }
  } catch {
    return res.sendStatus(500);
  }
});

app.listen(4000, () => {
  console.log("Server listening on port 4000.");
});
