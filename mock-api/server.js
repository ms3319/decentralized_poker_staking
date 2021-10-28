const  mysql = require("mysql2/promise");

const insertIntoDB = async() => {
    const connection = await mysql.createConnection({
        host: "sql4.freesqldatabase.com",
        user: "sql4447512",
        password: "idmnIvWM1D",
        database: "sql4447512",
        port: 3306,
    })

    try {
        await connection.query(
            "INSERT INTO basketball (player_name, team_name) VALUES ('Lebron James', 'Lakers')"
        )

        console.log("inserted")
    } catch (e) {
        console.log(e)
    }
};

insertIntoDB();