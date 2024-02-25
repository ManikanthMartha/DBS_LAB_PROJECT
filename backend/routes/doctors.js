const express = require('express');

const doctorRouter = express.Router();

doctorRouter.route('/')
.get((req, res) => {
    res.send('get all doctor and doc id is'+req.Doctor_ID);
});

module.exports = doctorRouter;