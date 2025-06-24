export class AuthView {
    constructor() {}
    toggleForm(form) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authToggle = document.querySelector('.auth-toggle');
        if (loginForm && registerForm && authToggle) {
            if (form === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                authToggle.children[0].classList.add('active');
                authToggle.children[1].classList.remove('active');
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                authToggle.children[0].classList.remove('active');
                authToggle.children[1].classList.add('active');
            }
        }
    }
    getLoginData() {
        const identifier = document.getElementById('loginIdentifier');
        const password = document.getElementById('loginPassword');
        return {
            identifier: identifier ? identifier.value : '',
            password: password ? password.value : ''
        };
    }
    getRegisterData() {
        const name = document.getElementById('regName');
        const dob = document.getElementById('regDob');
        const gender = document.getElementById('regGender');
        const login = document.getElementById('regLogin');
        const password = document.getElementById('regPassword');
        const email = document.getElementById('regEmail');
        const role = document.getElementById('regRole');
        return {
            name: name ? name.value : '',
            dob: dob ? dob.value : '',
            gender: gender ? gender.value : '',
            login: login ? login.value : '',
            password: password ? password.value : '',
            email: email ? email.value : '',
            role: role ? role.value : 'Client'
        };
    }
    setupButtons(onLogin, onRegister, onToggleLogin, onToggleRegister) {
        const loginBtn = document.querySelector('#loginForm button');
        const registerBtn = document.querySelector('#registerForm button');
        const toggleLoginBtn = document.querySelector('.auth-toggle button:nth-child(1)');
        const toggleRegisterBtn = document.querySelector('.auth-toggle button:nth-child(2)');
        if (loginBtn) loginBtn.addEventListener('click', onLogin);
        if (registerBtn) registerBtn.addEventListener('click', onRegister);
        if (toggleLoginBtn) toggleLoginBtn.addEventListener('click', onToggleLogin);
        if (toggleRegisterBtn) toggleRegisterBtn.addEventListener('click', onToggleRegister);
    }
}