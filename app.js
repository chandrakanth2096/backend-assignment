const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "users.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET ALL USER DETAILS

app.get("/", async (request, response) => {
  const getAllUsers = `SELECT * FROM user ORDER BY id;`;
  const allUserDetails = await db.all(getAllUsers);
  response.send(allUserDetails);
});

// GET --->  /api/users PATH Parameters API Call

app.get("/api/users", async (request, response) => {
  const { page, limit, name = "", sort } = request.query;
  const set_limit = limit >= 1 ? limit : 5;
  const sub_string = sort[0] === "-" ? sort.slice(1) : sort;
  const order = sort[0] === "-" ? "DESC" : "ASC";
  const getUsersData = `
    SELECT
        *
    FROM
        user
    WHERE
        (first_name LIKE '%${name}%') OR (last_name LIKE '%${name}%')
    ORDER BY
        id, ${sub_string} ${order}
    LIMIT ${set_limit} OFFSET ${page};`;
  const dbResult = await db.all(getUsersData);
  response.send(dbResult);
});

// POST Another USER in USER Table

app.post("/api/users", async (request, response) => {
  const {
    id,
    first_name,
    last_name,
    company_name,
    city,
    state,
    zip,
    email,
    web,
    age,
  } = request.body;
  const postUserDetailsQuery = `
    INSERT INTO
        user(id, first_name, last_name, company_name, city, state, zip, email, web, age)
    VALUES
        (${id}, '${first_name}', '${last_name}', '${company_name}', '${city}', '${state}', ${zip}, '${email}', '${web}', ${age});`;
  const dbResult = await db.run(postUserDetailsQuery);
  const userId = dbResult.lastID;
  response.send(`User ID: ${userId} Successfully Added`);
});

// GET Unique USER Details

app.get("/api/users/:id", async (request, response) => {
  const { id } = request.params;
  const getUniqueUserQuery = `SELECT * FROM user WHERE id = ${id};`;
  const uniqueUser = await db.get(getUniqueUserQuery);
  response.send(uniqueUser);
});

// PUT ---> Update unique user data

app.put("/api/users/:id", async (request, response) => {
  const { id } = request.params;
  const { first_name, last_name, age } = request.body;

  const updateUserQuery = `
    UPDATE
        user
    SET
        first_name = '${first_name}',
        last_name = '${last_name}',
        age = ${age}
    WHERE
        id = ${id};`;
  await db.run(updateUserQuery);
  response.send("User Details Updated");
});

// DELETE Unique User

app.delete("/api/users/:id", async (request, response) => {
  const { id } = request.params;
  const deleteUserQuery = `DELETE FROM user WHERE id = ${id};`;
  await db.run(deleteUserQuery);
  response.send("User Deleted");
});


module.export = app;
