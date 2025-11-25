const bcrypt = require("bcrypt");

bcrypt.compare("123", "$2b$10$GWI708acEGPCugJRVvlH0etPWkNGXdFWIvkJL/0C1Yx3jfYRN3RPG")
  .then(res => console.log(res))
  .catch(err => console.error(err));