let DATA = {};
let IMAGES = {};
let CART = [];

// ======================
async function loadData() {
  const res1 = await fetch("./data.json");
  DATA = await res1.json();

  const res2 = await fetch("./images.json");
  IMAGES = await res2.json();

  renderAll();
}

// ======================
function renderAll() {
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  Object.keys(DATA.subcategories).forEach(sub => {

    const products = DATA.subcategories[sub].top_products
      .slice(0,5)
      .map(p => `
        <div class="card">

          <div class="thumb">
            <img class="thumbImg" src="${getImage(p)}"/>
          </div>

          <div class="cardBody">
            <div class="cardTitleLink">${p}</div>

            <button onclick="addToCart('${p.replace(/'/g, '\\\'')}')">Thêm vào giỏ</button>
            <button onclick="goDetail('${encodeURIComponent(p)}')">
          </div>

        </div>
      `).join("");

    container.innerHTML += `
      <h2>${sub}</h2>
      <div class="sub-row">${products}</div>
    `;
  });
}
function goDetail(name){
  window.location.href = `product.html?name=${name}`;
}
// ======================
// ADD TO CART
// ======================
function addToCart(product) {
  CART.push(product);
  renderCart();
  renderRecommendation();
}

// ======================
// RECOMMEND THEO ITEMSET
// ======================
function renderRecommendation() {

  if (CART.length === 0) return;

  const cartSubs = CART.map(p => findSub(p));

  const rules = DATA.rules;

  // tìm rule phù hợp
  const matched = rules.filter(r => {

    // antecedent phải nằm trong cart
    return r.antecedents.every(a => cartSubs.includes(a));
  });

  // sort theo confidence
  matched.sort((a,b) => b.confidence - a.confidence);

  // lấy top 2
  const top = matched.slice(0,2);

  let html = "";

  top.forEach(r => {
    r.consequents.forEach(sub => {

      const products =
        DATA.subcategories[sub].top_products.slice(0,2);

      products.forEach(p => {
        html += `<div>${p} (conf ${r.confidence.toFixed(2)})</div>`;
      });

    });
  });

  document.getElementById("recoList").innerHTML = html;
}
function renderCart() {
  document.getElementById("cartList").innerHTML =
    CART.map((p, i) => `
      <div class="cart-item">
        ${p}
        <button onclick="removeFromCart(${i})">❌</button>
      </div>
    `).join("");
}
function removeFromCart(index) {
  CART.splice(index, 1);
  renderCart();
  renderRecommendation();
}

// ======================
function getImage(name) {
  return IMAGES[name] || "https://via.placeholder.com/300";
}

// ======================
function renderAll() {
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  Object.keys(DATA.subcategories).forEach(sub => {

    const products = DATA.subcategories[sub].top_products
      .slice(0,5)
      .map(p => `
        <div class="card ecommerce-card">

          <div class="thumb">
            <img class="thumbImg" src="${getImage(p)}"/>
          </div>

          <div class="cardBody">

            <div class="productName">
              ${p}
            </div>

            <div class="productMeta">
              <span class="stars">★★★★★</span>
              <span class="sold">Đã bán 100+</span>
            </div>

            <div class="priceRow">
              <span class="price">${randomPrice()}</span>
              <span class="cartBtn" onclick="addToCart('${p.replace(/'/g, "\\'")}')">
                🛒
              </span>
            </div>

            <button class="buyBtn" onclick="goDetail('${p}')">
              Xem chi tiết
            </button>

          </div>

        </div>
      `).join("");

    container.innerHTML += `
      <div class="sub-section">
        <h2 class="sub-title">${sub}</h2>
        <div class="sub-row">${products}</div>
      </div>
    `;
  });
}

// fake giá cho đẹp UI
function randomPrice() {
  const price = Math.floor(Math.random() * 500 + 100) * 1000;
  return price.toLocaleString("vi-VN") + "đ";
}

// ======================
// ADD TO CART
// ======================
function addToCart(product) {
  CART.push(product);
  localStorage.setItem('cart', JSON.stringify(CART));
  renderCart();
  renderRecommendation();
}
// ======================
// RECOMMEND THEO ITEMSET
// ======================
function renderRecommendation() {

  if (CART.length === 0) {
    document.getElementById("recoList").innerHTML =
      "<div class='mutedText'>Chọn sản phẩm để xem gợi ý</div>";
    return;
  }

  const cartSubs = CART.map(p => findSub(p));
  const rules = DATA.rules;

  const matched = rules.filter(r =>
    r.antecedents.every(a => cartSubs.includes(a))
  );

  matched.sort((a,b) => b.confidence - a.confidence);

  const top = matched.slice(0,2);

  let html = "";

  top.forEach(r => {
    r.consequents.forEach(sub => {

      const products = DATA.subcategories[sub].top_products.slice(0,2);

      products.forEach(p => {
        html += `
          <div class="recoCard">

            <img src="${getImage(p)}" class="recoImg"/>

            <div class="recoInfo">
              <div class="recoName">${p}</div>
              <div class="recoPrice">${randomPrice()}</div>
            </div>

          </div>
        `;
      });

    });
  });

  document.getElementById("recoList").innerHTML = html;
}

// ======================
// RECOMMEND MULTI
// ======================
function renderRecommendation(){

  if(CART.length === 0){
    document.getElementById("recoList").innerHTML =
      "Chọn sản phẩm để xem gợi ý";
    return;
  }

  const lastProduct = CART[CART.length - 1];
  const sub = findSub(lastProduct);

  const rules = DATA.subcategories[sub].rules;

  if (!rules || rules.length === 0) return;

  const bestRule = rules[0];
  const targetSub = bestRule.target_subcategory;

  const products =
    DATA.subcategories[targetSub].top_products.slice(0, 2);

  let html = "";

  products.forEach(p => {

    const img = getImage(p); // 🔥 lấy ảnh từ images.json

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
function getImage(name){
  return IMAGES[name] || "https://via.placeholder.com/100";
}
// ======================
function findSub(product) {
  for (let sub in DATA.subcategories) {
    if (DATA.subcategories[sub].top_products.includes(product)) {
      return sub;
    }
  }
}
let searchKeyword = "";
// ======================
function goDetail(product) {
  window.location.href = `product.html?name=${encodeURIComponent(product)}`;
}
function searchProducts(value) {
  keyword = value.toLowerCase();
  render();
}
function filterBySubCategory(cat) {
  selectedCategory = cat;
  render();
}
function renderMenu() {
  const menu = document.getElementById("menu");

  let html = `
    <button onclick="filterBySubCategory('All')">Tất cả</button>
  `;

  Object.keys(DATA.subcategories).forEach(sub => {
    html += `
      <button onclick="filterBySubCategory('${sub}')">
        ${sub}
      </button>
    `;
  });

  menu.innerHTML = html;
}
function filterBySubCategory(cat) {
  selectedCategory = cat;
  render();
}
function filterBySubCategory(cat) {
  selectedCategory = cat;

  // highlight active
  document.querySelectorAll(".menu button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.innerText === cat || (cat==="All" && btn.innerText==="Tất cả")) {
      btn.classList.add("active");
    }
  });

  render();
}
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.querySelector(".dots");

// tạo dots
slides.forEach((_, i) => {
  const dot = document.createElement("span");
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".dots span");

function showSlide(index) {
  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");

  currentSlide = index;
}

function nextSlide() {
  let next = (currentSlide + 1) % slides.length;
  showSlide(next);
}

function prevSlide() {
  let prev = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(prev);
}

function goToSlide(i){
  showSlide(i);
}

// auto chạy
setInterval(nextSlide, 4000);

// nút
document.querySelector(".next").onclick = nextSlide;
document.querySelector(".prev").onclick = prevSlide;
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchKeyword = e.target.value.toLowerCase();
  render();
});
// init
showSlide(0);
function render() {
  const container = document.getElementById("productContainer");

  let html = "";

  Object.keys(DATA.subcategories).forEach(sub => {

    // filter category
    if (selectedCategory !== "All" && sub !== selectedCategory) return;

    let products = DATA.subcategories[sub].top_products;

    // 🔥 filter search
    if (searchKeyword) {
      products = products.filter(p =>
        p.toLowerCase().includes(searchKeyword)
      );
    }

    if (products.length === 0) return;

    html += `<h2>${sub}</h2>`;
    html += `<div class="grid">`;

    products.forEach(p => {

      const img = getImage(p);

      html += `
        <div class="card">
          <img src="${img}" class="thumbImg"/>
          <div class="cardBody">
            <div class="cardTitle">${p}</div>
            <button onclick="goDetail('${p}')">
              Xem chi tiết
            </button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
}
// ======================
loadData();
