const { Client } = require('pg');

require('dotenv').config();

const db = new Client({
    connectionString: process.env.REACT_APP_POSTGRESQL_DATABASE_URL,
    host: process.env.REACT_APP_POSTGRESQL_HOST,
    database: process.env.REACT_APP_POSTGRESQL_DATABASE,
    user: process.env.REACT_APP_POSTGRESQL_USER,
    password: process.env.REACT_APP_POSTGRESQL_PASSWORD,
    port: process.env.REACT_APP_POSTGRESQL_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect();

// const dbCreation = async () => {
//     try {
//         const category = await db.query(`
//        CREATE TABLE IF NOT EXISTS userskills (
//   user_id VARCHAR(255) NOT NULL,
//   keyword VARCHAR(255) NOT NULL,
//   PRIMARY KEY (user_id, keyword),
//     FOREIGN KEY (user_id)
//     REFERENCES users (user_id)
//     ON DELETE CASCADE
//     ON UPDATE CASCADE,
//     FOREIGN KEY (keyword)
//     REFERENCES keyword (keyword)
//     ON DELETE CASCADE
//     ON UPDATE CASCADE)
//         `)
//         console.log(category);
//     } catch (err) {
//         console.log(err);
//     }
// }

// dbCreation();

module.exports = db;