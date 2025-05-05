const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const multer = require('multer'); // Importar o multer para upload de arquivos

const app = express();
const port = 3000;

// Configuração do multer para armazenamento de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Defina o diretório onde as imagens serão armazenadas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome único para cada arquivo
    }
});

const upload = multer({ storage: storage });

app.use(express.static('./login'));

// Conectar ao MongoDB
mongoose.connect("mongodb+srv://dreqx:w30MZuWHtXlSxAuU@cluster0.pkejh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Criar modelo de usuário
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    nome: String,  // Nome do usuário
    foto: String,  // URL da foto de perfil
    bio: String    // Biografia do usuário
});

const User = mongoose.model("User", UserSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Configurar sessões para manter login ativo
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware para verificar se o usuário está logado antes de acessar .server
function checkAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// Servir páginas estáticas
app.use('/login', express.static(path.join(__dirname, 'login')));

// Usar o middleware de autenticação antes de servir a pasta .server
app.use('/u', checkAuth, express.static(path.join(__dirname, 'u')));

// Rota para redirecionar usuários autenticados para .server
app.get('/u/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, '.server/index.html'));
    } else {
        res.redirect('/login');
    }
});

// Rota para atualizar o perfil do usuário
app.post("/update-profile", upload.single('foto'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Não autenticado" });
    }

    const { nome, bio } = req.body;
    const foto = req.file ? req.file.filename : null; // Se uma foto foi enviada, use o nome do arquivo

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        user.nome = nome || user.nome;
        user.foto = foto ? `/uploads/${foto}` : user.foto; // Atualiza a foto, se presente
        user.bio = bio || user.bio;

        await user.save();
        res.json({ success: true, message: "Perfil atualizado!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
