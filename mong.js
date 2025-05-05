const express = require('express');
const axios = require('axios');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/seuBancoDeDados', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    age: Number,
    bio: String,
    image: String
});

const User = mongoose.model('User', UserSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'seu-segredo',
    resave: false,
    saveUninitialized: true
}));

// Middleware de autenticação
function checkAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// Servir páginas estáticas
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/u', checkAuth, express.static(path.join(__dirname, 'u')));

// Rota para redirecionar usuários autenticados para .server
app.get('/u', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'u/index.html'));
    } else {
        res.redirect('/login');
    }
});

app.get("/users", async (req, res) => {

    const users = await User.find();

    res.json(users);

});


// Rota para login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            req.session.userId = user.username;
            res.json({ success: true, redirect: "/u" });
        } else {
            res.json({ success: false, message: 'Usuário ou senha incorretos' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar usuários' });
    }
});

// Rota para carregar perfis de usuários
app.get('/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            res.send(`
                <html>
                    <head><title>Perfil de ${user.name}</title></head>
                    <body>
                        <h1>${user.name}</h1>
                        <img src="${user.image}" alt="Foto de ${user.name}" width="150">
                        <p>Bio: ${user.bio}</p>
                    </body>
                </html>
            `);
        } else {
            res.status(404).send("Usuário não encontrado");
        }
    } catch (error) {
        res.status(500).send("Erro ao buscar usuário");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
