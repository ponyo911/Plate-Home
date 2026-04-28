const state = {
  heroIndex: 0,
  heroSlides: [],
  heroTimer: null,
  data: null,
  products: [],
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./json/data.json");

    if (!res.ok) {
      throw new Error("JSON 파일을 불러오지 못했습니다.");
    }

    const data = await res.json();
    const preparedData = prepareData(data);

    state.data = preparedData;
    state.products = preparedData.allProducts;

    renderNav(preparedData.navigation);
    renderFooter(preparedData.footer);
    bindMobileMenu();

    if (document.getElementById("app")) {
      renderMainPage(preparedData);
    }

    if (document.getElementById("detailName")) {
      renderSubPage(preparedData);
    }
  } catch (error) {
    renderError(error.message);
    console.error(error);
  }
});

function prepareData(data) {
  const sectionConfig = [
    ["featured", "featured"],
    ["newItems", "new"],
    ["collection", "collection"],
    ["mug", "mug"],
    ["plate", "plate"],
    ["tableware", "tableware"],
  ];

  const allProducts = [];

  sectionConfig.forEach(([key, category]) => {
    const items = (data.sections[key] || []).map((item, index, arr) => {
      const id = createProductId(category, index + 1, item.name);
      const detailImages = buildDetailImages(item, arr);
      const detail = buildDetailContent(item, category);

      return {
        ...item,
        id,
        category,
        sectionKey: key,
        description: detail.description,
        specs: detail.specs,
        shipping: detail.shipping,
        guide: detail.guide,
        notice: detail.notice,
        relatedTitle: detail.relatedTitle,
        detailImages,
      };
    });

    data.sections[key] = items;
    allProducts.push(...items);
  });

  return {
    ...data,
    allProducts,
  };
}

function renderMainPage(data) {
  renderHero(data.hero);
  renderProductSection("featuredGrid", data.sections.featured);
  renderProductSection("newGrid", data.sections.newItems);
  renderBanner("wideBannerOne", data.banners.banner1);
  renderProductSection("collectionGrid", data.sections.collection);
  renderBanner("wideBannerTwo", data.banners.banner2);
  renderProductSection("mugGrid", data.sections.mug);
  renderBanner("wideBannerThree", data.banners.banner3);
  renderProductSection("plateGrid", data.sections.plate);
  renderBanner("wideBannerFour", data.banners.banner4);
  renderProductSection("tablewareGrid", data.sections.tableware);
  renderBanner("brandBanner", data.banners.brandBanner, true);
}

function renderSubPage(data) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const product = productId
    ? data.allProducts.find((item) => item.id === productId)
    : data.allProducts[0];

  if (!product) {
    document.body.innerHTML = `<div class="error-message">상품 정보를 찾을 수 없습니다.</div>`;
    return;
  }

  document.title = `${product.name} | PLATE & HOME`;
  fillStaticSubPage(product, data);
}

function fillStaticSubPage(product, data) {
  const relatedItems = data.allProducts
    .filter(
      (item) => item.category === product.category && item.id !== product.id,
    )
    .slice(0, 4);

  const detailImage = document.getElementById("detailImage");
  const detailThumb1 = document.getElementById("detailThumb1");
  const detailThumb2 = document.getElementById("detailThumb2");
  const detailThumb3 = document.getElementById("detailThumb3");

  const detailName = document.getElementById("detailName");
  const detailPrice = document.getElementById("detailPrice");
  const detailDesc = document.getElementById("detailDesc");
  const detailMaterial = document.getElementById("detailMaterial");
  const detailSize = document.getElementById("detailSize");
  const detailVolume = document.getElementById("detailVolume");
  const detailNotice = document.getElementById("detailNotice");
  const detailShipping = document.getElementById("detailShipping");
  const detailSpecName = document.getElementById("detailSpecName");

  const detailStack1 = document.getElementById("detailStack1");
  const detailStack2 = document.getElementById("detailStack2");
  const detailStack3 = document.getElementById("detailStack3");
  const detailStack4 = document.getElementById("detailStack4");
  const detailStack5 = document.getElementById("detailStack5");

  if (detailImage) {
    detailImage.src = product.image;
    detailImage.alt = product.name;
  }

  if (detailThumb1) {
    detailThumb1.src = product.image;
    detailThumb1.alt = `${product.name} 썸네일 1`;
  }

  if (detailThumb2) {
    detailThumb2.src = "img/sub1.jpg";
    detailThumb2.alt = `${product.name} 썸네일 2`;
  }

  if (detailThumb3) {
    detailThumb3.src = "img/sub2.png";
    detailThumb3.alt = `${product.name} 썸네일 3`;
  }

  if (detailStack1) detailStack1.src = "img/sub3.jpg";
  if (detailStack2) detailStack2.src = "img/sub4.jpg";
  if (detailStack3) detailStack3.src = "img/sub5.png";
  if (detailStack4) detailStack4.src = "img/sub6.jpg";
  if (detailStack5) detailStack5.src = "img/sub7.jpg";

  if (detailName) detailName.textContent = product.name;
  if (detailPrice) detailPrice.textContent = formatPrice(product.price);
  if (detailDesc) detailDesc.textContent = product.description;
  if (detailNotice) detailNotice.textContent = product.notice || product.guide;
  if (detailShipping) detailShipping.textContent = product.shipping;
  if (detailSpecName) detailSpecName.textContent = product.name;

  const materialSpec = product.specs.find((spec) => spec.label === "소재");
  const sizeSpec = product.specs.find((spec) => spec.label === "사이즈");
  const volumeSpec = product.specs.find((spec) => spec.label === "용도");

  if (detailMaterial)
    detailMaterial.textContent = materialSpec
      ? materialSpec.value
      : "도자기 / 세라믹";
  if (detailSize)
    detailSize.textContent = sizeSpec ? sizeSpec.value : "상세페이지 참고";
  if (detailVolume)
    detailVolume.textContent = volumeSpec
      ? volumeSpec.value
      : "데일리 테이블웨어";

  bindStaticThumbEvents(product);
  bindPurchaseEvents(product);
  renderStaticRelatedProducts(relatedItems);
}

function bindStaticThumbEvents(product) {
  const detailImage = document.getElementById("detailImage");
  const thumbs = [
    document.getElementById("detailThumb1"),
    document.getElementById("detailThumb2"),
    document.getElementById("detailThumb3"),
  ].filter(Boolean);

  if (!detailImage || thumbs.length === 0) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      detailImage.src = thumb.src;
      detailImage.alt = product.name;

      thumbs.forEach((item) => item.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  thumbs[0]?.classList.add("active");
}

function renderStaticRelatedProducts(items) {
  const relatedWrap = document.getElementById("relatedProducts");
  if (!relatedWrap) return;

  relatedWrap.innerHTML = items.map((item) => createProductCard(item)).join("");
}

function renderNav(navigation = []) {
  const navMenu = document.getElementById("navMenu");
  if (!navMenu) return;

  navMenu.innerHTML = navigation
    .map(
      (item) => `
        <li>
          <button type="button" class="nav-btn is-disabled" data-link="${item.link}">
            ${item.name}
          </button>
        </li>
      `,
    )
    .join("");

  navMenu.addEventListener("click", (event) => {
    const button = event.target.closest(".nav-btn");
    if (!button) return;
    event.preventDefault();
  });
}

function renderHero(heroData = []) {
  const heroSlidesEl = document.getElementById("heroSlides");
  const heroDotsEl = document.getElementById("heroDots");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");

  if (!heroSlidesEl || !heroDotsEl || !prevBtn || !nextBtn) return;

  state.heroSlides = heroData;

  heroSlidesEl.innerHTML = heroData
    .map(
      (slide, index) => `
        <article class="hero-slide ${index === 0 ? "active" : ""}">
          <img src="${slide.image}" alt="${slide.title}">
          <div class="hero-content">
            <div class="hero-kicker">${slide.kicker}</div>
            <h2 class="hero-title">${slide.title.replace(/\n/g, "<br>")}</h2>
            <p class="hero-subtitle">${slide.subtitle}</p>
            <button type="button" class="hero-btn" data-link="${slide.link}">${slide.buttonText}</button>
          </div>
        </article>
      `,
    )
    .join("");

  heroDotsEl.innerHTML = heroData
    .map(
      (_, index) => `
        <button
          class="hero-dot ${index === 0 ? "active" : ""}"
          data-index="${index}"
          aria-label="${index + 1}번 슬라이드"
        ></button>
      `,
    )
    .join("");

  updateHeroSlide(0);

  prevBtn.addEventListener("click", () => {
    moveHero(-1);
    restartHeroAutoSlide();
  });

  nextBtn.addEventListener("click", () => {
    moveHero(1);
    restartHeroAutoSlide();
  });

  heroDotsEl.addEventListener("click", (e) => {
    const dot = e.target.closest(".hero-dot");
    if (!dot) return;
    updateHeroSlide(Number(dot.dataset.index));
    restartHeroAutoSlide();
  });

  heroSlidesEl.addEventListener("click", (event) => {
    const button = event.target.closest(".hero-btn");
    if (!button) return;
    const target = document.querySelector(button.dataset.link);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  startHeroAutoSlide();
}

function updateHeroSlide(index) {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  state.heroIndex = index;
}

function moveHero(direction) {
  const total = state.heroSlides.length;
  if (!total) return;

  let nextIndex = state.heroIndex + direction;

  if (nextIndex < 0) nextIndex = total - 1;
  if (nextIndex >= total) nextIndex = 0;

  updateHeroSlide(nextIndex);
}

function startHeroAutoSlide() {
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    moveHero(1);
  }, 5000);
}

function restartHeroAutoSlide() {
  startHeroAutoSlide();
}

function renderProductSection(targetId, items = []) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = items.map((item) => createProductCard(item)).join("");
}

function createProductCard(item) {
  const hasDiscount = item.oldPrice && item.discount;
  const badgeHtml = item.badge
    ? `<span class="badge">${item.badge}</span>`
    : "";

  return `
    <a class="product-card" href="./sub.html?id=${item.id}">
      <div class="product-thumb">
        ${badgeHtml}
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-name">${item.name}</div>
        <div class="product-meta">
          <span class="price">${formatPrice(item.price)}</span>
          ${
            hasDiscount
              ? `
                <span class="old-price">${formatPrice(item.oldPrice)}</span>
                <span class="discount">${item.discount}%</span>
              `
              : ""
          }
        </div>
      </div>
    </a>
  `;
}

function formatPrice(price) {
  return `${Number(price).toLocaleString("ko-KR")}원`;
}

function renderBanner(targetId, bannerData, isBrand = false) {
  const target = document.getElementById(targetId);
  if (!target || !bannerData) return;

  target.style.backgroundImage = `url('${bannerData.image}')`;

  target.innerHTML = `
    <div class="banner-content">
      <div class="banner-kicker">${bannerData.kicker}</div>
      <h2 class="banner-title">${bannerData.title.replace(/\n/g, "<br>")}</h2>
      <p class="banner-desc">${bannerData.description}</p>
      ${
        isBrand
          ? `
            <div class="center-btn-wrap left-align">
              <a href="./index.html#featuredSection" class="hero-btn">${bannerData.buttonText}</a>
            </div>
          `
          : ""
      }
    </div>
  `;
}

function renderFooter(footerData) {
  const footer = document.getElementById("footer");
  if (!footer) return;

  footer.innerHTML = `
    <div class="footer-inner">
      <div>
        <div class="footer-brand">${footerData.brand}</div>
        <div class="footer-text">
          ${footerData.company}<br>
          대표: ${footerData.ceo}<br>
          사업자등록번호: ${footerData.businessNumber}<br>
          주소: ${footerData.address}<br>
          고객센터: ${footerData.tel}
        </div>
      </div>

      <div>
        <div class="footer-title">CUSTOMER</div>
        <ul class="footer-list">
          ${footerData.customer.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>

      <div>
        <div class="footer-title">ABOUT</div>
        <ul class="footer-list">
          ${footerData.about.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>

      <div>
        <div class="footer-title">POLICY</div>
        <ul class="footer-list">
          ${footerData.policy.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function bindMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const nav = document.getElementById("nav");

  if (!mobileMenuBtn || !nav) return;

  mobileMenuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
    mobileMenuBtn.classList.toggle("open");
  });
}

function bindPurchaseEvents(product) {
  const qtyInput = document.getElementById("quantity");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const totalPrice = document.getElementById("detailTotalPrice");
  const addCartBtn = document.querySelector(".btn-cart");
  const buyNowBtn = document.querySelector(".btn-buy");

  let quantity = qtyInput ? Number(qtyInput.value) || 1 : 1;

  const updateTotal = () => {
    if (qtyInput) qtyInput.value = quantity;
    if (totalPrice)
      totalPrice.textContent = formatPrice(product.price * quantity);
  };

  qtyMinus?.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updateTotal();
  });

  qtyPlus?.addEventListener("click", () => {
    quantity += 1;
    updateTotal();
  });

  qtyInput?.addEventListener("input", () => {
    const value = Number(qtyInput.value);
    quantity = value > 0 ? value : 1;
    updateTotal();
  });

  addCartBtn?.addEventListener("click", async () => {
    // 1. 브라우저 저장소에서 현재 로그인한 유저의 아이디를 가져옵니다.
    const userId = localStorage.getItem("userId");

    // 2. 비로그인 유저 차단 로직
    if (!userId) {
      alert("장바구니 기능은 로그인 후 이용 가능합니다.");
      window.location.href = "./login.html";
      return; // 코드를 여기서 중단합니다.
    }

    try {
      // 3. 백엔드로 보낼 데이터(payload)에 user_id를 반드시 포함합니다.
      const payload = {
        user_id: userId, // 핵심 추가 사항
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
      };
      console.log("프론트엔드에서 보내는 데이터:", payload);

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`${result.message}`);
      } else {
        console.error("백엔드 에러 상세:", result);
        alert(
          `장바구니 담기 실패!\n이유: ${JSON.stringify(result.detail, null, 2)}`,
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  });
  buyNowBtn?.addEventListener("click", () => {
    alert(
      `바로구매 페이지로 연결되는 자리입니다.\n상품명: ${product.name}\n결제금액: ${formatPrice(product.price * quantity)}`,
    );
  });

  updateTotal();
}

function renderError(message) {
  const app = document.getElementById("app");
  const errorMarkup = `<div class="error-message">오류가 발생했습니다. ${message}</div>`;
  if (app) app.innerHTML = errorMarkup;
}

function createProductId(category, index, name) {
  const safeName = name
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  return `${category}-${index}-${safeName}`;
}

function buildDetailImages(item, sectionItems) {
  const uniqueImages = [
    item.image,
    ...sectionItems.map((product) => product.image),
  ].filter((image, index, array) => image && array.indexOf(image) === index);

  return uniqueImages.slice(0, 5);
}

function buildDetailContent(item, category) {
  const categoryTextMap = {
    featured:
      "플레이트앤홈이 추천하는 대표 상품으로, 공간에 자연스럽게 어우러지는 실루엣과 편안한 사용감을 함께 담았습니다.",
    new: "새롭게 선보이는 시리즈로, 담백한 형태와 지금의 라이프스타일에 맞는 실용성을 중심으로 구성했습니다.",
    collection:
      "컬렉션 특유의 분위기와 디테일을 살린 제품으로, 테이블 전체의 무드를 정돈해 주는 존재감이 있습니다.",
    mug: "매일 손이 가는 머그로 사용할 때의 안정감과 오브제로 두었을 때의 감성을 동시에 고려해 구성했습니다.",
    plate:
      "음식을 깔끔하게 담아내는 접시로, 가벼운 상차림부터 포인트 플레이팅까지 자연스럽게 어울립니다.",
    tableware:
      "식탁 구성을 한 번에 완성할 수 있는 테이블웨어 제품으로, 일상 사용성과 정돈된 분위기를 함께 제안합니다.",
  };

  return {
    description:
      item.detailDescription ||
      categoryTextMap[category] ||
      "실용성과 디자인 균형에 초점을 맞춘 데일리 테이블웨어입니다.",

    specs: [
      { label: "상품명", value: item.name },
      { label: "판매가", value: formatPrice(item.price) },
      { label: "소재", value: item.material || "도자기 / 세라믹" },
      { label: "사이즈", value: item.size || "상세페이지 참고" },
      {
        label: "구성",
        value: item.components || "1개 또는 세트 구성 상세페이지 참조",
      },
      { label: "전자레인지", value: item.microwave || "사용 가능" },
      { label: "식기세척기", value: item.dishwasher || "권장 사용" },
      { label: "용도", value: item.volume || "데일리 테이블웨어" },
    ],

    shipping:
      item.shippingInfo ||
      "주문 확인 후 순차 출고되며 평균 1~3영업일 내 발송됩니다. 제주 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.",

    guide:
      item.returnInfo ||
      "단순 변심에 의한 교환 및 반품은 수령 후 7일 이내 가능합니다. 사용 흔적 또는 파손이 있는 경우 처리 제한이 있을 수 있습니다.",

    notice:
      item.notice ||
      "도자기 제품 특성상 미세한 점, 유약 흐름, 색상 차이는 자연스러운 현상일 수 있습니다.",

    relatedTitle: item.relatedTitle || "같이 보면 좋은 상품",
  };
}
