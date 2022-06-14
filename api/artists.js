const express = require("express");
const sqlite3 = require("sqlite3");

const router = express.Router();
const database = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

router.param("artistId", (request, response, next, artistId) => {
    database.get(`SELECT * FROM Artist WHERE Artist.id = $id`, { $id: artistId }, (error, artist) => {
        if (error) { return next(error); }
        if (artist) {
            request.artist = artist;
            return next();
        }
        response.status(404).json({ message: "Artist not found." });
    });
});

router.get("/", (request, response, next) => {
    database.all(`SELECT * FROM Artist WHERE Artist.is_currently_employed = 1`, (error, artists) => {
        if (error) { return next(error); }
        response.status(200).json({ artists });
    });
});

router.get("/:artistId", ({ artist }, response, next) => {
    response.status(200).json({ artist });
});

router.post("/", ({ body }, response, next) => {
    const { name, dateOfBirth, biography } = body.artist;
    if (!name || !dateOfBirth || !biography) { return response.status(400).json({ message: "Missing required fields." }); }
    const isCurrentlyEmployed = body.artist.isCurrentlyEmployed || 1;
    const query = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`;
    const values = { $name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed };
    database.run(query, values, function (error) {
        if (error) { return next(error); }
        database.get(`SELECT * FROM Artist WHERE Artist.id = $id`, { $id: this.lastID }, (error, artist) => {
            if (error) { return next(error); }
            response.status(201).json({ artist });
        });
    });
});

router.put("/:artistId", ({ body, artist }, response, next) => {
    const { name, dateOfBirth, biography, isCurrentlyEmployed } = body.artist;
    const { id } = artist;
    if (!name || !dateOfBirth || !biography) { return response.status(400).json({ message: "Missing required fields." }); }
    const query = `UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $id`;
    const values = { $name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed, $id: id };
    database.run(query, values, function (error) {
        if (error) { return next(error); }
        database.get(`SELECT * FROM Artist WHERE Artist.id = $id`, { $id: id }, (error, artist) => {
            if (error) { return next(error); }
            response.status(200).json({ artist });
        });
    });
});

router.delete("/:artistId", ({ artist }, response, next) => {
    const { id } = artist;
    const query = `UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $id`;
    const values = { $id: id };
    database.run(query, values, function (error) {
        if (error) { return next(error); }
        database.get(`SELECT * FROM Artist WHERE Artist.id = $id`, { $id: id }, (error, artist) => {
            if (error) { return next(error); }
            response.status(200).json({ artist });
        });
    });
});

module.exports = router;