let DATA = {};
let IMAGES = {};

async function load() {
  const res1 = await fetch("./data.json");
  DATA = await res1.json();

  const res2 = await fetch("./images.json");
  IMAGES = await res2.json();

  render();
}

function getQuery() {
  return new URL(window.location.href).searchParams.get("name");
}

function render() {
  const name = getQuery();

  document.getElementById("productDetail").innerHTML = `
    <div class="detailCard">

      <div class="detailHero">
        <img src="${IMAGES[name] || ""}" class="detailImg"/>
      </div>

      <div class="detailBody">

        <h2 class="detailTitle">${name}</h2>

        <div class="productMeta">
          ⭐⭐⭐⭐⭐ | Đã bán 200+
        </div>

        <div class="detailPrice">
          ${randomPrice()}
        </div>

        <p class="detailDesc">
          Sản phẩm chất lượng cao, phù hợp cho nhu cầu sử dụng hàng ngày.
        </p>

        <div class="detailActions">
          <button class="buyBtn">Mua ngay</button>
          <a href="index.html">← Quay lại</a>
        </div>

      </div>

    </div>
  `;
}

  // sản phẩm
  document.getElementById("productDetail").innerHTML = `
    <h2>${name}</h2>
    <img src="${IMAGES[name] || ""}" width="300"/>
  `;

  // recommend
  let html = "";

  rules.slice(0,2).forEach(r => {
    const products =
      DATA.subcategories[r.target_subcategory].top_products.slice(0,2);

    products.forEach(p => {
      html += `<div>${p}</div>`;
    });
  });

  document.getElementById("recoList").innerHTML = html;


function findSub(product) {
  for (let sub in DATA.subcategories) {
    if (DATA.subcategories[sub].top_products.includes(product)) {
      return sub;
    }
  }
}

load();