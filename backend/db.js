const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db-internal', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword', 
    database: process.env.DB_NAME || 'gestorgastos',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function verificarConexion() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('⏳ MySQL no está listo aún. Reintentando en 5 segundos...');
            setTimeout(verificarConexion, 5000); 
        } else {
            console.log('✅ Conectado exitosamente a MySQL dentro de la red de Docker Swarm');
            connection.release(); 
        }
    });
}

verificarConexion();


module.exports = pool.promise();