import connection from "../db/postgres.js";

export async function getGames (req, res) {
    const { name } = req.query;
    if (name) {
      const findGames = await connection.query(
        `SELECT * FROM games WHERE (lower(name) LIKE '${name.toLowerCase()}%')`
      );
      return res.send(findGames.rows);
    } else {
      const findGames = await connection.query("SELECT * FROM games");
      return res.send(findGames.rows);
    }
  }
  export async function postGames (req, res) {
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
          `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1,$2,$3,$4,$5)`,
          [name, image, stockTotal, categoryId, pricePerDay]
        );
        return res.sendStatus(201);
      } else {
        return res.sendStatus(409);
      }
    } catch {
      return res.sendStatus(500);
    }
  }