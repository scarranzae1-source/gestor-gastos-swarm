const express = require('express');
const cors = require('cors');
const conexion = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));


app.use((req, res, next) => {
    const replicaId = process.env.HOSTNAME || "Localhost-Desarrollo";
    console.log(`[BALANCEADOR] Petición ${req.method} en ${req.url} -> Atendida por Réplica ID: ${replicaId}`);
    next();
});

app.get('/', (req, res) => {
    const replicaId = process.env.HOSTNAME || "Localhost-Desarrollo";
    res.send(`Backend funcionando correctamente. Atendido por réplica: ${replicaId}`);
});

// USUARIOS
app.get('/usuarios', (req, res) => {
    conexion.query('SELECT * FROM usuarios', (error, resultados) => {
        if (error) {
            return res.status(500).json(error);
        }
        res.json(resultados);
    });
});

// REGISTRO
app.post('/registro', (req, res) => {
    const { nombre, correo, password } = req.body;

    const sql = `
        INSERT INTO usuarios(nombre, correo, password)
        VALUES (?, ?, ?)
    `;

    conexion.query(sql, [nombre, correo, password], (error) => {
        if (error) {
            console.error("ERROR REGISTRO:", error);
            return res.status(500).json({ fatal: true, error });
        }
        res.json({ mensaje: 'Usuario registrado correctamente' });
    });
});

// MOVIMIENTOS
app.get('/movimientos', (req, res) => {
    conexion.query('SELECT * FROM movimientos', (error, resultados) => {
        if (error) return res.status(500).json(error);
        res.json(resultados);
    });
});

app.post('/movimientos', (req, res) => {
    const { usuario_id, tipo, categoria, descripcion, monto } = req.body;

    conexion.query(
        'INSERT INTO movimientos (usuario_id, tipo, categoria, descripcion, monto) VALUES (?, ?, ?, ?, ?)',
        [usuario_id, tipo, categoria, descripcion, monto],
        (error) => {
            if (error) return res.status(500).json(error);
            res.json({ mensaje: 'Movimiento registrado' });
        }
    );
});

// BALANCE
app.get('/balance', (req, res) => {
    const sql = `
        SELECT COALESCE(
            SUM(CASE WHEN tipo='INGRESO' THEN monto ELSE -monto END), 0
        ) AS balance
        FROM movimientos
    `;

    conexion.query(sql, (error, resultados) => {
        if (error) return res.status(500).json(error);
        res.json(resultados[0]);
    });
});

// EDITAR
app.put('/movimientos/:id', (req, res) => {
    const { id } = req.params;
    const { tipo, categoria, descripcion, monto } = req.body;

    conexion.query(
        'UPDATE movimientos SET tipo=?, categoria=?, descripcion=?, monto=? WHERE id=?',
        [tipo, categoria, descripcion, monto, id],
        (error) => {
            if (error) return res.status(500).json(error);
            res.json({ mensaje: 'Movimiento actualizado' });
        }
    );
});

// ELIMINAR
app.delete('/movimientos/:id', (req, res) => {
    conexion.query(
        'DELETE FROM movimientos WHERE id=?',
        [req.params.id],
        (error) => {
            if (error) return res.status(500).json(error);
            res.json({ mensaje: 'Movimiento eliminado' });
        }
    );
});

// SERVER
const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor iniciado en puerto ${PUERTO}`);
});