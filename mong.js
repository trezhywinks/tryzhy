const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const axios = require('axios');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;


mongoose.connect('mongodb+srv://dreqxyxl:5jvkLqtTRsDcgvY1@winewinks.ajyhewm.mongodb.net/?retryWrites=true&w=majority&appName=winewinks', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    name: String,
    age: Number,
    bio: String,
    image: String,
    category: String
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
                    <head><title>Perfil de ${user.username}</title></head>
                    <body>
                        <h1>${user.username}</h1>
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

app.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { username, password, category } = req.body;

        if (!req.file) return res.status(400).json({ error: 'Imagem obrigatória' });

        const imageBase64 = req.file.buffer.toString('base64');

        const newUser = new User({
            username,
            password,
//            email,
            category,
            image: imageBase64
        });

        await newUser.save();
        req.session.userId = newUser._id;

        res.json({ success: true, redirect: "/u" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
