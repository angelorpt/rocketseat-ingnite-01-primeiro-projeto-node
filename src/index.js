const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

app.use(cors());
app.use(express.json());

// middlewares
const verifyIfExistsAccountCPF = (req, res, next) => {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    return res.status(404).json({ message: "Customer não encontrado" });
  }
  req.customer = customer;
  return next();
};

app.get("/", (_, res) => {
  return res.json({ hello: "world" });
});

app.get("/accounts", (req, res) => {
  return res.status(200).json(customers);
});

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

app.get("/statements", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    type: "CREDIT",
    created_at: new Date(),
  };

  try {
    customer.statement.push(statementOperation);
    return res.status(201).json({ message: "Operação realizada com sucesso" });
  } catch (error) {
    return res.status(422).json({ message: "Falha ao realizar a operação" });
  }
});

app.listen(3001, () => console.log("API Running..."));
