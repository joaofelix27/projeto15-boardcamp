import connection from '../db/postgres.js'
import dayjs from "dayjs";

export async function getRentals (req, res) {
  const { customerId, gameId } = req.query;
  let findRentals = [];
  if (customerId && gameId) {
    findRentals = await connection.query(
      `SELECT * FROM rentals WHERE "customerId"='${customerId}' AND "gameId"='${gameId}'`
    );
  } else if (customerId) {
    findRentals = await connection.query(
      `SELECT * FROM rentals WHERE "customerId"='${customerId}'`
    );
  } else if (gameId) {
    findRentals = await connection.query(
      `SELECT * FROM rentals WHERE "gameId"='${gameId}'`
    );
  } else {
    findRentals = await connection.query(`SELECT * FROM rentals`);
  }
  if (findRentals.rows.length === 0) {
    return res.sendStatus(404);
  }
  const arr = [];
  let newObj = {};
  try {
    findRentals.rows.map(async (rental) => {
      const findCustomers = await connection.query(
        `SELECT * FROM customers WHERE id='${rental.customerId}'`
      );
      const findGames = await connection.query(
        `SELECT * FROM games WHERE id='${rental.gameId}'`
      );
      const findCategoryName = await connection.query(
        `SELECT * FROM categories WHERE id='${findGames.rows[0].categoryId}'`
      );
      delete findCustomers.rows[0].cpf;
      delete findCustomers.rows[0].birthday;
      delete findCustomers.rows[0].phone;
      delete findGames.rows[0].stockTotal;
      delete findGames.rows[0].pricePerDay;
      delete findCategoryName.rows[0].id;
      newObj = {
        ...rental,
        game: {
          ...findGames.rows[0],
          categoryName: findCategoryName.rows[0].name,
        },
        customer: findCustomers.rows[0],
      };
      arr.push(newObj);
      if (arr.length === findRentals.rows.length) {
        return res.send(arr);
      }
    });
  } catch {
    return res.sendStatus(500);
  }
}
export async function postRentals (req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = dayjs(Date.now()).format("YYYY-MM-DD");
  const returnDate = null;
  const delayFee = null;
  const findCustomers = await connection.query(
    `SELECT * FROM customers WHERE id='${customerId}'`
  );
  const findGames = await connection.query(
    `SELECT * FROM games WHERE id='${gameId}'`
  );
  const customer = findCustomers.rows[0];
  const game = findGames.rows[0];
  if (!customer || !game || daysRented <= 0) {
    return res.sendStatus(400);
  }
  const stock = game.stockTotal;
  if (stock <= 0) {
    return res.sendStatus(400);
  }
  const originalPrice = daysRented * game.pricePerDay;
  try {
    await connection.query(
      `INSERT INTO rentals ("customerId","gameId","rentDate","daysRented","returnDate","originalPrice","delayFee") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
      ]
    );
    await connection.query(
      `UPDATE games set "stockTotal"='${stock - 1}'  WHERE id= ${gameId}`
    );
    return res.sendStatus(201);
  } catch {
    return res.sendStatus(500);
  }
}
export async function returnRentals (req, res) {
  const { id } = req.params;
  const findRentals = await connection.query(
    `SELECT * FROM rentals WHERE  id= ${id}`
  );
  if (!findRentals.rows[0]) {
    return res.sendStatus(404);
  } else if (findRentals.rows[0].returnDate !== null) {
    return res.sendStatus(400);
  }
  let delayFee = 0;
  const returnDateDay = dayjs(Date.now()).format("YYYY-MM-DD");
  const returnDate = Date.now();
  const { daysRented, game } = findRentals.rows[0];
  const findGames = await connection.query(
    `SELECT * FROM games WHERE  id= ${id}`
  );
  const rentDate = Date.parse(findRentals.rows[0].rentDate);
  const daysSinceRented = dayjs(returnDate - rentDate).format("D") - 1;
  const daysLeftToReturn = daysRented - daysSinceRented;
  if (daysLeftToReturn < 0) {
    delayFee = Math.abs(daysLeftToReturn) * findGames.rows[0].pricePerDay;
  }
  // const delayFeeCurrency=delayFee.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}).replace()
  await connection.query(
    `UPDATE rentals set "returnDate"='${returnDateDay}',"delayFee"=${delayFee}  WHERE id= ${id}`
  );
  res.sendStatus(200);
}
export async function deleteRentals (req, res) {
  const { id } = req.params;
  try {
    const findRentalID = await connection.query(
      `SELECT * FROM rentals WHERE id=${id}`
    );
    if (!findRentalID.rows[0]) {
      return res.sendStatus(404);
    }
    if (findRentalID.rows[0].returnDate === null) {
      const deleteRental = await connection.query(
        `DELETE FROM rentals WHERE id=${id};`
      );
      return res.sendStatus(200);
    }
    res.sendStatus(400);
  } catch {
    res.sendStatus(500);
  }
}