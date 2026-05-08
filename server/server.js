const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Producto = require('./models/Producto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());
// Servir archivos estáticos desde la carpeta 'public' que está un nivel arriba
app.use(express.static(path.join(__dirname, '../public')));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(' Conectado a MongoDB Atlas'))
    .catch(err => console.error(' Error de conexión:', err));

// CRUD de productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json({ success: true, productos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true, producto });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, precio, categoria } = req.body;
        const nuevo = new Producto({ nombre, precio, categoria });
        const saved = await nuevo.save();
        res.status(201).json({ success: true, id: saved._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    try {
        const { nombre, precio, categoria } = req.body;
        const updated = await Producto.findByIdAndUpdate(
            req.params.id,
            { nombre, precio, categoria },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const deleted = await Producto.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CRUD en memoria para juegos (opcional)
let juegosMemoria = [
    { id: 1, nombre: "Starburst", proveedor: "NetEnt", rtp: 96.09, volatilidad: "Baja" },
    { id: 2, nombre: "Book of Dead", proveedor: "Play'n GO", rtp: 96.21, volatilidad: "Alta" },
    { id: 3, nombre: "Mega Moolah", proveedor: "Microgaming", rtp: 88.12, volatilidad: "Muy alta" }
];
let nextIdMemoria = 4;

app.get('/api/juegos-memoria', (req, res) => res.json({ success: true, juegos: juegosMemoria }));
app.get('/api/juegos-memoria/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const juego = juegosMemoria.find(j => j.id === id);
    if (!juego) return res.status(404).json({ success: false, message: "Juego no encontrado" });
    res.json({ success: true, juego });
});
app.post('/api/juegos-memoria', (req, res) => {
    const { nombre, proveedor, rtp, volatilidad } = req.body;
    if (!nombre || !proveedor || rtp === undefined || !volatilidad) {
        return res.status(400).json({ success: false, message: "Faltan campos" });
    }
    const nuevoJuego = { id: nextIdMemoria++, nombre, proveedor, rtp: parseFloat(rtp), volatilidad };
    juegosMemoria.push(nuevoJuego);
    res.status(201).json({ success: true, juego: nuevoJuego });
});
app.put('/api/juegos-memoria/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = juegosMemoria.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Juego no encontrado" });
    const { nombre, proveedor, rtp, volatilidad } = req.body;
    if (nombre !== undefined) juegosMemoria[index].nombre = nombre;
    if (proveedor !== undefined) juegosMemoria[index].proveedor = proveedor;
    if (rtp !== undefined) juegosMemoria[index].rtp = parseFloat(rtp);
    if (volatilidad !== undefined) juegosMemoria[index].volatilidad = volatilidad;
    res.json({ success: true, juego: juegosMemoria[index] });
});
app.delete('/api/juegos-memoria/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = juegosMemoria.findIndex(j => j.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Juego no encontrado" });
    const eliminado = juegosMemoria.splice(index, 1);
    res.json({ success: true, eliminado: eliminado[0] });
});

app.listen(PORT, () => {
    console.log(` Servidor Casino corriendo en http://localhost:${PORT}`);
});