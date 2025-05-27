export function initAvatarScrollTracker({
  containerId = 'comment-section',
  avatarId = 'fixed-avatar-img',
  imgSelector = '.foto-usuario',
  msgSelector = '.comentario'
} = {}) {
  const section = document.getElementById(containerId);
  const avatar = document.getElementById(avatarId);

  function atualizarAvatar() {
    const mensagens = section.querySelectorAll(msgSelector);

    for (let i = 0; i < mensagens.length; i++) {
      const msg = mensagens[i];
      const rect = msg.getBoundingClientRect();
      const containerRect = section.getBoundingClientRect();

      if (rect.top >= containerRect.top && rect.bottom > containerRect.top) {
        const img = msg.querySelector(imgSelector);
        if (img && avatar.src !== img.src) {
          avatar.style.opacity = 0;
          setTimeout(() => {
            avatar.src = img.src;
            avatar.style.opacity = 1;
          }, 150);
        }
        break;
      }
    }
  }

  section.addEventListener('scroll', atualizarAvatar);
  window.addEventListener('DOMContentLoaded', atualizarAvatar);
}
