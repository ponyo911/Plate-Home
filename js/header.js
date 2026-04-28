// 모든 페이지에서 공통으로 사용할 헤더 갱신 로직
document.addEventListener("DOMContentLoaded", async () => {
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");
  const headerLinks = document.querySelector(".header-links");

  if (userName && headerLinks) {
    let cartCount = 0;
    if (userId) {
      try {
        const response = await fetch(`/api/cart?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          cartCount = data.total_items;
        }
      } catch (error) {
        console.error("장바구니 로드 실패:", error);
      }
    }

    const adminMenu =
      userRole === "admin"
        ? `<a href="./admin.html" style="color: #e74c3c; font-weight: 700; text-decoration: none;">[관리자 모드]</a>`
        : "";

    headerLinks.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; font-size: 14px;">
                <span><strong>${userName}</strong>님</span>
                ${adminMenu}
                <a href="./cart.html" style="color: #111; text-decoration: none; font-weight: 500; display: flex; align-items: center;">
                    장바구니 
                    <span style="background: #e74c3c; color: #fff; border-radius: 50%; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; margin-left: 6px; font-weight: bold;">
                        ${cartCount}
                    </span>
                </a>
                <a href="./order_list.html" style="color: #111; text-decoration: none; font-weight: 500;">주문내역</a>
                <button onclick="logout()" style="background: none; border: 1px solid #ccc; padding: 4px 10px; cursor: pointer; font-size: 12px; border-radius: 4px;">로그아웃</button>
            </div>
        `;
  }
});

function logout() {
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  alert("로그아웃 되었습니다.");
  window.location.href = "./index.html";
}
