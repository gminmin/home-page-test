# Firebase Firestore 보안 규칙 설정 가이드

## 현재 상황
현재 데이터가 저장되지 않고 로드되지 않는 이유는 **Firestore 보안 규칙**이 제대로 설정되지 않았기 때문일 가능성이 높습니다.

## 필수 설정 단계

### 1. Firebase Console 접속
1. https://console.firebase.google.com 방문
2. 프로젝트 선택: **jb3d-a98fd**

### 2. Firestore Database 보안 규칙 설정
1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. 상단 탭에서 **Rules** 클릭
3. 다음 규칙을 복사해서 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 모든 데이터 읽기/쓰기 가능
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. **Publish** 버튼 클릭

### 3. Collections 생성
Firestore가 자동으로 생성되지 않을 경우 수동으로 생성:

1. **Start collection** 클릭
2. 컬렉션 ID 입력:
   - `notices`
   - `works`
   - `gallery`
3. 각 컬렉션에 문서 추가

### 4. Storage 보안 규칙 설정
1. 왼쪽 메뉴에서 **Storage** 클릭
2. **Rules** 탭 클릭
3. 다음 규칙을 적용:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. **Publish** 버튼 클릭

또는 더 간단하게 인증된 사용자만:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Authentication 설정
1. 왼쪽 메뉴에서 **Authentication** 클릭
2. **Sign-in method** 탭 클릭
3. **Email/Password** 활성화

### 6. 관리자 계정 생성
1. **Users** 탭에서 **Create user** 클릭
2. 이메일과 비밀번호 설정
   - 예: `admin@jb3d.xyz` / `암호123!`
3. **Create** 클릭

## 테스트 방법

### 1. 관리자 페이지 접속
- `admin.html` 페이지로 이동
- 위에서 생성한 계정으로 로그인
- 대시보드에 데이터가 표시되는지 확인

### 2. 공지사항 추가 테스트
1. "공지사항 관리" 탭 클릭
2. "+ 공지 추가" 버튼 클릭
3. 제목과 내용 입력 후 저장
4. 콘솔에 에러가 없는지 확인

### 3. 메인 페이지 데이터 확인
- `index.html` 페이지 새로고침
- 공지사항 미리보기 섹션에 저장한 공지가 표시되는지 확인

## 자주 발생하는 문제 해결

### 에러: "Permission denied"
- Firestore 보안 규칙을 다시 확인하세요.
- Publish를 클릭했는지 확인하세요.

### 에러: "Collection not found"
- Firebase Console에서 컬렉션을 수동으로 생성하세요.

### 에러: "User not found"
- 로그인한 이메일과 비밀번호가 정확한지 확인하세요.

### 브라우저 콘솔 확인
F12를 눌러 개발자 도구를 열고 **Console** 탭에서 오류 메시지를 확인하세요.

## 보안 주의사항

현재 Firebase 보안 규칙은 테스트용입니다.
프로덕션 배포 전에 다음을 권장합니다:
- 환경 변수로 Firebase 설정 관리
- 보안 규칙을 더 세밀하게 설정
- 클라이언트/서버 분리

## 참고 자료

- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage 보안 규칙](https://firebase.google.com/docs/storage/security/start)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
