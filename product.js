// ======================
// GLOBAL
// ======================
let DATA = {};
let IMAGES = {};
let productName = "";

// ======================
// INIT
// ======================
async function init() {
  try {
    // lấy product từ URL
    const urlParams = new URLSearchParams(window.location.search);
    productName = decodeURIComponent(urlParams.get("name") || "");

    if (!productName) {
      showError("Không tìm thấy sản phẩm");
      return;
    }

    // load data
    const res1 = await fetch("./data.json");
    DATA = await res1.json();

    const res2 = await fetch("./images.json");
    IMAGES = await res2.json();

    renderProduct();
    renderRecommendation();

  } catch (err) {
    console.error(err);
    showError("Lỗi tải dữ liệu");
  }
}

// ======================
// UTIL
// ======================
function getImage(name) {
  return IMAGES[name] || "https://via.placeholder.com/400?text=No+Image";
}

function findSub(product) {
  for (let sub in DATA.subcategories) {
    if (DATA.subcategories[sub].top_products.includes(product)) {
      return sub;
    }
  }
  return null;
}

function randomPrice() {
  return (Math.floor(Math.random() * 500) + 100) + ".000đ";
}

function showError(msg) {
  document.getElementById("productDetail").innerHTML = `
    <div style="padding:20px">${msg}</div>
  `;
}

// ======================
// RENDER PRODUCT
// ======================
function renderProduct() {
  const sub = findSub(productName);
  const img = getImage(productName);

  document.getElementById("productDetail").innerHTML = `
    <div class="detailCard">

      <div class="detailHero">
        <img src="${img}" class="detailImg"/>
      </div>

      <div class="detailBody">

        <h2 class="detailTitle">${productName}</h2>

        <div class="detailMeta">
          📦 ${sub || "Không xác định"}
        </div>

        <div class="productMeta">
          ⭐⭐⭐⭐⭐ | Đã bán 200+
        </div>

        <div class="detailPrice">
          ${randomPrice()}
        </div>

        <p class="detailDesc">
          Đây là sản phẩm thuộc danh mục <b>${sub}</b>.
          Hệ thống gợi ý sử dụng Association Rules từ dataset Superstore.
        </p>

        <div class="detailActions">
          <button class="buyBtn" onclick="addToCart('${productName}')">
            🛒 Thêm vào giỏ
          </button>
          <a href="index.html">← Quay lại</a>
        </div>

      </div>

    </div>
  `;
}

// ======================
// RENDER RECOMMENDATION
// ======================
function renderRecommendation() {

  const sub = findSub(productName);

  if (!sub) {
    document.getElementById("recoList").innerHTML = "Không có gợi ý";
    return;
  }

  const rules = DATA.subcategories[sub].rules;

  if (!rules || rules.length === 0) {
    document.getElementById("recoList").innerHTML = "Không có gợi ý phù hợp";
    return;
  }

  // 👉 chỉ lấy rule mạnh nhất
  const bestRule = rules[0];

  const targetSub = bestRule.target_subcategory;

  const products =
    DATA.subcategories[targetSub].top_products.slice(0, 2);

  let html = "";

  products.forEach(p => {
    const img = getImage(p);

    html += `
      <div class="recoCard">

        <img src="${img}" class="recoImg"/>

        <div class="recoInfo">
          <div class="recoName">${p}</div>
          <div class="recoMeta">
            ✨ ${targetSub} | conf ${bestRule.confidence.toFixed(2)}
          </div>
        </div>

      </div>
    `;
  });

  document.getElementById("recoList").innerHTML = html;
}

// ======================
// CART (OPTIONAL)
// ======================
function addToCart(product) {
  alert("Đã thêm vào giỏ: " + product);
}

// ======================
// RUN
// ======================
init();
