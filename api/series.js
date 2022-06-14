const express = require("express");
const sqlite3 = require("sqlite3");

const issues = require("./issues");

const router = express.Router();
const database = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

router.param("seriesId", (request, response, next, seriesId) => {
    database.get(`SELECT * FROM Series WHERE Series.id = $id`, { $id: seriesId }, (error, series) => {
        if (error) { return next(error); }
        if (series) {
            request.series = series;
            return next();
        }
        response.status(404).json({ message: "Series not found." });
    });
});

router.use("/:seriesId/issues", issues);

router.get("/", (request, response, next) => {
    database.all(`SELECT * FROM Series`, (error, series) => {
        if (error) { return next(error); }
        response.status(200).json({ series });
    });
});

router.get("/:seriesId", ({ series }, response, next) => {
    response.status(200).json({ series });
});

router.post("/", ({ body }, response, next) => {
    const { name, description } = body.series;
    if (!name || !description) { return response.status(400).json({ message: "Missing required fields." }); }
    const query = `INSERT INTO Series (name, description) VALUES ($name, $description)`;
    const values = { $name: name, $description: description };
    database.run(query, values, function (error) {
        if (error) { return next(error); }
        database.get(`SELECT * FROM Series WHERE Series.id = $id`, { $id: this.lastID }, (error, series) => {
            if (error) { return next(error); }
            response.status(201).json({ series });
        });
    });
});

router.put("/:seriesId", ({ body, series }, response, next) => {
    const { name, description } = body.series;
    const { id } = series;
    if (!name || !description) { return response.status(400).json({ message: "Missing required fields." }); }
    const query = `UPDATE Series SET name = $name, description = $description WHERE Series.id = $id`;
    const values = { $name: name, $description: description, $id: id };
    database.run(query, values, function (error) {
        if (error) { return next(error); }
        database.get(`SELECT * FROM Series WHERE Series.id = $id`, { $id: id }, (error, series) => {
            if (error) { return next(error); }
            response.status(200).json({ series });
        });
    });
});

router.delete("/:seriesId", ({ series }, response, next) => {
    const { id } = series;
    database.all(`SELECT * FROM Issue WHERE Issue.series_id = $id`, { $id: id  }, (error, issues) => {
        if (error) { return next(error); }
        if (issues.length) { return response.status(400).json({ message: "Cannot delete series with issues." }); }
        database.run(`DELETE FROM Series WHERE Series.id = $id`, { $id: id }, function (error) {
            if (error) { return next(error); }
            response.status(204).end();
        });
    });
});

module.exports = router;