import http from 'http';
import express from 'express';

import router from './routes/game.js';

const app = express();
app.use(express.json());

app.use('/game', router)

const server = http.createServer(app);
const port = 5000;
server.listen(port);
console.debug('Server listening on port ' + port);