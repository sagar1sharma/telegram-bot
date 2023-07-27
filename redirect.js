import express from 'express';
const app = express();

app.get('/download/:magnet', (req, res) => {
  const magnet = req.params.magnet;
  res.redirect(`magnet`);
});

app.listen(3001, () => {
  console.log(`Server is running on port ${port}`);
});
