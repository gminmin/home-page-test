function copyEmail() {
  const email = "contact@jb3d.xyz";
  const messageBox = document.getElementById("copyMessage");

  navigator.clipboard.writeText(email).then(() => {
    // 1. 메시지 박스 보여주기
    messageBox.classList.add("show");

    // 2. 2초 후에 자동으로 사라지게 하기
    setTimeout(() => {
      messageBox.classList.remove("show");
    }, 2000);
  }).catch(err => {
    console.error('복사 실패:', err);
  });
}
