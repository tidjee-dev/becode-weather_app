// Function to generate the login form
const generateLoginForm = () => {
  return `
    <p>You need to be logged in to use this app.</p>
    <form id="login-form">
      <h2 class="form-title">Login</h2>
      <label for="login-username">Username:</label>
      <input type="text" id="login-username" name="username">
      <label for="login-password">Password:</label>
      <input type="password" id="login-password" name="password">
      <button type="submit">Login</button>
    </form>
  `;
};

// Function to generate the register form
const generateRegisterForm = () => {
  return `
    <p>You need to be registered to use this app.</p>
    <form id="register-form">
      <h2 class="form-title">Register</h2>
      <label for="register-username">Username:</label>
      <input type="text" id="register-username" name="username">
      <label for="register-password">Password:</label>
      <input type="password" id="register-password" name="password">
      <label for="register-confirmPassword">Confirm Password:</label>
      <input type="password" id="register-confirmPassword" name="confirmPassword">
      <button type="submit">Register</button>
    </form>
  `;
};

// Function to generate forms based on the type ('register' or 'login')
const generateForms = (formType: string) => {
  const authContainer = document.querySelector(
    "#auth-container"
  ) as HTMLDivElement;
  const formHtml =
    formType === "register" ? generateRegisterForm() : generateLoginForm();
  authContainer.innerHTML = formHtml;
};

// Helper function to make API requests (login or register)
const makeApiRequest = async (url: string, data: object) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to connect: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    return null;
  }
};

// Function to handle user registration
const registerUser = async (username: string, password: string) => {
  const data = { username, password };
  const url = "http://localhost:15000/auth/register";
  const response = await makeApiRequest(url, data);
  if (response) {
    localStorage.setItem("user", JSON.stringify(data));
    loginUser(username, password); // Automatically login after registering
  }
};

// Function to handle user login
const loginUser = async (username: string, password: string) => {
  const data = { username, password };
  const url = "http://localhost:15000/auth/login";
  const response = await makeApiRequest(url, data);
  if (response?.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("isUserLoggedIn", "true");
    displayLoggedInState();
  }
};

// Display logged-in state and logout button
const displayLoggedInState = () => {
  const authContainer = document.querySelector(
    "#auth-container"
  ) as HTMLDivElement;
  authContainer.innerHTML = `
    <p>You are already logged in.</p>
    <button id="logout-button">Logout</button>
  `;
  const logoutButton = document.querySelector(
    "#logout-button"
  ) as HTMLButtonElement;
  logoutButton.addEventListener("click", () => {
    localStorage.setItem("isUserLoggedIn", "false");
    window.location.href = "/";
  });
};

// Check if user is registered
const isUserRegistered = () => !!localStorage.getItem("user");

// Check if user is logged in
const isUserLoggedIn = () => localStorage.getItem("isUserLoggedIn") === "true";

// Handle form submission for both login and register forms
const handleFormSubmit = (event: Event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const username = form.username.value;
  const password = form.password.value;
  const confirmPassword = (form as HTMLFormElement).confirmPassword?.value;

  if (form.id === "register-form") {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    registerUser(username, password);
  } else {
    loginUser(username, password);
  }
};

// Initialize the authentication system
const initAuth = () => {
  if (isUserLoggedIn()) {
    displayLoggedInState();
  } else {
    generateForms(isUserRegistered() ? "login" : "register");
  }

  const authForm = document.querySelector(
    "#auth-container form"
  ) as HTMLFormElement;
  if (authForm) {
    authForm.addEventListener("submit", handleFormSubmit);
  }
};

export default initAuth;
