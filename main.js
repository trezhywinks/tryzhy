const express = require('express');
const cors = require('cors');
const app = express();
const port = "9595";

app.use(cors());
app.use(express.static('./server'));

app.listen(port, () => {
console.log('http://localhost:9595')
})
