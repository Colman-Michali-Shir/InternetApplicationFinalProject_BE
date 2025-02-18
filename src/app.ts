import { createExpress } from './createExpress';

const main = async () => {
  const app = await createExpress();
  const port = process.env.PORT;

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
};

main();
