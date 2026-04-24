/**
 * admin.js
 * Dashboard-only admin logic.
 */

document.addEventListener("DOMContentLoaded", () => {
  const wait = setInterval(() => {
    if (window.dataService) {
      clearInterval(wait);
      setupAdmin();
    }
  }, 100);
});

function setupAdmin() {
  const ds = window.dataService;

  const adminContainer = document.getElementById("admin-container");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".admin-section");
  const pageTitle = document.getElementById("page-title");
  const logoutBtn = document.getElementById("logout-btn");
  const noticeContent = document.getElementById("notice-content");
  const noticePreview = document.getElementById("notice-preview");

  let currentTarget = "dashboard";

  if (noticeContent && noticePreview && typeof marked !== "undefined") {
    noticeContent.addEventListener("input", () => {
      noticePreview.innerHTML = marked.parse(noticeContent.value || "");
    });
  }

  ds.onAuthChange((user) => {
    if (!user) {
      window.location.href = "admin_Login.html";
      return;
    }

    if (adminContainer) {
      adminContainer.style.display = "flex";
    }

    loadDashboardData();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await ds.logout();
      window.location.href = "admin_Login.html";
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      currentTarget = target;

      navLinks.forEach(item => item.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(section => (section.style.display = "none"));

      const section = document.getElementById(`section-${target}`);
      if (section) section.style.display = "block";
      if (pageTitle) pageTitle.innerText = link.innerText;

      if (target === "dashboard") loadDashboardData();
      if (target === "notices") renderNotices();
      if (target === "works") renderWorks();
      if (target === "gallery") renderGallery();
      if (target === "contacts") renderContacts();
      if (target === "schedule") renderSchedule();
    });
  });

  async function loadDashboardData() {
    try {
      const notices = await ds.getNotices();
      const works = await ds.getWorks();
      const gallery = await ds.getGallery();
      const contacts = await ds.getContacts();
      document.getElementById("stat-notices").innerText = notices.length;
      document.getElementById("stat-works").innerText = works.length;
      document.getElementById("stat-gallery").innerText = gallery.length;
      document.getElementById("stat-contacts").innerText = contacts.length;
    } catch (error) {
      console.error("Dashboard load failed:", error);
      alert("데이터를 불러오지 못했습니다. 서버 연결을 확인해주세요.");
    }
  }

  async function renderNotices() {
    try {
      const listBody = document.getElementById("notice-list-body");
      listBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
      const data = await ds.getNotices();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="3" style="text-align:center; color:#94a3b8;">공지사항이 없습니다.</td></tr>'
        : data.map(n => `
          <tr>
            <td>${n.date}</td>
            <td><strong>${n.title}</strong></td>
            <td><button class="btn-delete" onclick="deleteItem('notice', '${n.id}')">삭제</button></td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Notice load failed:", error);
      document.getElementById("notice-list-body").innerHTML = '<tr><td colspan="3" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderWorks() {
    try {
      const listBody = document.getElementById("work-list-body");
      listBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
      const data = await ds.getWorks();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">등록된 작품이 없습니다.</td></tr>'
        : data.map(w => `
          <tr>
            <td><span class="badge">${w.category}</span></td>
            <td><strong>${w.title}</strong></td>
            <td>${w.author}</td>
            <td><button class="btn-delete" onclick="deleteItem('work', '${w.id}')">삭제</button></td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Work load failed:", error);
      document.getElementById("work-list-body").innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderGallery() {
    try {
      const listBody = document.getElementById("gallery-list-body");
      listBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
      const data = await ds.getGallery();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">갤러리 항목이 없습니다.</td></tr>'
        : data.map(item => `
          <tr>
            <td>${item.type === "photo" ? "사진" : "영상"}</td>
            <td><strong>${item.title}</strong></td>
            <td>${item.date}</td>
            <td><button class="btn-delete" onclick="deleteItem('gallery', '${item.id}')">삭제</button></td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Gallery load failed:", error);
      document.getElementById("gallery-list-body").innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderContacts() {
    try {
      const listBody = document.getElementById("contact-list-body");
      listBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
      const data = await ds.getContacts();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">받은 문의가 없습니다.</td></tr>'
        : data.map(c => `
          <tr>
            <td>${c.date}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.email}</td>
            <td>${c.subject || "-"}</td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.message}</td>
            <td><button class="btn-delete" onclick="deleteItem('contact', '${c.id}')">삭제</button></td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Contact load failed:", error);
      document.getElementById("contact-list-body").innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  async function renderSchedule() {
    try {
      const listBody = document.getElementById("schedule-list-body");
      listBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
      const data = await ds.getSchedule();
      listBody.innerHTML = data.length === 0
        ? '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">등록된 일정이 없습니다.</td></tr>'
        : data.map(s => `
          <tr>
            <td>${s.month}</td>
            <td>${s.activity}</td>
            <td>${s.goal}</td>
            <td>${s.order || "-"}</td>
            <td>
              <button class="btn-delete" onclick="editSchedule('${s.id}', '${s.month.replace(/'/g, "\\'")}', '${s.activity.replace(/'/g, "\\'")}', '${s.goal.replace(/'/g, "\\'")}', ${s.order})">수정</button>
              <button class="btn-delete" onclick="deleteItem('schedule', '${s.id}')">삭제</button>
            </td>
          </tr>
        `).join("");
    } catch (error) {
      console.error("Schedule load failed:", error);
      document.getElementById("schedule-list-body").innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">데이터를 불러오지 못했습니다.</td></tr>';
    }
  }

  document.getElementById("notice-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const title = document.getElementById("notice-title").value;
      const content = document.getElementById("notice-content").value;
      if (!title.trim() || !content.trim()) {
        alert("제목과 내용을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }
      await ds.addNotice({ title, content });
      e.target.reset();
      e.target.style.display = "none";
      alert("공지사항이 저장되었습니다.");
      renderNotices();
    } catch (error) {
      console.error("Notice save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  document.getElementById("work-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const title = document.getElementById("work-title").value;
      const category = document.getElementById("work-category").value;
      const author = document.getElementById("work-author").value;
      const file = document.getElementById("work-file").files[0];

      if (!title.trim() || !category.trim() || !author.trim() || !file) {
        alert("모든 항목을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      const imageUrl = await ds.uploadFile(file, "works");
      await ds.addWork({ title, category, author, imageUrl, id: Date.now() });
      e.target.reset();
      e.target.style.display = "none";
      alert("작품이 저장되었습니다.");
      renderWorks();
    } catch (error) {
      console.error("Work save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  document.getElementById("gallery-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const type = document.getElementById("gallery-type").value;
      const title = document.getElementById("gallery-title").value;
      const date = document.getElementById("gallery-date").value;
      const file = document.getElementById("gallery-file").files[0];

      if (!type || !title.trim() || !date || !file) {
        alert("모든 항목을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      const fileUrl = await ds.uploadFile(file, "gallery");
      await ds.addGalleryItem({ type, title, date, fileUrl });
      e.target.reset();
      e.target.style.display = "none";
      alert("갤러리 항목이 저장되었습니다.");
      renderGallery();
    } catch (error) {
      console.error("Gallery save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  document.getElementById("schedule-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const scheduleId = document.getElementById("schedule-id").value;
    btn.innerText = "저장 중..."; btn.disabled = true;

    try {
      const month = document.getElementById("schedule-month").value.trim();
      const activity = document.getElementById("schedule-activity").value.trim();
      const goal = document.getElementById("schedule-goal").value.trim();
      const order = parseInt(document.getElementById("schedule-order").value);

      if (!month || !activity || !goal || !order) {
        alert("모든 항목을 입력해주세요.");
        btn.innerText = "저장"; btn.disabled = false;
        return;
      }

      const scheduleData = { month, activity, goal, order };
      if (scheduleId) {
        await ds.updateSchedule(scheduleId, scheduleData);
        alert("활동 일정이 수정되었습니다.");
      } else {
        await ds.addSchedule(scheduleData);
        alert("활동 일정이 저장되었습니다.");
      }

      e.target.reset();
      document.getElementById("schedule-id").value = "";
      e.target.style.display = "none";
      renderSchedule();
    } catch (error) {
      console.error("Schedule save failed:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      btn.innerText = "저장"; btn.disabled = false;
    }
  });

  window.toggleForm = (id) => {
    const form = document.getElementById(id);
    form.style.display = form.style.display === "none" ? "flex" : "none";
  };

  window.editSchedule = (id, month, activity, goal, order) => {
    document.getElementById("schedule-id").value = id;
    document.getElementById("schedule-month").value = month;
    document.getElementById("schedule-activity").value = activity;
    document.getElementById("schedule-goal").value = goal;
    document.getElementById("schedule-order").value = order;
    document.getElementById("schedule-form").style.display = "flex";
    document.getElementById("schedule-submit-btn").innerText = "수정하기";
  };

  window.resetScheduleForm = () => {
    document.getElementById("schedule-id").value = "";
    document.getElementById("schedule-form").reset();
    document.getElementById("schedule-submit-btn").innerText = "저장";
  };

  window.deleteItem = async (type, id) => {
    if (!confirm("정말 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)")) return;

    try {
      if (type === "notice") await ds.deleteNotice(id);
      if (type === "work") await ds.deleteWork(id);
      if (type === "gallery") await ds.deleteGalleryItem(id);
      if (type === "contact") await ds.deleteContact(id);
      if (type === "schedule") await ds.deleteSchedule(id);

      alert("삭제되었습니다.");

      if (currentTarget === "dashboard") loadDashboardData();
      if (type === "notice") renderNotices();
      if (type === "work") renderWorks();
      if (type === "gallery") renderGallery();
      if (type === "contact") renderContacts();
      if (type === "schedule") renderSchedule();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };
}
