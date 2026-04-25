/**
 * dataService.js - Firebase data access layer
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5AD2p4btrWooqUSIj6MklPmHebYWUsvc",
  authDomain: "jb3d-a98fd.firebaseapp.com",
  projectId: "jb3d-a98fd",
  storageBucket: "jb3d-a98fd.firebasestorage.app",
  messagingSenderId: "947731275999",
  appId: "1:947731275999:web:784722d0a9051128bec96a",
  measurementId: "G-6JFTMFPXY4"
};

const currentOrigin = window.location.origin;
let app;
let db;
let auth;
let storage;

function getFirebaseTroubleshootingHint(error) {
  const code = error?.code || "";

  if (code === "auth/unauthorized-domain") {
    return `현재 접속 도메인(${currentOrigin})이 Firebase Authentication 허용 도메인에 없습니다. Firebase Console > Authentication > Settings > Authorized domains에 이 도메인을 추가해주세요.`;
  }

  if (code === "permission-denied" || code === "storage/unauthorized") {
    return "Firebase 보안 규칙에서 현재 요청이 차단되었습니다. Firestore/Storage Rules를 다시 확인해주세요.";
  }

  if (code === "auth/network-request-failed") {
    return "네트워크 요청이 실패했습니다. GitHub Pages 주소가 HTTPS인지, 브라우저 확장 프로그램이 요청을 막지 않는지 확인해주세요.";
  }

  return "";
}

function logFirebaseHostingHints(error) {
  const code = error?.code || "unknown";
  const hint = getFirebaseTroubleshootingHint(error);

  console.group("[Firebase Debug]");
  console.log("Origin:", currentOrigin);
  console.log("Project ID:", firebaseConfig.projectId);
  console.log("Auth Domain:", firebaseConfig.authDomain);
  console.log("Error Code:", code);

  if (hint) {
    console.warn("Hint:", hint);
  }

  if (window.location.hostname.includes("github.io")) {
    console.warn(
      "GitHub Pages에서 접속 중입니다. Firebase Console의 Authorized domains에 현재 GitHub Pages 도메인이 등록되어 있는지 확인해주세요."
    );
  }

  console.groupEnd();
}

function wrapFirebaseError(prefix, error) {
  logFirebaseHostingHints(error);
  const hint = getFirebaseTroubleshootingHint(error);
  return new Error(`${prefix}: ${hint || error.message}`);
}

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log("Firebase initialized:", currentOrigin);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  logFirebaseHostingHints(error);
  alert(`Firebase 초기화에 실패했습니다.\n${getFirebaseTroubleshootingHint(error) || error.message}`);
}

const dataService = {
  async getNotices() {
    try {
      const q = query(collection(db, "notices"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Notice fetch failed:", error);
      throw wrapFirebaseError("공지사항을 불러오지 못했습니다", error);
    }
  },

  async addNotice(notice) {
    try {
      const newNotice = {
        date: new Date().toISOString().split("T")[0],
        isNew: true,
        ...notice
      };
      return await addDoc(collection(db, "notices"), newNotice);
    } catch (error) {
      console.error("Notice create failed:", error);
      throw wrapFirebaseError("공지사항 등록에 실패했습니다", error);
    }
  },

  async deleteNotice(id) {
    try {
      return await deleteDoc(doc(db, "notices", id));
    } catch (error) {
      console.error("Notice delete failed:", error);
      throw wrapFirebaseError("공지사항 삭제에 실패했습니다", error);
    }
  },

  async getWorks() {
    try {
      const q = query(collection(db, "works"), orderBy("id", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Work fetch failed:", error);
      throw wrapFirebaseError("작품을 불러오지 못했습니다", error);
    }
  },

  async addWork(work) {
    try {
      return await addDoc(collection(db, "works"), work);
    } catch (error) {
      console.error("Work create failed:", error);
      throw wrapFirebaseError("작품 등록에 실패했습니다", error);
    }
  },

  async deleteWork(id) {
    try {
      return await deleteDoc(doc(db, "works", id));
    } catch (error) {
      console.error("Work delete failed:", error);
      throw wrapFirebaseError("작품 삭제에 실패했습니다", error);
    }
  },

  async getGallery() {
    try {
      const q = query(collection(db, "gallery"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Gallery fetch failed:", error);
      throw wrapFirebaseError("갤러리를 불러오지 못했습니다", error);
    }
  },

  async addGalleryItem(item) {
    try {
      return await addDoc(collection(db, "gallery"), item);
    } catch (error) {
      console.error("Gallery create failed:", error);
      throw wrapFirebaseError("갤러리 등록에 실패했습니다", error);
    }
  },

  async deleteGalleryItem(id) {
    try {
      return await deleteDoc(doc(db, "gallery", id));
    } catch (error) {
      console.error("Gallery delete failed:", error);
      throw wrapFirebaseError("갤러리 삭제에 실패했습니다", error);
    }
  },

  async getContacts() {
    try {
      const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Contact fetch failed:", error);
      throw wrapFirebaseError("문의를 불러오지 못했습니다", error);
    }
  },

  async addContact(contact) {
    try {
      const newContact = {
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        ...contact
      };
      return await addDoc(collection(db, "contacts"), newContact);
    } catch (error) {
      console.error("Contact create failed:", error);
      throw wrapFirebaseError("문의 등록에 실패했습니다", error);
    }
  },

  async deleteContact(id) {
    try {
      return await deleteDoc(doc(db, "contacts", id));
    } catch (error) {
      console.error("Contact delete failed:", error);
      throw wrapFirebaseError("문의 삭제에 실패했습니다", error);
    }
  },

  async getSchedule() {
    try {
      const q = query(collection(db, "schedule"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("Schedule fetch failed:", error);
      throw wrapFirebaseError("일정을 불러오지 못했습니다", error);
    }
  },

  async addSchedule(schedule) {
    try {
      return await addDoc(collection(db, "schedule"), schedule);
    } catch (error) {
      console.error("Schedule create failed:", error);
      throw wrapFirebaseError("일정 등록에 실패했습니다", error);
    }
  },

  async updateSchedule(id, schedule) {
    try {
      return await updateDoc(doc(db, "schedule", id), schedule);
    } catch (error) {
      console.error("Schedule update failed:", error);
      throw wrapFirebaseError("일정 수정에 실패했습니다", error);
    }
  },

  async deleteSchedule(id) {
    try {
      return await deleteDoc(doc(db, "schedule", id));
    } catch (error) {
      console.error("Schedule delete failed:", error);
      throw wrapFirebaseError("일정 삭제에 실패했습니다", error);
    }
  },

  async uploadFile(file, path) {
    try {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("파일 크기는 10MB를 초과할 수 없습니다.");
      }

      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("File upload failed:", error);
      throw wrapFirebaseError("파일 업로드에 실패했습니다", error);
    }
  },

  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error("이메일과 비밀번호를 입력해주세요.");
      }
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed:", error);
      logFirebaseHostingHints(error);
      throw error;
    }
  },

  async logout() {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw wrapFirebaseError("로그아웃에 실패했습니다", error);
    }
  },

  onAuthChange(callback) {
    try {
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error("Auth state listener failed:", error);
      logFirebaseHostingHints(error);
      return undefined;
    }
  }
};

window.dataService = dataService;
window.firebaseAuth = auth;
window.firebaseDebugInfo = {
  origin: currentOrigin,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
};
