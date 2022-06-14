const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(errorHandler());
app.use(morgan("dev"));

app.use("/api", require("./api/api"));

app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
});

module.exports = app;

