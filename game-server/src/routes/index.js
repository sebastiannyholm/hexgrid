import express from 'express';
const router = express.Router();

router.post('/', function(req, res) {
    // res.status(200).json(data);
    res.send({response: " aliiive"}).status(200);
});

export default router;