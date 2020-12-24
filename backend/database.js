const mysql = require('mysql'),
    util = require('util');

function makeDb(config) {
    const connection = mysql.createConnection(config);
    return {
        query(sql, args) {
            return util.promisify(connection.query)
                .call(connection, sql, args);
        },
        close() {
            return util.promisify(connection.end).call(connection);
        }
    };
}

const db = makeDb({
    host: 'localhost',
    user: 'root',
    password: 'Long.21700',
    database: 'freelander'
});

module.exports = db;