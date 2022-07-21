import express from "express";
import connection from "./db/postgres.js";

const app = express();
app.use(express.json());

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
    console.log(findCategories.rows)
    if (findCategories.rows.length===0) {
      connection.query('INSERT INTO categories (name) VALUES ($1)',[name]);
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
