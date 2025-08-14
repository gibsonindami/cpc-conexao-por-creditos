const continuarBtn = document.getElementById('continuarBtn');
const formBanco = document.getElementById('formBanco');
const formInicial = document.querySelector('.form-inicial');
const doarBtn = document.getElementById('doarBtn');
const voltarBtn = document.getElementById('voltarBtn');
const mensagem = document.getElementById('mensagem');

continuarBtn.addEventListener('click', () => {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!nome || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  formBanco.classList.remove('hidden');
  formBanco.classList.add('show');
});

doarBtn.addEventListener('click', () => {
  formBanco.classList.remove('show');
  formBanco.classList.add('hidden');
  mensagem.classList.remove('hidden');
  mensagem.classList.add('show');
});

voltarBtn.addEventListener('click', () => {
  formBanco.classList.remove('show');
  formBanco.classList.add('hidden');
});
