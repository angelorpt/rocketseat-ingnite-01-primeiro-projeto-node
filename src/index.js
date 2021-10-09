const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

/**
 * cpf string
 * name string
 * id uuid
 * statement []
 */
app.post("/accounts", (req, res) => {
  const { cpf, name } = req.body;
  const id = uuidv4();
  const customer = {
    id,
    cpf,
    name,
    statement: [],
  };
  customers.push(customer);

  return res.status(201).send(customer);
});

app.listen(3000, () => console.log("API Running..."));
