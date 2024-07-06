import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
  return response.json("OK");
});

app.listen(5050, () => console.log("Servidor inicializado na porta 5050"));

// 1 - Crie um Endpoint para Criar veículo
// -> Seu carro deve ter os seguintes dados : modelo, marca,
// ano, cor e preço.
// -> O veículo deve ser adicionado na lista de veículos que
// armazena todos os veículos cadastrados
// -> Todo veículo deve ter um identificador único. Este
// identificador deve ser gerado de forma automática

const vehicles = [];

// ----------------------- CRIAR VEICULOS -------------------------

app.post("/cars", (request, response) => {
  const { model, brand, year, color, price } = request.body;

  if (!model || !brand || !year || !color || !price) {
    return response
      .status(404)
      .json({ message: "O preencimento de todos os campos são obrigatórios" });
  }

  const newCar = {
    id: vehicles.length + 1,
    model,
    brand,
    year,
    color,
    price,
  };

  vehicles.push(newCar);

  response
    .status(201)
    .json({ message: "Veículo criado com sucesso.", car: newCar });
});

// ----------------------- LISTAR VEICULOS -------------------------

// 2 - Crie um Endpoint o para ler todos os veículos
// ->O sistema deve listar os veículos com o seguinte layout:
// ID: 1 | Modelo: Civic| Marca: Honda | Ano: 2014/2015 | Cor: Azul |
// Preço: R$40.000
// ID: 1 | Modelo: Civic| Marca: Honda | Ano: 2014/2015 | Cor: Azul |
// Preço: R$40.000

app.get("/cars", (request, response) => {
  if (vehicles.length === 0) {
    return response.status(404).json({ message: "Nenhum veículo encontrado" });
  }

  response.status(200).json(vehicles);
});

// ----------------------- FILTRAR VEICULOS -------------------------

// 3 - Crie um Endpoint filtrar veículos por marca
// -> O sistema deve pedir para o usuário digitar a marca que
// quer filtrar
// -> Deve ser listado os veículos que forem da mesma marca
// -> A lista deve ter o seguinte layout:
// ID: 1 | Modelo: Civic| Cor: Azul | Preço: R$40.000

app.get("/cars/:brand", (request, response) => {
  const desiredBrand = request.params.brand;

  const filteredVehicles = vehicles.filter((car) => car.brand === desiredBrand);

  if (!filteredVehicles) {
    return response
      .status(404)
      .json({ message: "Marca de veículo não encontrada" });
  }

  response.status(200).json({
    message: "Veiculos filtrados com sucesso",
    vehicles: filteredVehicles,
  });
});

// ----------------------- ATUALIZAR VEICULO -------------------------

// 4 - Crie um Endpoint para Atualizar veículo
// -> O usuário deve digitar o IDENTIFICADOR do veículo
// -> O Sistema deve verificar se o veículo existe ou não e
// mostrar a seguinte mensagem caso o veículo não exista:
// "Veículo, não encontrado. O usuário deve voltar para o menu
// inicial depois"
// -> Se o veículo existir, o sistema deve permitir que o usuário
// atualize somente a cor e o preço.

app.put("/cars/:id", (request, response) => {
  const { id } = request.params;

  const { color, price } = request.body;

  if (!color || !price) {
    return response
      .status(400)
      .json({ message: "Cor e preço são obrigatórios" });
  }

  const findVehicles = vehicles.find((car) => car.id === parseInt(id));

  if (!findVehicles) {
    return response.status(404).json({ message: "Veículo não encontrado" });
  }

  findVehicles.color = color;
  findVehicles.price = price;

  response.status(200).json({
    message: "Veículo atualizado com sucesso",
    foundCar: findVehicles,
  });
});

// ----------------------- DELETAR VEICULO -------------------------

// 5 - Crie um Endpoint Remover veículo
// ->O usuário digitar o IDENTIFICADOR do veículo
// -> O Sistema deve verificar se o veículo existe ou não e
// mostrar a seguinte mensagem caso o veículo não exista:
// "Veículo, não encontrado. O usuário deve voltar para o menu
// inicial depois"
// -> Se o veículo existir, o sistema deve remover o veículo

app.delete("/cars/:id", (request, response) => {
  const { id } = request.params;

  const findIndexVehicle = vehicles.findIndex((car) => car.id === parseInt(id));

  if (findIndexVehicle === -1) {
    return response.status(404).json({ message: "Veículo não encontrado" });
  }

  const [deletedVehicle] = vehicles.splice(findIndexVehicle, 1);

  response
    .status(200)
    .json({ message: "Veículo removido com sucesso", vehicle: deletedVehicle });
});

// ----------------------- CRIAR USUARIO -------------------------

// 6 - Crie um Endpoint Criar uma pessoa usuária
// -> Deve conter as seguintes informações : Nome , email ,
// senha
// -> Verificar se está sendo passado os dados ;
// -> A senha deve ser criptografada utilizando o bcrypt ;
// -> Exibir a mensagem "Usuário criado com sucesso"

const adminUser = [];

app.post("/signup", async (request, response) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return response
        .status(400)
        .json({ message: "É obrigatório o preenchimento de todos os campos" });
    }

    const existingUser = adminUser.find((user) => user.name === name);

    if (existingUser) {
      return response.status(400).json({ message: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
    };

    adminUser.push(newUser);

    response
      .status(201)
      .json({ message: "Usuario cadastrado com sucesso", user: newUser });
  } catch (error) {
    response.status(500).json({ message: "Erro ao cadastrar usuario" });
  }
});

// ----------------------- LOGIN -------------------------

// 7 - Crie um Endpoint logar uma pessoa usuária

// ->Login deve ser feito usando email e senha ;
// -> Fazer as verificações caso a pessoa usuária não colocar os
// dados;
// -> A senha precisa ser comparada com a criptografada e se
// forem iguais, logar no sistema.

app.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response
        .status(400)
        .json({ message: "Os campos e-mail e senha são obrigatórios" });
    }

    const user = adminUser.find((user) => user.email === email);

    if (!user) {
      return response.status(404).json({ message: "Usuário não encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return response.status(400).json({ message: "Senha incorreta" });
    }

    response.status(200).json({ message: "Login realizado com sucesso" });
  } catch (error) {
    response.status(500).json({ message: "Erro ao fazer login" });
  }
});
