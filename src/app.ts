import { createExpress } from './createExpress';
import https from "https"
import fs from "fs"

const main = async () => {
  const app = await createExpress();
  const port = process.env.PORT;
  const domain = process.env.DOMAIN_BASE

  if(process.env.NODE_ENV != "production"){
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  } else {
    const certs = {
      key: fs.readFileSync("../client-key.pem"),
      cert: fs.readFileSync("../client-cert.pem")
    }
    https.createServer(certs, app).listen(port, () => {console.log(`App listening at ${domain}:${port}`);})
  }

};

main();
