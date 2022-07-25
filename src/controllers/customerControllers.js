import connection from "../db/postgres.js";
import joi from "joi";

export async function getCustomer (req, res){
    const { cpf } = req.query;
    if (cpf) {
      const findCostumers = await connection.query(
        `SELECT * FROM customers WHERE (cpf) LIKE '${cpf}%'`
      );
      return res.send(findCostumers.rows);
    } else {
      const findCostumers = await connection.query("SELECT * FROM customers");
      return res.send(findCostumers.rows);
    }
  }
export async function postCustomer (req,res) {
    const { name, phone, cpf, birthday } = req.body;
    const newObj= {...req.body, birthday:birthday.replace(/[-]/g,"/")}
    const userSchema = joi.object({
      name:joi.string().required(),
      phone:joi.string().required(),
      birthday: joi.string().pattern(
        /^(?:(?:1[6-9]|[2-9]\d)?\d{2})(?:(?:(\/|-|\.)(?:0?[13578]|1[02])\1(?:31))|(?:(\/|-|\.)(?:0?[13-9]|1[0-2])\2(?:29|30)))$|^(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\/|-|\.)0?2\3(?:29)$|^(?:(?:1[6-9]|[2-9]\d)?\d{2})(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:0?[1-9]|1\d|2[0-8])$/
      ).required(),
      cpf:joi.string().required()
    });
    const validation = userSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
      return res.sendStatus(400);
    }
    if (!name || cpf.length !== 11 || phone.length < 10 || phone.length > 12) {
      return res.sendStatus(400);
    }
    try {
      const findCPF = await connection.query(
        `SELECT * FROM customers WHERE cpf='${cpf}';`
      );
      if (findCPF.rows.length === 0) {
        await connection.query(
          `INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4)`,
          [name, phone, cpf, birthday]
        );
        return res.sendStatus(201);
      } else {
        return res.sendStatus(409);
      }
    } catch {
      return res.sendStatus(500);
    }
  }
  export async function getCustomerById (req,res) {
    const { id } = req.params;
    const findID = await connection.query(
      `SELECT * FROM customers WHERE id='${id}'`
    );
    if (findID.rows.length === 0) {
      return res.sendStatus(404);
    }
    return res.send(findID.rows);
  }
  export async function putCustomer (req,res) {
    const { id } = req.params;
    const userSchema = joi.object({
      name:joi.string().required(),
      phone:joi.string().required(),
      birthday: joi.string().pattern(
        /^(?:(?:1[6-9]|[2-9]\d)?\d{2})(?:(?:(\/|-|\.)(?:0?[13578]|1[02])\1(?:31))|(?:(\/|-|\.)(?:0?[13-9]|1[0-2])\2(?:29|30)))$|^(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\/|-|\.)0?2\3(?:29)$|^(?:(?:1[6-9]|[2-9]\d)?\d{2})(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:0?[1-9]|1\d|2[0-8])$/
      ).required(),
      cpf:joi.string().required()
    });
    const validation = userSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
      return res.sendStatus(400);
    }
    const { cpf, phone, name, birthday } = req.body;
    if (!name || cpf.length !== 11 || phone.length < 10 || phone.length > 12) {
      return res.sendStatus(400);
    }
    try {
      const findCPF = await connection.query(
        `SELECT * FROM customers WHERE cpf='${cpf}';`
      );
      if (findCPF.rows.length === 0) {
        await connection.query(
          `UPDATE customers set name='${name}', phone='${phone}',cpf='${cpf}',birthday='${birthday}'  WHERE id= ${id}`
        );
        return res.sendStatus(201);
      } else {
        return res.sendStatus(409);
      }
    } catch {
      return res.sendStatus(500);
    }
  }