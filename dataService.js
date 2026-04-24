/**
 * dataService.js - Firebase data access layer
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
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

let app, db, auth, storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  console.log("Firebase initialized");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  alert("Firebase 초기화에 실패했습니다. 관리자에게 문의해주세요.");
}

const dataService = {
  async getNotices() {
    try {
      const q = query(collection(db, "notices"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("공지사항 조회 실패:", error);
      throw new Error("공지사항을 불러오지 못했습니다: " + error.message);
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
      console.error("공지사항 추가 실패:", error);
      throw new Error("공지사항 저장에 실패했습니다: " + error.message);
    }
  },

  async deleteNotice(id) {
    try {
      return await deleteDoc(doc(db, "notices", id));
    } catch (error) {
      console.error("공지사항 삭제 실패:", error);
      throw new Error("공지사항 삭제에 실패했습니다: " + error.message);
    }
  },

  async getWorks() {
    try {
      const q = query(collection(db, "works"), orderBy("id", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("작품 조회 실패:", error);
      throw new Error("작품을 불러오지 못했습니다: " + error.message);
    }
  },

  async addWork(work) {
    try {
      return await addDoc(collection(db, "works"), work);
    } catch (error) {
      console.error("작품 추가 실패:", error);
      throw new Error("작품 저장에 실패했습니다: " + error.message);
    }
  },

  async deleteWork(id) {
    try {
      return await deleteDoc(doc(db, "works", id));
    } catch (error) {
      console.error("작품 삭제 실패:", error);
      throw new Error("작품 삭제에 실패했습니다: " + error.message);
    }
  },

  async getGallery() {
    try {
      const q = query(collection(db, "gallery"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("갤러리 조회 실패:", error);
      throw new Error("갤러리를 불러오지 못했습니다: " + error.message);
    }
  },

  async addGalleryItem(item) {
    try {
      return await addDoc(collection(db, "gallery"), item);
    } catch (error) {
      console.error("갤러리 추가 실패:", error);
      throw new Error("갤러리 저장에 실패했습니다: " + error.message);
    }
  },

  async deleteGalleryItem(id) {
    try {
      return await deleteDoc(doc(db, "gallery", id));
    } catch (error) {
      console.error("갤러리 삭제 실패:", error);
      throw new Error("갤러리 삭제에 실패했습니다: " + error.message);
    }
  },

  async getContacts() {
    try {
      const q = query(collection(db, "contacts"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("문의 조회 실패:", error);
      throw new Error("문의를 불러오지 못했습니다: " + error.message);
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
      console.error("문의 추가 실패:", error);
      throw new Error("문의 저장에 실패했습니다: " + error.message);
    }
  },

  async deleteContact(id) {
    try {
      return await deleteDoc(doc(db, "contacts", id));
    } catch (error) {
      console.error("문의 삭제 실패:", error);
      throw new Error("문의 삭제에 실패했습니다: " + error.message);
    }
  },

  async getSchedule() {
    try {
      const q = query(collection(db, "schedule"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    } catch (error) {
      console.error("일정 조회 실패:", error);
      throw new Error("일정을 불러오지 못했습니다: " + error.message);
    }
  },

  async addSchedule(schedule) {
    try {
      return await addDoc(collection(db, "schedule"), schedule);
    } catch (error) {
      console.error("일정 추가 실패:", error);
      throw new Error("일정 저장에 실패했습니다: " + error.message);
    }
  },

  async updateSchedule(id, schedule) {
    try {
      return await updateDoc(doc(db, "schedule", id), schedule);
    } catch (error) {
      console.error("일정 수정 실패:", error);
      throw new Error("일정 수정에 실패했습니다: " + error.message);
    }
  },

  async deleteSchedule(id) {
    try {
      return await deleteDoc(doc(db, "schedule", id));
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      throw new Error("일정 삭제에 실패했습니다: " + error.message);
    }
  },

  async uploadFile(file, path) {
    try {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("파일 크기는 10MB를 넘을 수 없습니다.");
      }

      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      throw new Error("파일 업로드에 실패했습니다: " + error.message);
    }
  },

  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error("이메일과 비밀번호를 입력해주세요.");
      }
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  },

  async logout() {
    try {
      return await signOut(auth);
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw new Error("로그아웃에 실패했습니다: " + error.message);
    }
  },

  onAuthChange(callback) {
    try {
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error("인증 상태 감시 실패:", error);
    }
  }
};

window.dataService = dataService;
window.firebaseAuth = auth;
