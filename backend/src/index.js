require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


// Rutas principales
app.use('/auth', require('./routes/auth'));
app.use('/vehicles', require('./routes/vehicles'));
app.use('/users', require('./routes/users'));
app.use('/logs', require('./routes/logs'));

app.get('/', (req, res) => {
  res.send('Inventario Automotriz Backend funcionando');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
