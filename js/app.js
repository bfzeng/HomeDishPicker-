const STORAGE_KEY = "homeDishPicker.customDishes";
const ROLLING_DURATION = 1200;
const ROLLING_INTERVAL = 80;

const defaultDishes = [
  { name: "番茄炒蛋", ingredients: ["番茄", "鸡蛋"] },
  { name: "青椒肉丝", ingredients: ["青椒", "猪肉"] },
  { name: "红烧茄子", ingredients: ["茄子"] },
  { name: "酸辣土豆丝", ingredients: ["土豆"] },
  { name: "麻婆豆腐", ingredients: ["豆腐", "肉末"] },
  { name: "可乐鸡翅", ingredients: ["鸡翅", "可乐"] },
  { name: "宫保鸡丁", ingredients: ["鸡胸肉", "花生", "黄瓜"] },
  { name: "蛋炒饭", ingredients: ["米饭", "鸡蛋"] },
  { name: "蒜蓉油麦菜", ingredients: ["油麦菜", "蒜"] },
  { name: "香菇滑鸡", ingredients: ["香菇", "鸡肉"] }
];

let dishes = [];
let fridgeIngredients = [];
let rollingTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  dishes = loadDishes();

  const elements = {
    pickButton: document.querySelector("#pick-button"),
    dishResult: document.querySelector("#dish-result"),
    tutorialLink: document.querySelector("#tutorial-link"),
    dishList: document.querySelector("#dish-list"),
    fridgeInput: document.querySelector("#fridge-input"),
    matchCount: document.querySelector("#match-count"),
    dishForm: document.querySelector("#dish-form"),
    dishNameInput: document.querySelector("#dish-name-input"),
    dishIngredientsInput: document.querySelector("#dish-ingredients-input"),
    formMessage: document.querySelector("#form-message")
  };

  renderDishList(elements);
  updateMatchCount(elements.matchCount);

  elements.fridgeInput.addEventListener("input", () => {
    fridgeIngredients = parseIngredients(elements.fridgeInput.value);
    renderDishList(elements);
    updateMatchCount(elements.matchCount);
  });

  elements.pickButton.addEventListener("click", () => {
    pickDishWithRollingEffect(elements);
  });

  elements.dishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addCustomDish(elements);
  });
});

function loadDishes() {
  let savedDishes = [];

  try {
    savedDishes = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    savedDishes = [];
  }

  return [...defaultDishes, ...savedDishes];
}

function saveCustomDishes(customDishes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customDishes));
}

function addCustomDish(elements) {
  const name = elements.dishNameInput.value.trim();
  const ingredients = parseIngredients(elements.dishIngredientsInput.value);

  if (!name) {
    showFormMessage(elements.formMessage, "请先填写菜名。", "error");
    return;
  }

  const dishExists = dishes.some((dish) => dish.name === name);

  if (dishExists) {
    showFormMessage(elements.formMessage, "抽签库里已经有这道菜了。", "error");
    return;
  }

  const newDish = { name, ingredients };
  const customDishes = dishes.filter((dish) => !defaultDishes.some((defaultDish) => defaultDish.name === dish.name));

  customDishes.push(newDish);
  saveCustomDishes(customDishes);

  dishes = [...defaultDishes, ...customDishes];
  elements.dishForm.reset();
  showFormMessage(elements.formMessage, `已添加：${name}`, "success");
  renderDishList(elements);
  updateMatchCount(elements.matchCount);
}

function pickDishWithRollingEffect(elements) {
  const candidates = getCandidateDishes();

  if (candidates.length === 0) {
    elements.dishResult.textContent = "没有匹配的菜，请补充食材或添加菜品";
    elements.tutorialLink.classList.add("hidden");
    return;
  }

  clearInterval(rollingTimer);
  elements.pickButton.disabled = true;
  elements.dishResult.classList.add("is-rolling");
  elements.tutorialLink.classList.add("hidden");

  rollingTimer = setInterval(() => {
    const rollingDish = pickRandomDish(candidates);
    elements.dishResult.textContent = rollingDish.name;
  }, ROLLING_INTERVAL);

  setTimeout(() => {
    clearInterval(rollingTimer);
    const finalDish = pickRandomDish(candidates);

    elements.dishResult.textContent = finalDish.name;
    elements.dishResult.classList.remove("is-rolling");
    elements.pickButton.textContent = "再抽一次";
    elements.pickButton.disabled = false;
    updateTutorialLink(elements.tutorialLink, finalDish.name);
  }, ROLLING_DURATION);
}

function getCandidateDishes() {
  if (fridgeIngredients.length === 0) {
    return dishes;
  }

  return dishes.filter((dish) => getMatchCount(dish) > 0);
}

function getMatchCount(dish) {
  return dish.ingredients.filter((ingredient) => {
    return fridgeIngredients.some((fridgeIngredient) => {
      return ingredient.includes(fridgeIngredient) || fridgeIngredient.includes(ingredient);
    });
  }).length;
}

function pickRandomDish(candidateDishes) {
  const randomIndex = Math.floor(Math.random() * candidateDishes.length);

  return candidateDishes[randomIndex];
}

function renderDishList(elements) {
  const candidates = getCandidateDishes();
  const fragment = document.createDocumentFragment();

  elements.dishList.innerHTML = "";

  dishes.forEach((dish) => {
    const item = document.createElement("li");
    const tutorialUrl = buildXiaohongshuSearchUrl(dish.name);
    const matchCount = getMatchCount(dish);
    const isMatched = fridgeIngredients.length === 0 || candidates.includes(dish);

    item.className = "dish-card";
    item.innerHTML = `
      <strong>${escapeHtml(dish.name)}</strong>
      <p class="ingredients">${dish.ingredients.length > 0 ? escapeHtml(dish.ingredients.join("、")) : "暂未填写食材"}</p>
      <div class="card-actions">
        <span class="match-badge">${getMatchLabel(matchCount, isMatched)}</span>
        <a href="${tutorialUrl}" target="_blank" rel="noreferrer">小红书教程</a>
      </div>
    `;

    fragment.appendChild(item);
  });

  elements.dishList.appendChild(fragment);
}

function updateMatchCount(matchCountElement) {
  const candidates = getCandidateDishes();

  if (fridgeIngredients.length === 0) {
    matchCountElement.textContent = "当前使用全部菜品抽签";
    return;
  }

  matchCountElement.textContent = `匹配到 ${candidates.length} 道可抽选菜品`;
}

function updateTutorialLink(linkElement, dishName) {
  linkElement.href = buildXiaohongshuSearchUrl(dishName);
  linkElement.textContent = `查看「${dishName}」小红书教程`;
  linkElement.classList.remove("hidden");
}

function buildXiaohongshuSearchUrl(dishName) {
  return `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${dishName} 教程`)}`;
}

function parseIngredients(value) {
  return value
    .split(/[、，,\s\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMatchLabel(matchCount, isMatched) {
  if (fridgeIngredients.length === 0) {
    return "可抽选";
  }

  if (!isMatched) {
    return "未匹配";
  }

  return `匹配 ${matchCount} 个食材`;
}

function showFormMessage(messageElement, text, type) {
  messageElement.textContent = text;
  messageElement.className = `form-message ${type}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
