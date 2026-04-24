/**
 * admin-login.js
 * Login-only page for the admin area.
 */

document.addEventListener("DOMContentLoaded", () => {
  const wait = setInterval(() => {
    if (window.dataService) {
      clearInterval(wait);
      setupLogin();
    }
  }, 100);
});

function setupLogin() {
  const ds = window.dataService;
  const loginBtn = document.getElementById("login-btn");
  const emailInput = document.getElementById("admin-email");
  const pwdInput = document.getElementById("admin-password");
  const loginError = document.getElementById("login-error");

  if (!loginBtn || !emailInput || !pwdInput || !loginError) return;

  const login = async () => {
    try {
      loginError.style.display = "none";
      loginBtn.disabled = true;
      loginBtn.innerText = "로그인 중...";
      await ds.login(emailInput.value, pwdInput.value);
      window.location.href = "admin.html";
    } catch (error) {
      console.error("Login failed:", error);
      loginError.innerText = "이메일 또는 비밀번호가 올바르지 않습니다.";
      loginError.style.display = "block";
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerText = "로그인";
    }
  };

  loginBtn.addEventListener("click", login);
  pwdInput.addEventListener("keypress", e => {
    if (e.key === "Enter") login();
  });
}
