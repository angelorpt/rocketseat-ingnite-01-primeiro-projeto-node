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

app.get("/accounts", (req, res) => {
  res.status(200).json(customers);
});

/**
 * cpf string
 * name string
 * id uuid
 * statement []
 */
app.post("/accounts", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    res.status(422).send({ message: "Já existe uma conta para este CPF" });
    return;
  }

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
