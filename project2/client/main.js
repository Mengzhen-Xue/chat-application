import { login, getUsers, getMessages, postMessage, logout } from './api';

const loginForm = document.querySelector('.login-form');
const messageForm = document.querySelector('.message-form');
const messagesContainer = document.querySelector('.list-messages');
const usersContainer = document.querySelector('.list-users');
const logoutButton = document.querySelector('.logout-button');
const loadingIndicator = document.querySelector('.loading-indicator');
const errorMessage = document.querySelector('.error-message');

const showErrorMessage = (message) => {
  const errorContainer = document.querySelector('.error-message');
  errorContainer.textContent = message;
  errorContainer.classList.remove('hidden');
  clearTimeout(errorContainer.hideTimeout);
  errorContainer.hideTimeout = setTimeout(() => {
    errorContainer.classList.add('hidden');
  }, 5000);
};

const setLoading = (isLoading) => {
  if (isLoading) {
    loadingIndicator.classList.remove('hidden');
  } else {
    loadingIndicator.classList.add('hidden');
  }
};

const checkLogin = () => {
  setLoading(true);
  getUsers()
    .then(() => {
      document.querySelector('.container-login').classList.add('hidden');
      document.querySelector('.container-chat').classList.remove('hidden');
      loadUsers()
        .then(() => loadMessages())
        .then(() => startPolling());
    })
    .catch((error) => {
      if (error.message === 'Unauthorized') {
        document.querySelector('.container-login').classList.remove('hidden');
        document.querySelector('.container-chat').classList.add('hidden');
      } else {
        showErrorMessage("An unexpected error occurred. Please try again.");
      }
    })
    .finally(() => setLoading(false));
};

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  setLoading(true);
  const username = e.target.elements.username.value;

  login(username)
    .then(checkLogin)
    .catch((error) => {
      if (error.response && error.response.status === 400) {
        showErrorMessage("Invalid request. Please check your input and try again.");
      } else {
        showErrorMessage("Login failed. Please try again.");
      }
    })
    .finally(() => setLoading(false));
});

const startPolling = () => {
  setInterval(() => {
    Promise.all([loadMessages(), loadUsers()])
      .catch((error) => {
        console.error("Polling error:", error);
        if (error.message === 'Unauthorized') {
          showErrorMessage("Session expired. Please log in again.");
        } else {
          showErrorMessage("An error occurred. Please try again.");
        }
      });
  }, 5000);
};

logoutButton.addEventListener('click', () => {
  setLoading(true);
  logout()
    .then(() => {
      document.querySelector('.container-login').classList.remove('hidden');
      document.querySelector('.container-chat').classList.add('hidden');
    })
    .catch(() => showErrorMessage("Logout failed. Please try again."))
    .finally(() => setLoading(false));
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = e.target.elements.message.value.trim();

  if (!content) {
    showErrorMessage("Message cannot be empty.");
    return;
  }

  setLoading(true);
  postMessage(content)
    .then(() => {
      e.target.elements.message.value = '';
      loadMessages();
    })
    .catch((error) => {
      if (error.message && error.message.includes('400')) {
        showErrorMessage("Message content cannot be empty.");
      } else {
        showErrorMessage("Failed to send message. Please try again.");
      }
    })
    .finally(() => setLoading(false));
});

const loadMessages = () => {
  setLoading(true);
  return getMessages()
    .then((messages) => {
      messagesContainer.innerHTML = messages
        .map(msg => `<div>${msg.username}: ${msg.content}</div>`)
        .join('');
    })
    .catch(() => showErrorMessage("Failed to load messages. Please try again."))
    .finally(() => setLoading(false));
};

const loadUsers = () => {
  setLoading(true);
  return getUsers()
    .then((users) => {
      usersContainer.innerHTML = users.map(user => `<li>${user}</li>`).join('');
    })
    .catch(() => showErrorMessage("Failed to load users. Please try again."))
    .finally(() => setLoading(false));
};

checkLogin();
