// petit script pour Hasher un mot de passe via bcrypt sans passer par le reste de l'application

const bcrypt = require("bcrypt");

async function run() {
  const password = "password123";

  const hash = await bcrypt.hash(password, 10);

  console.log("Hash généré :");
  console.log(hash);
}

run();
