import express from 'express';
import cors from 'cors';
import {restartGame} from '../logic/game.js';

const router = express.Router();

router.options('/', cors());
router.post('/', cors(), function(req, res) {
    const playerCodes = req.body;
    if (playerCodes.length <= 0 || playerCodes.length > 37) res.status(402).json({msg: "Only 1-37 players allowed"});
    const data = restartGame(playerCodes);
    if (data)
        res.status(200).json(data);
    else 
        res.sendStatus(500);
});

export default router;