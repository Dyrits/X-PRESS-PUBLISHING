const express = require("express");

const router = express.Router();

router.use("/artists", require("./artists"));
router.use("/series", require("./series"));

module.exports = router;