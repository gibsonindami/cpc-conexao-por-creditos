const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// Botões do overlay (desktop)
signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// Botões adicionais (mobile/tablet)
const mobileSignUp = document.getElementById('mobileSignUp');
const mobileSignIn = document.getElementById('mobileSignIn');

mobileSignUp.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

mobileSignIn.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// ======== Feedback visual ========
function mostrarFeedback(form, tipo) {
  form.classList.remove('error', 'success');
  form.classList.add(tipo);

  setTimeout(() => {
    form.classList.remove(tipo);
  }, 2500);
}

// ======== Validação Front-End ========

function mostrarErro(input, mensagem) {
  let p = input.parentNode.querySelector('.msg-erro');
  if (!p) {
    p = document.createElement('p');
    p.className = 'msg-erro';
    p.style.color = 'red';
    p.style.fontSize = '14px';
    p.style.marginTop = '4px';
    input.insertAdjacentElement('afterend', p);
  }
  p.textContent = mensagem;
  input.style.border = '2px solid red';
}

function limparErro(input) {
  const p = input.parentNode.querySelector('.msg-erro');
  if (p) p.remove();
  input.style.border = '1px solid #ccc';
}

// ======== Login ========
const loginForm = document.querySelector('.sign-in-container form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const usuario = loginForm.querySelector('input[placeholder="Usuário"]');
  const senha = loginForm.querySelector('input[placeholder="Senha"]');

  let valido = true;
  limparErro(usuario);
  limparErro(senha);

  if (usuario.value.trim() === "") {
    mostrarErro(usuario, "Digite seu usuário!");
    valido = false;
  }

  if (senha.value.trim() === "") {
    mostrarErro(senha, "Digite sua senha!");
    valido = false;
  }

  if (valido) {
    mostrarFeedback(loginForm, 'success');
    // redireciona após 800ms para a página de home
    setTimeout(() => {
      loginForm.submit(); // se quiser enviar para back-end
      // ou usar window.location:
      window.location.href = "/home"; 
    }, 800);
  } else {
    mostrarFeedback(loginForm, 'error');
  }
});

// ======== Cadastro ========
const cadastroForm = document.querySelector('.sign-up-container form');
cadastroForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const usuario = cadastroForm.querySelector('input[placeholder="Usuário"]');
  const email = cadastroForm.querySelector('input[placeholder="Email"]');
  const senha = cadastroForm.querySelector('input[placeholder="Senha"]');
  const confirmar = cadastroForm.querySelector('input[placeholder="Confirmar senha"]');

  let valido = true;
  [usuario, email, senha, confirmar].forEach(limparErro);

  if (usuario.value.trim().length < 3) {
    mostrarErro(usuario, "O nome deve ter pelo menos 3 caracteres!");
    valido = false;
  }

  if (!email.value.includes("@") || !email.value.includes(".")) {
    mostrarErro(email, "Digite um email válido!");
    valido = false;
  }

  if (senha.value.length < 6) {
    mostrarErro(senha, "A senha deve ter no mínimo 6 caracteres!");
    valido = false;
  }

  if (senha.value !== confirmar.value) {
    mostrarErro(confirmar, "As senhas não conferem!");
    valido = false;
  }

  if (valido) {
    mostrarFeedback(cadastroForm, 'success');
    // redireciona após 800ms para login
    setTimeout(() => {
      cadastroForm.submit(); // se quiser enviar para back-end
      // ou usar window.location:
      window.location.href = "/home"; 
    }, 800);
  } else {
    mostrarFeedback(cadastroForm, 'error');
  }
});
