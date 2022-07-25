import connection from '../db/postgres.js'


// CATEGORIES
export async function getCategories (req, res) {
    const categories = await connection.query("SELECT * FROM categories");
    res.send(categories.rows);
  }
export async function postCategories (req, res) {
    const { name } = req.body;
    if (!name) {
      return res.sendStatus(400);
    }
    try {
      const findCategories = await connection.query(
        `SELECT * FROM categories WHERE name='${name}'`
      );
      if (findCategories.rows.length === 0) {
        await connection.query("INSERT INTO categories (name) VALUES ($1)", [
          name,
        ]);
        return res.sendStatus(201);
      } else {
        return res.sendStatus(409);
      }
    } catch {
      return res.sendStatus(500);
    }
  }