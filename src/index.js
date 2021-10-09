const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const CREDIT = "CREDIT";
const DEBIT = "DEBIT";

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

const getBalance = (statements) => {
  const balance = statements.reduce((total, operation) => {
    if (operation.type === CREDIT) {
      return total + operation.amount;
    } else {
      return total - operation.amount;
    }
  }, 0);

  return balance;
};

// routes
app.get("/", (_, res) => {
  return res.json({ hello: "world" });
});

app.get("/accounts/all", (req, res) => {
  return res.status(200).json(customers);
});

app.get("/accounts", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.status(200).json(customer);
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

app.put("/accounts", verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(200).send(customer);
});

app.delete("/accounts", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;

  // splice
  customers.splice(customer, 1);

  return res.status(200).json({ message: "Customer deletado com sucesso" });
});

app.get("/statements", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer.statement);
});

app.get("/statements/date", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statements = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return res.json(statements);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    type: CREDIT,
    created_at: new Date(),
  };

  try {
    customer.statement.push(statementOperation);
    return res.status(201).json({ message: "Crédito realizado com sucesso" });
  } catch (error) {
    return res.status(422).json({ message: "Falha ao realizar o crédito" });
  }
});

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);
  if (balance < amount) {
    return res.status(400).json({ error: "Saldo insuficiente" });
  }

  const statementOperation = {
    amount,
    type: DEBIT,
    created_at: new Date(),
  };

  try {
    customer.statement.push(statementOperation);
    return res.status(201).json({ message: "Saque realizado com sucesso" });
  } catch (error) {
    return res.status(422).json({ message: "Falha ao realizar o saque" });
  }
});

app.get("/balance", verifyIfExistsAccountCPF, (req, res) => {
  const { customer } = req;
  const balance = getBalance(customer.statement);
  return res.status(200).json({ balance: balance });
});

// Sobe o Servidor na Porta 3000
app.listen(3000, () => console.log("API Running..."));
