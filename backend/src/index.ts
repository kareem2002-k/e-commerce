import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (_req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
