const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  return res.json({ hello: "world" });
});

app.get("/accounts", (req, res) => {
  return res.status(200).json(customers);
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
    return res
      .status(422)
      .send({ message: "Já existe uma conta para este CPF" });
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

app.get("/statements/:cpf", (req, res) => {
  const { cpf } = req.params;

  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    return res.status(404).json({ message: "Customer não encontrado" });
  }

  return res.json(customer.statement);
});

app.listen(3000, () => console.log("API Running..."));
