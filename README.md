# X-Press Publishing

An internal tool for a comic book publishing company, with an Express API and a SQLite database, a Codecademy capstone project.

## About The Project

The X-Press Publishing internal tool allows users to:

- Create, view, and update artists
- Create, view, update, and delete comic book series
- Create, view, update, and delete issues of a specific comic book series

The Express app is exported from the root-level `server.js`, listens on `process.env.PORT` (default 4000), and uses the root-level `database.sqlite` as its database. A test suite (mocha) and a seed script (`seed.js`) are included.

The original assignment text is preserved in [ASSIGNMENT.md](ASSIGNMENT.md).

### Course

Codecademy - Web Development Skill Path, Building a Persistent API (capstone project)

### Built With

- Node.js
- Express
- SQLite
- React (provided front end)
- Mocha (tests)

## Getting Started

### Prerequisites

- Node.js
- pnpm (a pnpm lockfile is included) or npm

### Installation

```sh
pnpm install
```

### Running the tests

```sh
pnpm test
```

### Seeding the database

```sh
node seed.js
```

To view the local version of the site, open `index.html` in a browser.

## License

ISC is declared in `package.json`; no license file is present in this repository.
