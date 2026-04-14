/**
 * dataService.js - Firebase 마이그레이션 버전
 * 
 * 이제 실시간 데이터베이스(Firestore)와 파일 저장소(Storage)를 사용하여
 * 모든 데이터를 서버에 안전하게 저장합니다.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// 사용자께서 제공하신 Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyA5AD2p4btrWooqUSIj6MklPmHebYWUsvc",
  authDomain: "jb3d-a98fd.firebaseapp.com",
  projectId: "jb3d-a98fd",
  storageBucket: "jb3d-a98fd.firebasestorage.app",
  messagingSenderId: "947731275999",
  appId: "1:947731275999:web:784722d0a9051128bec96a",
  measurementId: "G-6JFTMFPXY4"
};

// 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const dataService = {
  // --- 공지사항 (Notices) ---
  async getNotices() {
    const q = query(collection(db, "notices"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addNotice(notice) {
    const newNotice = {
      date: new Date().toISOString().split('T')[0],
      isNew: true,
      ...notice
    };
    return await addDoc(collection(db, "notices"), newNotice);
  },

  async deleteNotice(id) {
    return await deleteDoc(doc(db, "notices", id));
  },

  // --- 작품 (Works) ---
  async getWorks() {
    const q = query(collection(db, "works"), orderBy("id", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addWork(work) {
    return await addDoc(collection(db, "works"), work);
  },

  async deleteWork(id) {
    return await deleteDoc(doc(db, "works", id));
  },

  // --- 갤러리 (Gallery) ---
  async getGallery() {
    const q = query(collection(db, "gallery"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addGalleryItem(item) {
    return await addDoc(collection(db, "gallery"), item);
  },

  async deleteGalleryItem(id) {
    return await deleteDoc(doc(db, "gallery", id));
  },

  // --- 파일 업로드 (Storage) ---
  async uploadFile(file, path) {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // --- 인증 (Auth) ---
  async login(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  async logout() {
    return await signOut(auth);
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// 전역 변수로 노출 (기존 스크립트 호환성)
window.dataService = dataService;
window.firebaseAuth = auth;
