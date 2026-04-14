/**
 * admin.js
 * 
 * 관리자 대시보드 인터랙션 및 Firebase 데이터 제어 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  // 모듈로 로드되는 dataService가 전역객체에 등록될 때까지 잠시 대기
  const init = setInterval(() => {
    if (window.dataService) {
      clearInterval(init);
      setupAdmin();
    }
  }, 100);

  function setupAdmin() {
    const ds = window.dataService;

    // --- 요소 참조 ---
    const loginOverlay = document.getElementById('login-overlay');
    const adminContainer = document.getElementById('admin-container');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const emailInput = document.getElementById('admin-email');
    const pwdInput = document.getElementById('admin-password');
    const loginError = document.getElementById('login-error');

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.admin-section');
    const pageTitle = document.getElementById('page-title');

    // --- 인증 상태 감시 (Firebase Auth) ---
    ds.onAuthChange((user) => {
      if (user) {
        loginOverlay.style.display = 'none';
        adminContainer.style.display = 'flex';
        loadDashboardData();
      } else {
        loginOverlay.style.display = 'flex';
        adminContainer.style.display = 'none';
      }
    });

    const login = async () => {
      try {
        loginError.style.display = 'none';
        await ds.login(emailInput.value, pwdInput.value);
      } catch (error) {
        console.error("로그인 실패:", error);
        loginError.innerText = "이메일 또는 비밀번호가 올바르지 않습니다.";
        loginError.style.display = 'block';
      }
    };

    const logout = async () => {
      await ds.logout();
    };

    loginBtn.addEventListener('click', login);
    pwdInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') login(); });
    logoutBtn.addEventListener('click', logout);

    // --- 내비게이션 로직 ---
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        sections.forEach(s => s.style.display = 'none');
        document.getElementById(`section-${target}`).style.display = 'block';
        pageTitle.innerText = link.innerText;
        
        if (target === 'dashboard') loadDashboardData();
        if (target === 'notices') renderNotices();
        if (target === 'works') renderWorks();
        if (target === 'gallery') renderGallery();
      });
    });

    // --- 데이터 렌더링 로직 ---
    async function loadDashboardData() {
      const notices = await ds.getNotices();
      const works = await ds.getWorks();
      const gallery = await ds.getGallery();
      document.getElementById('stat-notices').innerText = notices.length;
      document.getElementById('stat-works').innerText = works.length;
      document.getElementById('stat-gallery').innerText = gallery.length;
    }

    async function renderNotices() {
      const listBody = document.getElementById('notice-list-body');
      listBody.innerHTML = '<tr><td colspan="3">로딩 중...</td></tr>';
      const data = await ds.getNotices();
      listBody.innerHTML = data.map(n => `
        <tr>
          <td>${n.date}</td>
          <td><strong>${n.title}</strong></td>
          <td><button class="btn-delete" onclick="deleteItem('notice', '${n.id}')">삭제</button></td>
        </tr>
      `).join('');
    }

    async function renderWorks() {
      const listBody = document.getElementById('work-list-body');
      listBody.innerHTML = '<tr><td colspan="4">로딩 중...</td></tr>';
      const data = await ds.getWorks();
      listBody.innerHTML = data.map(w => `
        <tr>
          <td><span class="badge">${w.category}</span></td>
          <td><strong>${w.title}</strong></td>
          <td>${w.author}</td>
          <td><button class="btn-delete" onclick="deleteItem('work', '${w.id}')">삭제</button></td>
        </tr>
      `).join('');
    }

    async function renderGallery() {
      const listBody = document.getElementById('gallery-list-body');
      listBody.innerHTML = '<tr><td colspan="4">로딩 중...</td></tr>';
      const data = await ds.getGallery();
      listBody.innerHTML = data.map(i => `
        <tr>
          <td>${i.type === 'photo' ? '🖼️ 사진' : '🎬 영상'}</td>
          <td><strong>${i.title}</strong></td>
          <td>${i.date}</td>
          <td><button class="btn-delete" onclick="deleteItem('gallery', '${i.id}')">삭제</button></td>
        </tr>
      `).join('');
    }

    // --- 등록 처리 (업로드 포함) ---
    document.getElementById('notice-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.innerText = "저장 중..."; btn.disabled = true;

      const title = document.getElementById('notice-title').value;
      const content = document.getElementById('notice-content').value;
      await ds.addNotice({ title, content });

      e.target.reset(); e.target.style.display = 'none';
      btn.innerText = "저장"; btn.disabled = false;
      renderNotices();
    });

    document.getElementById('work-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.innerText = "업로드 중..."; btn.disabled = true;

      const title = document.getElementById('work-title').value;
      const category = document.getElementById('work-category').value;
      const author = document.getElementById('work-author').value;
      const file = document.getElementById('work-file').files[0];

      const imageUrl = await ds.uploadFile(file, "works");
      await ds.addWork({ title, category, author, imageUrl, id: Date.now() });

      e.target.reset(); e.target.style.display = 'none';
      btn.innerText = "저장"; btn.disabled = false;
      renderWorks();
    });

    document.getElementById('gallery-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.innerText = "업로드 중..."; btn.disabled = true;

      const type = document.getElementById('gallery-type').value;
      const title = document.getElementById('gallery-title').value;
      const date = document.getElementById('gallery-date').value;
      const file = document.getElementById('gallery-file').files[0];

      const fileUrl = await ds.uploadFile(file, "gallery");
      await ds.addGalleryItem({ type, title, date, fileUrl });

      e.target.reset(); e.target.style.display = 'none';
      btn.innerText = "저장"; btn.disabled = false;
      renderGallery();
    });

    window.toggleForm = (id) => {
      const form = document.getElementById(id);
      form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    };

    window.deleteItem = async (type, id) => {
      if (!confirm('정말 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) return;
      if (type === 'notice') await ds.deleteNotice(id);
      if (type === 'work') await ds.deleteWork(id);
      if (type === 'gallery') await ds.deleteGalleryItem(id);
      
      if (target === 'dashboard') loadDashboardData();
      if (type === 'notice') renderNotices();
      if (type === 'work') renderWorks();
      if (type === 'gallery') renderGallery();
    };
  }
});
