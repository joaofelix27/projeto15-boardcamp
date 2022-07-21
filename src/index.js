import express from "express";
import connection from "./db/postgres.js";

const app = express();
app.use(express.json());

app.get('/categories', (req, res) => {
    connection.query('SELECT * FROM categories').then(categorie => {
        console.log(categorie.rows)
      res.send(categorie.rows);
    });
  });

app.listen(4000, () => {
    console.log('Server listening on port 4000.');
  });