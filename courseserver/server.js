import app from "./app.js";

import { connection } from "./config/database.js";

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log(`server is working on port: ${process.env.PORT}`);
  } catch (error) {
    console.log(error);
  }
});
