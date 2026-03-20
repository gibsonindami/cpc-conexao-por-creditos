// ================= OVERLAY =================
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

const mobileSignUp = document.getElementById('mobileSignUp');
const mobileSignIn = document.getElementById('mobileSignIn');

mobileSignUp.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

mobileSignIn.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// ================= FEEDBACK =================
function mostrarFeedback(form, tipo) {
  form.classList.remove('error', 'success');
  form.classList.add(tipo);

  setTimeout(() => {
    form.classList.remove(tipo);
  }, 1500);
}

// ================= ERRO / SUCESSO =================
function mostrarErro(input, mensagem) {
  let p = input.parentNode.querySelector('.msgErro');

  if (!p) {
    p = document.createElement('p');
    p.className = 'msgErro';
    input.insertAdjacentElement('afterend', p);
  }

  p.textContent = mensagem;

  input.classList.add('input-error');
  input.classList.remove('input-success');

  // animação
  input.classList.add('shake');
  setTimeout(() => input.classList.remove('shake'), 400);
}

function limparErro(input) {
  const p = input.parentNode.querySelector('.msgErro');
  if (p) p.remove();

  input.classList.remove('input-error');
}

function marcarSucesso(input) {
  input.classList.remove('input-error');
  input.classList.add('input-success');
}

// ================= LOGIN =================
const loginForm = document.querySelector('.sign-in-container form');

const usuarioLogin = loginForm.querySelector('input[name="usuarioDigitado"]');
const senhaLogin = loginForm.querySelector('input[name="senhaDigitada"]');

// validação em tempo real
usuarioLogin.addEventListener('input', () => {
  if (usuarioLogin.value.trim() !== "") {
    limparErro(usuarioLogin);
    marcarSucesso(usuarioLogin);
  }
});

senhaLogin.addEventListener('input', () => {
  if (senhaLogin.value.trim() !== "") {
    limparErro(senhaLogin);
    marcarSucesso(senhaLogin);
  }
});

loginForm.addEventListener('submit', (e) => {
  let valido = true;

  limparErro(usuarioLogin);
  limparErro(senhaLogin);

  if (usuarioLogin.value.trim() === "") {
    mostrarErro(usuarioLogin, "Digite seu usuário!");
    valido = false;
  }

  if (senhaLogin.value.trim() === "") {
    mostrarErro(senhaLogin, "");
    valido = false;
  }

  if (!valido) {
    e.preventDefault();
    mostrarFeedback(loginForm, 'error');
  } else {
    mostrarFeedback(loginForm, 'success');
  }
});

// ================= CADASTRO =================
const cadastroForm = document.querySelector('.sign-up-container form');

const usuarioCad = cadastroForm.querySelector('input[name="nome"]');
const emailCad = cadastroForm.querySelector('input[name="email"]');
const senhaCad = cadastroForm.querySelector('input[name="senha"]');
const confirmarCad = cadastroForm.querySelector('input[name="confirmarSenha"]');

// validação em tempo real
usuarioCad.addEventListener('input', () => {
  if (usuarioCad.value.trim().length >= 3) {
    limparErro(usuarioCad);
    marcarSucesso(usuarioCad);
  }
});

emailCad.addEventListener('input', () => {
  if (emailCad.value.includes("@") && emailCad.value.includes(".")) {
    limparErro(emailCad);
    marcarSucesso(emailCad);
  }
});

senhaCad.addEventListener('input', () => {
  if (senhaCad.value.length >= 6) {
    limparErro(senhaCad);
    marcarSucesso(senhaCad);
  }
});

confirmarCad.addEventListener('input', () => {
  if (confirmarCad.value === senhaCad.value && confirmarCad.value !== "") {
    limparErro(confirmarCad);
    marcarSucesso(confirmarCad);
  }
});

cadastroForm.addEventListener('submit', (e) => {
  let valido = true;

  [usuarioCad, emailCad, senhaCad, confirmarCad].forEach(limparErro);

  if (usuarioCad.value.trim().length < 3) {
    mostrarErro(usuarioCad, "Mínimo 3 caracteres!");
    valido = false;
  } else {
    marcarSucesso(usuarioCad);
  }

  if (!emailCad.value.includes("@") || !emailCad.value.includes(".")) {
    mostrarErro(emailCad, "Digite um email válido!");
    valido = false;
  } else {
    marcarSucesso(emailCad);
  }

  if (senhaCad.value.length < 6) {
    mostrarErro(senhaCad, "Senha deve ter no mínimo 6 caracteres!");
    valido = false;
  } else {
    marcarSucesso(senhaCad);
  }

  if (senhaCad.value !== confirmarCad.value || confirmarCad.value === "") {
    mostrarErro(confirmarCad, "Complete todos os campos corretamente!");
    valido = false;
  } else {
    marcarSucesso(confirmarCad);
  }

  if (!valido) {
    e.preventDefault();
    mostrarFeedback(cadastroForm, 'error');
  } else {
    mostrarFeedback(cadastroForm, 'success');
  }
});