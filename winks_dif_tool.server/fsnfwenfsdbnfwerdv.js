let currentUser = null;
const dado = localStorage.getItem('data')

async function carregarUsuario(dado) {
  try {
    const response = await fetch(`http://localhost:3000/k/winks`);
    if (!response.ok) throw new Error('Usuário não encontrado');

    const data = await response.json();
    currentUser = {
      nome: data.username,
      foto: data.image.startsWith('data:image') ? data.image : `data:image/png;base64${data.image}`;
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
  img.alt = `Foto de ${nome}`;
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
}
});

window.addEventListener('DOMContentLoaded', async () => {
  await carregarUsuario(dado);
  carregarComentarios();
});
