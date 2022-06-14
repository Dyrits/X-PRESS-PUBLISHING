const express = require("express");
const sqlite3 = require("sqlite3");

const router = express.Router({ mergeParams: true });
const database = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

router.param("issueId", (request, response, next, issueId) => {
    database.get(`SELECT * FROM Issue WHERE Issue.id = $id`, { $id: issueId }, (error, issue) => {
        if (error) { return next(error); }
        if (issue) {
            request.issue = issue;
            return next();
        }
        response.status(404).json({ message: "Issue not found." });
    });
});

router.get("/", ({ params }, response, next) => {
    database.all(`SELECT * FROM Issue WHERE Issue.series_id = $id`, { $id: params.seriesId  }, (error, issues) => {
        if (error) { return next(error); }
        response.status(200).json({ issues });
    });
});

router.post("/", ({ body, params }, response, next) => {
    const { name, issueNumber, publicationDate, artistId } = body.issue;
    if (!name || !issueNumber || !publicationDate || !artistId) { return response.status(400).json({ message: "Missing required fields." }); }
    const query = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`;
    const values = { $name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $seriesId: params.seriesId };
    database.run(query, values, function (error) {
        if (error) { return next(error); }
        database.get(`SELECT * FROM Issue WHERE Issue.id = $id`, { $id: this.lastID }, (error, issue) => {
            if (error) { return next(error); }
            response.status(201).json({ issue });
        });
    });
});

router.put("/:issueId", ({ body, issue }, response, next) => {
    const { name, issueNumber, publicationDate, artistId } = body.issue;
    const { id } = issue;
    if (!name || !issueNumber || !publicationDate || !artistId) { return response.status(400).json({ message: "Missing required fields." }); }
    database.get(`SELECT * FROM Artist WHERE Artist.id = $id`, { $id: artistId }, (error, artist) => { if (error) { return next(error); } });
    const query = `UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id = $id`;
    const values = { $name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $id: id };
    database.run(query, values, function (error) {
        if (error) { return next(error); }
        database.get(`SELECT * FROM Issue WHERE Issue.id = $id`, { $id: id }, (error, issue) => {
            if (error) { return next(error); }
            response.status(200).json({ issue });
        });
    });
});

router.delete("/:issueId", ({ issue }, response, next) => {
    const { id } = issue;
    database.run(`DELETE FROM Issue WHERE Issue.id = $id`, { $id: id }, function (error) {
        if (error) { return next(error); }
        response.status(204).json({ message: "Issue deleted." });
    });
});

module.exports = router;