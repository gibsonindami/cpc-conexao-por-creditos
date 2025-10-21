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
