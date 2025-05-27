const express = require('express');
const qrcode = require('qrcode-terminal');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const axios = require('axios');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const host_server = `http://192.168.1.5:${PORT}`;


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

function checkAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

app.use(express.static('login'))
app.use('/login', express.static(path.join(__dirname, 'login')));
app.use('/u', checkAuth, express.static(path.join(__dirname, 'u')));

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

// Rota JSON: retorna os dados do usuário em JSON
app.get('/k/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (user) {
            res.json({
                username: user.username,
                name: user.name,
                image: user.image,
                bio: user.bio,
                id: user._id
            });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário' });
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

app.get('/svg/enter', (req, res) => {
res.sendFile(path.join(__dirname, 'winks_dif_tool.server', 'enter.svg'))
});

app.get('/winks_dif_tool_server', (req, res) => {
res.sendFile(path.join(__dirname, 'winks_dif_tool.server', 'style.css'));
});

app.get('/winks/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).send('<h1>Usuário não encontrado</h1>');
    }

    const html = `
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${user.username}</title>
  <link rel="stylesheet" href="http://localhost:3000/winks_dif_tool_server">
  <link rel="stylesheet" href="animete.css">
 <script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js"></script>
</head>
<body>
  <div class="topmessage">
    <div class="nottonu">
      <span>
<img src="./img/bxs-chevron-left.svg" width="40" style="color: #fff;"/>
      </span>
    </div>
    <div class="nameuser">
      <div class="dixed">
      <div class="firl">
    <span style="font-weight: 500; font-size: 20px;" class="mignameY">${user.username}</span>
      </div>
    <div class="svg">
    </div>
</div>
      <p style="opacity: 0.4; font-size: 12px;">offline</p>
    </div>
    <div class="fileuser">
      <img src="data:image/png;base64,${user.image}" class="migimageY" onclick="iframE()" id="phor" width="50" height="50"/>
    </div>
  </div>
  <div class="iframe">
  <iframe class="" src="./iframe.html" frameborder="0"></iframe>
  </div>
      <script>
function iframE() {
    console.log("ok");
    const ifg = document.querySelector('.iframe');

    if (ifg.style.display === "none" || getComputedStyle(ifg).display === "none") {
        ifg.style.display = "inline";
    } else {
        ifg.style.display = "none";
    }
}

    </script>
  <div class="centermessage">
    <div class="foder">
    <br><br><br>
    <div class="welcome">
      <div class="filewinks">
      <img src="data:image/png;base64,${user.image}" class="migimage" width="80" height="80" style="border-radius: 3px;"/>
      </div>
    <br>
    <div class="namewinks">
<div class="dixed">
      <div class="firl">
    <span style="font-weight: 600; font-size: 25px; letter-spacing: -1px;" class="migname">${user.username}</span>
      </div>
    <div class="svg">
    <span>
    </span>
    </div>
      </div>
    <p style="font-size: 14px; opacity: 0.6;">Hello user, I'm wine. Welcome to my prived.
    <span style="color: #3193e4; font-weight:600;">Share</span><br></p>
    </div>
    </div>
    <div class="botsd">
<div class="ioniconv">
<style>
.ioniconv{
margin-top: 20px;
}
.ringh{
text-align: left;
}
.uio{
margin-top: 5px;
}
</style>
<!--span>
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"viewBox="0 0 24 24" style="fill:green; font-size: 25px;">
<path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"/></svg>
</span-->
</div>

<div class="share view">
<div class="uio">
<box-icon style="fill: #fff;" name='link-alt'></box-icon>
</div>
<div class="ringh">
<span>
Compartilhar
<br><p style="font-size: 13px; opacity: 0.4;">Cique para compartilhar esse usuario.</p>
</span>
</div>
<div class="uio">
<box-icon style="fill: #fff;" name='chevron-right'></box-icon>
</div>
      </div>

<div class="share view">
<div class="uio">
<box-icon style="fill: #fff;" type='solid' name='flask'></box-icon>
</div>
<div class="ringh">
<span>
Visualizar perfil
<br><p style="font-size: 13px; opacity: 0.4;">Cique para ver o perfil desse usuario.</p>
</span>
</div>
<div class="uio">
<box-icon style="fill: #fff;" name='chevron-right'></box-icon>
</div>
      </div>

    </div>
<style>
#comment-section{
padding: 10px;
width: 450px;
padding-bottom: 10%;
}
 
.usuario-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 5px;
}


.data-comentario {
  font-size: 0.8em;
  color: #666;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.comentario p {
  white-space: pre-wrap;
  word-break: break-word;
}

.comentario {
padding: 10px;
width: 450px;
}
 
@media(max-width: 999px){
.comentario{
width: 95%;
}
#comment-section{
width: 95%;
}
}
 
</style>
<div id="comment-section"></div>
    </div>
  </div>

  <div class="inputmessage">
    <div class="masdin">
      <h2 style="font-size: 40px; font-weight: 100;">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" style="fill: #fff;"><path d="m21.781 13.875-2-2.5A1 1 0 0 0 19 11h-6V9h6c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2H5a1 1 0 0 0-.781.375l-2 2.5a1.001>
      </h2>
    </div>
    <div class="inputmeng">
      <input type="text" name="" id="comment-input" >
    </div>
    <div class="sendmessage" id="submit-comment">
      <span> 
     <img src="http://localhost:3000/svg/enter">
      </span>
    </div>
  </div>
  <script src="main.js"></script>
<script>
</script>

<script>
let currentUser = null;
const dado = localStorage.getItem('data')

async function carregarUsuario(dado) {
  try {
    const response = await fetch("http://localhost:3000/k/" + dado);
    if (!response.ok) throw new Error('Usuário não encontrado');

    const data = await response.json();
    currentUser = {
      nome: data.username,
      foto: data.image.startsWith('data:image') ? data.image : "data:image/png;base64" + data.image;
    };
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    alert('Erro ao carregar usuário. Comentários desativados.');
    document.getElementById('comment-input').disabled = true;
    document.getElementById('submit-comment').disabled = true;
  }
}
 
function criarComentarioHTML({ nome, foto, mensagem, data }) {
  const divComentario = document.createElement('div');
  divComentario.className = 'comentario';

  const divUsuario = document.createElement('div');
  divUsuario.className = 'usuario-info';

  const img = document.createElement('img');
  img.src = foto;
  img.alt = 'Foto de' + nome;
  img.className = 'foto-usuario';

  const textoUsuario = document.createElement('div');
  textoUsuario.className = 'info-texto';

  const nomeEl = document.createElement('strong');
  nomeEl.textContent = nome;

  const dataEl = document.createElement('p');
  dataEl.textContent = data;
  dataEl.className = 'data-comentario';

  textoUsuario.appendChild(nomeEl);
  textoUsuario.appendChild(dataEl);

  divUsuario.appendChild(img);
  divUsuario.appendChild(textoUsuario);

  const conteudoDiv = document.createElement('div');
  conteudoDiv.className = 'conteudo';

  const msgEl = document.createElement('p');
  msgEl.textContent = mensagem;

  conteudoDiv.appendChild(msgEl);

  divComentario.appendChild(divUsuario);
  divComentario.appendChild(conteudoDiv);

  return divComentario;
}
 


function salvarComentarioLocal(comentario) {
  const comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
  comentarios.push(comentario);
  localStorage.setItem('comentarios', JSON.stringify(comentarios));
}

function carregarComentarios() {
  const comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
  comentarios.forEach(c => {
    const div = criarComentarioHTML(c);
    document.getElementById('comment-section').appendChild(div);
  });
}

function adicionarComentario(mensagem) {
  if (!mensagem.trim() || !currentUser) return;

  const agora = new Date();
  const dataFormatada = agora.toLocaleString('pt-BR', {
day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const comentario = {
    nome: currentUser.nome,
    foto: currentUser.foto,
    mensagem: mensagem.trim(),
    data: dataFormatada
  };

  const div = criarComentarioHTML(comentario);
  document.getElementById('comment-section').appendChild(div);
  salvarComentarioLocal(comentario);
  document.getElementById('comment-input').value = '';

  const section = document.getElementById('comment-section');
  section.scrollTop = section.scrollHeight;
}

document.getElementById('submit-comment').addEventListener('click', () => {
  const msg = document.getElementById('comment-input').value;
  adicionarComentario(msg);
});

document.getElementById('comment-input').addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    const msg = document.getElementById('comment-input').value;
    adicionarComentario(msg);
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  await carregarUsuario(dado);
  carregarComentarios();
});
</script>
</body>
</html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('<h1>Erro interno do servidor</h1>');
  }
});

app.listen(PORT, () => {
qrcode.generate(host_server, {small: true}, function(qrcode) {
console.log(qrcode);
})
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});



