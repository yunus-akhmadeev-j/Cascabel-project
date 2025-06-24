import { getCurrentUser, setCurrentUser, updateNav } from '../common.js';

export class AuthPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  initialize() {
    const user = getCurrentUser();
    if (user) {
      console.log('User already logged in:', user);
      window.location.href = 'index.html';
    } else {
      console.log('No user logged in, setting up forms');
      this.view.setupButtons(
        () => this.login(),
        () => this.register(),
        () => this.view.toggleForm('login'),
        () => this.view.toggleForm('register')
      );
    }
  }

  async login() {
    const data = this.view.getLoginData();
    console.log('Login data:', data);
    try {
      const user = await this.model.login(data.identifier, data.password);
      if (user) {
        console.log('Login successful, user:', user);
        setCurrentUser(user);
        updateNav();
        window.location.href = 'index.html';
      } else {
        console.error('Login failed: invalid credentials or user blocked');
        alert('Неверный логин или пароль, либо пользователь заблокирован');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Ошибка при авторизации. Проверьте данные и попробуйте снова.');
    }
  }

  async register() {
    const data = this.view.getRegisterData();
    console.log('Register data:', data);
    if (data.name && data.login && data.password && data.email) {
      try {
        const newUser = await this.model.register({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role
        });
        if (newUser) {
          console.log('Registration successful, user:', newUser);
          setCurrentUser(newUser);
          updateNav();
          window.location.href = 'profile.html';
        } else {
          console.error('Registration failed: user already exists');
          alert('Пользователь с таким логином или email уже существует');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Ошибка при регистрации. Проверьте данные и попробуйте снова.');
      }
    } else {
      console.error('Registration failed: incomplete form data');
      alert('Заполните все поля');
    }
  }
}