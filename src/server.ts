import "dotenv/config";

const port = Number(process.env.PORT ?? 4000);

import app from "./index.js";

app.listen(port, () => {
  console.log(`Library reservation API listening on port ${port}`);
});