const STORAGE_KEY = "homeDishPicker.customDishes";
const ROLLING_DURATION = 1200;
const ROLLING_INTERVAL = 80;

const defaultDishes = [
  { name: "番茄炒蛋", ingredients: ["番茄", "鸡蛋"], category: "快手下饭" },
  { name: "青椒肉丝", ingredients: ["青椒", "猪肉"], category: "肉菜" },
  { name: "红烧茄子", ingredients: ["茄子", "蒜"], category: "素菜" },
  { name: "酸辣土豆丝", ingredients: ["土豆", "辣椒"], category: "素菜" },
  { name: "麻婆豆腐", ingredients: ["豆腐", "肉末"], category: "快手下饭" },
  { name: "可乐鸡翅", ingredients: ["鸡翅", "可乐"], category: "肉菜" },
  { name: "宫保鸡丁", ingredients: ["鸡胸肉", "花生", "黄瓜"], category: "肉菜" },
  { name: "蛋炒饭", ingredients: ["米饭", "鸡蛋"], category: "主食" },
  { name: "蒜蓉油麦菜", ingredients: ["油麦菜", "蒜"], category: "素菜" },
  { name: "香菇滑鸡", ingredients: ["香菇", "鸡肉"], category: "肉菜" }
];

const inspirationDishes = [
  { name: "蒜蓉西兰花", ingredients: ["西兰花", "蒜"], category: "素菜" },
  { name: "照烧鸡腿饭", ingredients: ["鸡腿", "米饭", "生抽"], category: "主食" },
  { name: "虾仁滑蛋", ingredients: ["虾仁", "鸡蛋"], category: "快手下饭" },
  { name: "葱油拌面", ingredients: ["面条", "小葱"], category: "主食" },
  { name: "韩式拌饭", ingredients: ["米饭", "鸡蛋", "蔬菜"], category: "主食" },
  { name: "口蘑炒牛肉", ingredients: ["口蘑", "牛肉"], category: "肉菜" },
  { name: "鱼香肉丝", ingredients: ["猪肉", "木耳", "胡萝卜"], category: "肉菜" },
  { name: "干锅花菜", ingredients: ["花菜", "五花肉"], category: "素菜" },
  { name: "咖喱鸡肉饭", ingredients: ["鸡肉", "土豆", "胡萝卜", "咖喱"], category: "主食" },
  { name: "肥牛金针菇", ingredients: ["肥牛", "金针菇"], category: "肉菜" },
  { name: "菠菜鸡蛋汤", ingredients: ["菠菜", "鸡蛋"], category: "汤羹" },
  { name: "冬瓜排骨汤", ingredients: ["冬瓜", "排骨"], category: "汤羹" }
];

let dishes = [];
let fridgeIngredients = [];
let rollingTimer = null;
let newDishRollingTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  dishes = loadDishes();

  const elements = {
    pickButton: document.querySelector("#pick-button"),
    dishResult: document.querySelector("#dish-result"),
    tutorialLink: document.querySelector("#tutorial-link"),
    newDishButton: document.querySelector("#new-dish-button"),
    newDishResult: document.querySelector("#new-dish-result"),
    newDishTutorialLink: document.querySelector("#new-dish-tutorial-link"),
    dishGroups: document.querySelector("#dish-groups"),
    fridgeInput: document.querySelector("#fridge-input"),
    matchCount: document.querySelector("#match-count"),
    dishForm: document.querySelector("#dish-form"),
    dishNameInput: document.querySelector("#dish-name-input"),
    dishIngredientsInput: document.querySelector("#dish-ingredients-input"),
    dishSuggestions: document.querySelector("#dish-suggestions"),
    formMessage: document.querySelector("#form-message")
  };

  renderDishSuggestions(elements.dishSuggestions);
  renderDishGroups(elements);
  updateMatchCount(elements.matchCount);

  elements.fridgeInput.addEventListener("input", () => {
    fridgeIngredients = parseIngredients(elements.fridgeInput.value);
    renderDishGroups(elements);
    updateMatchCount(elements.matchCount);
  });

  elements.pickButton.addEventListener("click", () => {
    const candidates = getCandidateDishes();

    rollToDish({
      candidates,
      button: elements.pickButton,
      result: elements.dishResult,
      tutorialLink: elements.tutorialLink,
      buttonTextAfterPick: "再抽一次",
      emptyText: "没有匹配的菜，请补充食材或添加菜品",
      timerName: "library"
    });
  });

  elements.newDishButton.addEventListener("click", () => {
    rollToDish({
      candidates: getNewDishCandidates(),
      button: elements.newDishButton,
      result: elements.newDishResult,
      tutorialLink: elements.newDishTutorialLink,
      buttonTextAfterPick: "再随机一道",
      emptyText: "暂时没有可推荐的新菜",
      timerName: "newDish"
    });
  });

  elements.dishNameInput.addEventListener("input", () => {
    autofillIngredients(elements);
  });

  elements.dishNameInput.addEventListener("change", () => {
    autofillIngredients(elements);
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

  const normalizedSavedDishes = savedDishes.map((dish) => normalizeDish(dish));

  return [...defaultDishes, ...normalizedSavedDishes];
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

  const suggestedDish = findDishSuggestion(name);
  const newDish = {
    name,
    ingredients,
    category: suggestedDish?.category || "我添加的菜"
  };
  const customDishes = getCustomDishes();

  customDishes.push(newDish);
  saveCustomDishes(customDishes);

  dishes = [...defaultDishes, ...customDishes];
  elements.dishForm.reset();
  showFormMessage(elements.formMessage, `已添加：${name}`, "success");
  renderDishGroups(elements);
  renderDishSuggestions(elements.dishSuggestions);
  updateMatchCount(elements.matchCount);
}

function autofillIngredients(elements) {
  const name = elements.dishNameInput.value.trim();
  const suggestion = findDishSuggestion(name);

  if (!suggestion) {
    return;
  }

  elements.dishIngredientsInput.value = suggestion.ingredients.join("、");
  showFormMessage(elements.formMessage, `已自动补充「${suggestion.name}」需要的食材。`, "success");
}

function rollToDish(options) {
  const {
    candidates,
    button,
    result,
    tutorialLink,
    buttonTextAfterPick,
    emptyText,
    timerName
  } = options;

  if (candidates.length === 0) {
    result.textContent = emptyText;
    tutorialLink.classList.add("hidden");
    return;
  }

  clearRollingTimer(timerName);
  button.disabled = true;
  result.classList.add("is-rolling");
  tutorialLink.classList.add("hidden");

  setRollingTimer(timerName, setInterval(() => {
    const rollingDish = pickRandomDish(candidates);
    result.textContent = rollingDish.name;
  }, ROLLING_INTERVAL));

  setTimeout(() => {
    clearRollingTimer(timerName);
    const finalDish = pickRandomDish(candidates);

    result.textContent = finalDish.name;
    result.classList.remove("is-rolling");
    button.textContent = buttonTextAfterPick;
    button.disabled = false;
    updateTutorialLink(tutorialLink, finalDish.name);
  }, ROLLING_DURATION);
}

function getCandidateDishes() {
  if (fridgeIngredients.length === 0) {
    return dishes;
  }

  return dishes.filter((dish) => getMatchCount(dish) > 0);
}

function getNewDishCandidates() {
  const allCandidates = [...dishes, ...inspirationDishes];
  const uniqueCandidates = new Map();

  allCandidates.forEach((dish) => {
    uniqueCandidates.set(dish.name, dish);
  });

  return Array.from(uniqueCandidates.values());
}

function getCustomDishes() {
  return dishes.filter((dish) => !defaultDishes.some((defaultDish) => defaultDish.name === dish.name));
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

function renderDishGroups(elements) {
  const candidates = getCandidateDishes();
  const groupedDishes = groupDishesByCategory(dishes);

  elements.dishGroups.innerHTML = "";

  Object.entries(groupedDishes).forEach(([category, categoryDishes], index) => {
    const group = document.createElement("details");
    const summary = document.createElement("summary");
    const list = document.createElement("ul");

    group.className = "dish-group";
    group.open = index === 0 || fridgeIngredients.length > 0;
    summary.textContent = `${category} · ${categoryDishes.length} 道`;
    list.className = "dish-grid";

    categoryDishes.forEach((dish) => {
      const item = document.createElement("li");
      const tutorialUrl = buildXiaohongshuSearchUrl(dish.name);
      const matchCount = getMatchCount(dish);
      const isMatched = fridgeIngredients.length === 0 || candidates.includes(dish);

      item.className = `dish-card${isMatched ? "" : " is-muted"}`;
      item.innerHTML = `
        <strong>${escapeHtml(dish.name)}</strong>
        <p class="ingredients">${dish.ingredients.length > 0 ? escapeHtml(dish.ingredients.join("、")) : "暂未填写食材"}</p>
        <div class="card-actions">
          <span class="match-badge">${getMatchLabel(matchCount, isMatched)}</span>
          <a href="${tutorialUrl}" target="_blank" rel="noreferrer">小红书教程</a>
        </div>
      `;

      list.appendChild(item);
    });

    group.appendChild(summary);
    group.appendChild(list);
    elements.dishGroups.appendChild(group);
  });
}

function renderDishSuggestions(datalistElement) {
  const suggestionNames = new Set();

  [...defaultDishes, ...inspirationDishes].forEach((dish) => {
    if (!dishes.some((savedDish) => savedDish.name === dish.name)) {
      suggestionNames.add(dish.name);
    }
  });

  datalistElement.innerHTML = "";
  suggestionNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    datalistElement.appendChild(option);
  });
}

function groupDishesByCategory(dishList) {
  return dishList.reduce((groups, dish) => {
    const category = dish.category || "我添加的菜";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(dish);
    return groups;
  }, {});
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

function findDishSuggestion(name) {
  const normalizedName = normalizeText(name);
  const suggestions = [...defaultDishes, ...inspirationDishes];

  return suggestions.find((dish) => normalizeText(dish.name) === normalizedName)
    || suggestions.find((dish) => normalizeText(dish.name).includes(normalizedName) && normalizedName.length >= 2);
}

function normalizeDish(dish) {
  const suggestion = findDishSuggestion(dish.name);

  return {
    name: dish.name,
    ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
    category: dish.category || suggestion?.category || "我添加的菜"
  };
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

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function clearRollingTimer(timerName) {
  if (timerName === "newDish") {
    clearInterval(newDishRollingTimer);
    return;
  }

  clearInterval(rollingTimer);
}

function setRollingTimer(timerName, timer) {
  if (timerName === "newDish") {
    newDishRollingTimer = timer;
    return;
  }

  rollingTimer = timer;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
