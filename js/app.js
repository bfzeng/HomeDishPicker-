const STORAGE_KEY = "homeDishPicker.customDishes";
const HISTORY_KEY = "homeDishPicker.drawHistory";
const ROLLING_DURATION = 1200;
const ROLLING_INTERVAL = 80;
const MAX_HISTORY = 12;

const quickIngredients = ["鸡蛋", "番茄", "土豆", "青椒", "豆腐", "猪肉", "鸡肉", "蒜", "米饭", "面条", "香菇", "虾仁"];

const defaultDishes = [
  { name: "番茄炒蛋", ingredients: ["番茄", "鸡蛋"], category: "快手下饭", status: "常吃", note: "经典快手菜" },
  { name: "青椒肉丝", ingredients: ["青椒", "猪肉"], category: "肉菜", status: "已做过", note: "适合配米饭" },
  { name: "红烧茄子", ingredients: ["茄子", "蒜"], category: "素菜", status: "已做过", note: "下饭" },
  { name: "酸辣土豆丝", ingredients: ["土豆", "辣椒"], category: "素菜", status: "常吃", note: "快手" },
  { name: "麻婆豆腐", ingredients: ["豆腐", "肉末"], category: "快手下饭", status: "已做过", note: "偏辣" },
  { name: "可乐鸡翅", ingredients: ["鸡翅", "可乐"], category: "肉菜", status: "已做过", note: "周末菜" },
  { name: "宫保鸡丁", ingredients: ["鸡胸肉", "花生", "黄瓜"], category: "肉菜", status: "已做过", note: "酸甜口" },
  { name: "蛋炒饭", ingredients: ["米饭", "鸡蛋"], category: "主食", status: "常吃", note: "处理剩饭" },
  { name: "蒜蓉油麦菜", ingredients: ["油麦菜", "蒜"], category: "素菜", status: "常吃", note: "清爽" },
  { name: "香菇滑鸡", ingredients: ["香菇", "鸡肉"], category: "肉菜", status: "想尝试", note: "适合带饭" }
];

const inspirationDishes = [
  { name: "蒜蓉西兰花", ingredients: ["西兰花", "蒜"], category: "素菜", status: "想尝试", note: "清爽快手" },
  { name: "照烧鸡腿饭", ingredients: ["鸡腿", "米饭", "生抽"], category: "主食", status: "想尝试", note: "适合带饭" },
  { name: "虾仁滑蛋", ingredients: ["虾仁", "鸡蛋"], category: "快手下饭", status: "想尝试", note: "嫩滑" },
  { name: "葱油拌面", ingredients: ["面条", "小葱"], category: "主食", status: "想尝试", note: "10 分钟" },
  { name: "韩式拌饭", ingredients: ["米饭", "鸡蛋", "蔬菜"], category: "主食", status: "想尝试", note: "一碗饭" },
  { name: "口蘑炒牛肉", ingredients: ["口蘑", "牛肉"], category: "肉菜", status: "想尝试", note: "香气足" },
  { name: "鱼香肉丝", ingredients: ["猪肉", "木耳", "胡萝卜"], category: "肉菜", status: "想尝试", note: "下饭" },
  { name: "干锅花菜", ingredients: ["花菜", "五花肉"], category: "素菜", status: "想尝试", note: "微辣" },
  { name: "咖喱鸡肉饭", ingredients: ["鸡肉", "土豆", "胡萝卜", "咖喱"], category: "主食", status: "想尝试", note: "一锅出" },
  { name: "肥牛金针菇", ingredients: ["肥牛", "金针菇"], category: "肉菜", status: "想尝试", note: "快手" },
  { name: "菠菜鸡蛋汤", ingredients: ["菠菜", "鸡蛋"], category: "汤羹", status: "想尝试", note: "清淡" },
  { name: "冬瓜排骨汤", ingredients: ["冬瓜", "排骨"], category: "汤羹", status: "想尝试", note: "适合周末" }
];

let dishes = [];
let fridgeIngredients = [];
let drawHistory = [];
let noRepeatNames = [];
let rollingTimer = null;
let newDishRollingTimer = null;
let lastNewDish = null;

document.addEventListener("DOMContentLoaded", () => {
  dishes = loadDishes();
  drawHistory = loadHistory();

  const elements = getElements();

  renderAll(elements);
  bindEvents(elements);
});

function getElements() {
  return {
    pickButton: document.querySelector("#pick-button"),
    dishResult: document.querySelector("#dish-result"),
    tutorialLink: document.querySelector("#tutorial-link"),
    noRepeatToggle: document.querySelector("#no-repeat-toggle"),
    newDishButton: document.querySelector("#new-dish-button"),
    newDishResult: document.querySelector("#new-dish-result"),
    newDishTutorialLink: document.querySelector("#new-dish-tutorial-link"),
    newDishCategory: document.querySelector("#new-dish-category"),
    saveNewDishButton: document.querySelector("#save-new-dish-button"),
    dishGroups: document.querySelector("#dish-groups"),
    quickIngredientTags: document.querySelector("#quick-ingredient-tags"),
    fridgeInput: document.querySelector("#fridge-input"),
    clearFridgeButton: document.querySelector("#clear-fridge-button"),
    matchCount: document.querySelector("#match-count"),
    dishForm: document.querySelector("#dish-form"),
    editingDishName: document.querySelector("#editing-dish-name"),
    dishNameInput: document.querySelector("#dish-name-input"),
    dishIngredientsInput: document.querySelector("#dish-ingredients-input"),
    dishCategoryInput: document.querySelector("#dish-category-input"),
    dishStatusInput: document.querySelector("#dish-status-input"),
    dishTutorialInput: document.querySelector("#dish-tutorial-input"),
    dishNoteInput: document.querySelector("#dish-note-input"),
    dishSuggestions: document.querySelector("#dish-suggestions"),
    submitDishButton: document.querySelector("#submit-dish-button"),
    cancelEditButton: document.querySelector("#cancel-edit-button"),
    formMessage: document.querySelector("#form-message"),
    exportButton: document.querySelector("#export-button"),
    importFileInput: document.querySelector("#import-file-input"),
    resetButton: document.querySelector("#reset-button"),
    dataMessage: document.querySelector("#data-message"),
    historyList: document.querySelector("#history-list"),
    clearHistoryButton: document.querySelector("#clear-history-button"),
    libraryStatusFilter: document.querySelector("#library-status-filter")
  };
}

function bindEvents(elements) {
  elements.fridgeInput.addEventListener("input", () => {
    fridgeIngredients = parseIngredients(elements.fridgeInput.value);
    noRepeatNames = [];
    renderFridgeDependentViews(elements);
  });

  elements.quickIngredientTags.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ingredient]");
    if (!button) return;
    toggleIngredient(button.dataset.ingredient, elements);
  });

  elements.clearFridgeButton.addEventListener("click", () => {
    fridgeIngredients = [];
    noRepeatNames = [];
    elements.fridgeInput.value = "";
    renderFridgeDependentViews(elements);
  });

  elements.noRepeatToggle.addEventListener("change", () => {
    noRepeatNames = [];
  });

  elements.pickButton.addEventListener("click", () => {
    rollToDish({
      candidates: getDrawableLibraryDishes(elements.noRepeatToggle.checked),
      button: elements.pickButton,
      result: elements.dishResult,
      tutorialLink: elements.tutorialLink,
      buttonTextAfterPick: "再抽一次",
      emptyText: "没有匹配的菜，请补充食材或关闭不重复抽取",
      timerName: "library",
      onFinal: (dish) => {
        if (elements.noRepeatToggle.checked) {
          noRepeatNames.push(dish.name);
        }
        addHistory(dish, "抽签库", elements);
        renderFridgeDependentViews(elements);
      }
    });
  });

  elements.newDishCategory.addEventListener("change", () => {
    lastNewDish = null;
    elements.saveNewDishButton.disabled = true;
    elements.newDishResult.textContent = "点击按钮随机找一道新灵感";
    elements.newDishTutorialLink.classList.add("hidden");
  });

  elements.newDishButton.addEventListener("click", () => {
    rollToDish({
      candidates: getNewDishCandidates(),
      button: elements.newDishButton,
      result: elements.newDishResult,
      tutorialLink: elements.newDishTutorialLink,
      buttonTextAfterPick: "再随机一道",
      emptyText: "暂时没有可推荐的新菜",
      timerName: "newDish",
      onFinal: (dish) => {
        lastNewDish = dish;
        elements.saveNewDishButton.disabled = dishes.some((savedDish) => savedDish.name === dish.name);
        addHistory(dish, "新菜灵感", elements);
      }
    });
  });

  elements.saveNewDishButton.addEventListener("click", () => {
    if (!lastNewDish) return;
    addDishToLibrary(lastNewDish, elements, "已加入我的抽签库。");
  });

  elements.dishNameInput.addEventListener("input", () => {
    autofillDishForm(elements);
  });

  elements.dishNameInput.addEventListener("change", () => {
    autofillDishForm(elements);
  });

  elements.dishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDishFromForm(elements);
  });

  elements.cancelEditButton.addEventListener("click", () => {
    resetDishForm(elements);
  });

  elements.dishGroups.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-dish]");
    const deleteButton = event.target.closest("[data-delete-dish]");
    const addButton = event.target.closest("[data-add-dish]");

    if (editButton) editCustomDish(editButton.dataset.editDish, elements);
    if (deleteButton) deleteCustomDish(deleteButton.dataset.deleteDish, elements);
    if (addButton) addInspirationByName(addButton.dataset.addDish, elements);
  });

  elements.exportButton.addEventListener("click", () => {
    exportLibrary();
    showMessage(elements.dataMessage, "已生成 JSON 备份文件。", "success");
  });

  elements.importFileInput.addEventListener("change", () => {
    importLibrary(elements);
  });

  elements.resetButton.addEventListener("click", () => {
    resetCustomData(elements);
  });

  elements.clearHistoryButton.addEventListener("click", () => {
    drawHistory = [];
    saveHistory();
    renderHistory(elements.historyList);
  });

  elements.libraryStatusFilter.addEventListener("change", () => {
    renderDishGroups(elements);
  });
}

function renderAll(elements) {
  renderQuickIngredientTags(elements.quickIngredientTags);
  renderNewDishCategories(elements.newDishCategory);
  renderDishSuggestions(elements.dishSuggestions);
  renderDishGroups(elements);
  renderHistory(elements.historyList);
  updateMatchCount(elements.matchCount);
}

function renderFridgeDependentViews(elements) {
  renderQuickIngredientTags(elements.quickIngredientTags);
  renderDishGroups(elements);
  updateMatchCount(elements.matchCount);
}

function loadDishes() {
  const savedDishes = readJson(STORAGE_KEY, []);
  const normalizedSavedDishes = savedDishes
    .map((dish) => normalizeDish(dish))
    .filter((dish) => dish.name);
  return [...defaultDishes.map((dish) => normalizeDish(dish)), ...normalizedSavedDishes];
}

function loadHistory() {
  return readJson(HISTORY_KEY, []);
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function saveCustomDishes(customDishes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customDishes));
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(drawHistory));
}

function saveDishFromForm(elements) {
  const originalName = elements.editingDishName.value;
  const name = elements.dishNameInput.value.trim();
  const ingredients = parseIngredients(elements.dishIngredientsInput.value);

  if (!name) {
    showMessage(elements.formMessage, "请先填写菜名。", "error");
    return;
  }

  const nameTaken = dishes.some((dish) => dish.name === name && dish.name !== originalName);
  if (nameTaken) {
    showMessage(elements.formMessage, "抽签库里已经有这道菜了。", "error");
    return;
  }

  const dish = normalizeDish({
    name,
    ingredients,
    category: elements.dishCategoryInput.value.trim() || "我添加的菜",
    status: elements.dishStatusInput.value,
    tutorialUrl: elements.dishTutorialInput.value.trim(),
    note: elements.dishNoteInput.value.trim()
  });

  const customDishes = getCustomDishes().filter((customDish) => customDish.name !== originalName);
  customDishes.push(dish);
  saveCustomDishes(customDishes);

  dishes = [...defaultDishes.map((defaultDish) => normalizeDish(defaultDish)), ...customDishes];
  resetDishForm(elements);
  showMessage(elements.formMessage, originalName ? `已更新：${name}` : `已添加：${name}`, "success");
  renderAll(elements);
}

function addDishToLibrary(dish, elements, message) {
  if (dishes.some((savedDish) => savedDish.name === dish.name)) {
    showMessage(elements.formMessage, "抽签库里已经有这道菜了。", "error");
    elements.saveNewDishButton.disabled = true;
    return;
  }

  const customDishes = getCustomDishes();
  customDishes.push(normalizeDish({ ...dish, status: "想尝试" }));
  saveCustomDishes(customDishes);
  dishes = [...defaultDishes.map((defaultDish) => normalizeDish(defaultDish)), ...customDishes];
  elements.saveNewDishButton.disabled = true;
  showMessage(elements.formMessage, message, "success");
  renderAll(elements);
}

function addInspirationByName(name, elements) {
  const dish = inspirationDishes.find((item) => item.name === name);
  if (dish) addDishToLibrary(dish, elements, `已添加新菜灵感：${name}`);
}

function editCustomDish(name, elements) {
  const dish = getCustomDishes().find((customDish) => customDish.name === name);
  if (!dish) return;

  elements.editingDishName.value = dish.name;
  elements.dishNameInput.value = dish.name;
  elements.dishIngredientsInput.value = dish.ingredients.join("、");
  elements.dishCategoryInput.value = dish.category || "我添加的菜";
  elements.dishStatusInput.value = dish.status || "已做过";
  elements.dishTutorialInput.value = dish.tutorialUrl || "";
  elements.dishNoteInput.value = dish.note || "";
  elements.submitDishButton.textContent = "保存修改";
  elements.cancelEditButton.classList.remove("hidden");
  showMessage(elements.formMessage, `正在编辑：${dish.name}`, "success");
  elements.dishNameInput.focus();
}

function deleteCustomDish(name, elements) {
  const confirmed = window.confirm(`确定删除「${name}」吗？`);
  if (!confirmed) return;

  const customDishes = getCustomDishes().filter((dish) => dish.name !== name);
  saveCustomDishes(customDishes);
  dishes = [...defaultDishes.map((defaultDish) => normalizeDish(defaultDish)), ...customDishes];
  resetDishForm(elements);
  showMessage(elements.formMessage, `已删除：${name}`, "success");
  renderAll(elements);
}

function resetDishForm(elements) {
  elements.dishForm.reset();
  elements.editingDishName.value = "";
  elements.submitDishButton.textContent = "添加到抽签库";
  elements.cancelEditButton.classList.add("hidden");
}

function autofillDishForm(elements) {
  const name = elements.dishNameInput.value.trim();
  const suggestion = findDishSuggestion(name);
  if (!suggestion) return;

  elements.dishIngredientsInput.value = suggestion.ingredients.join("、");
  elements.dishCategoryInput.value = suggestion.category || "";
  elements.dishStatusInput.value = suggestion.status || "想尝试";
  elements.dishNoteInput.value = suggestion.note || "";
  if (suggestion.tutorialUrl) elements.dishTutorialInput.value = suggestion.tutorialUrl;
  showMessage(elements.formMessage, `已自动补充「${suggestion.name}」的信息。`, "success");
}

function rollToDish(options) {
  const { candidates, button, result, tutorialLink, buttonTextAfterPick, emptyText, timerName, onFinal } = options;

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
    result.textContent = pickRandomDish(candidates).name;
  }, ROLLING_INTERVAL));

  setTimeout(() => {
    clearRollingTimer(timerName);
    const finalDish = pickRandomDish(candidates);

    result.textContent = finalDish.name;
    result.classList.remove("is-rolling");
    button.textContent = buttonTextAfterPick;
    button.disabled = false;
    updateTutorialLink(tutorialLink, finalDish);
    if (onFinal) onFinal(finalDish);
  }, ROLLING_DURATION);
}

function getCandidateDishes() {
  const candidates = fridgeIngredients.length === 0
    ? dishes
    : dishes.filter((dish) => getMatchCount(dish) > 0);

  return candidates.sort((first, second) => getRecommendationScore(second) - getRecommendationScore(first));
}

function getDrawableLibraryDishes(useNoRepeat) {
  const candidates = getCandidateDishes();
  if (!useNoRepeat) return candidates;

  const remaining = candidates.filter((dish) => !noRepeatNames.includes(dish.name));
  if (remaining.length > 0) return remaining;

  noRepeatNames = [];
  return candidates;
}

function getNewDishCandidates() {
  const selectedCategory = document.querySelector("#new-dish-category").value;
  const uniqueCandidates = new Map();

  [...dishes, ...inspirationDishes].forEach((dish) => {
    if (selectedCategory === "全部" || dish.category === selectedCategory) {
      uniqueCandidates.set(dish.name, normalizeDish(dish));
    }
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

function getRecommendationScore(dish) {
  if (fridgeIngredients.length === 0) return 0;
  return getMatchCount(dish) / Math.max(dish.ingredients.length, 1);
}

function getRecommendationLabel(dish, isMatched) {
  if (fridgeIngredients.length === 0) return "可抽选";
  if (!isMatched) return "未匹配";

  const missingCount = Math.max(dish.ingredients.length - getMatchCount(dish), 0);
  if (missingCount === 0) return "食材齐全";
  if (missingCount === 1) return "缺 1 个食材";
  return `缺 ${missingCount} 个食材`;
}

function pickRandomDish(candidateDishes) {
  const randomIndex = Math.floor(Math.random() * candidateDishes.length);
  return candidateDishes[randomIndex];
}

function renderQuickIngredientTags(container) {
  container.innerHTML = quickIngredients.map((ingredient) => {
    const isSelected = fridgeIngredients.includes(ingredient);
    return `<button class="tag${isSelected ? " is-selected" : ""}" type="button" data-ingredient="${escapeHtml(ingredient)}">${escapeHtml(ingredient)}</button>`;
  }).join("");
}

function renderDishGroups(elements) {
  const candidates = getCandidateDishes();
  const selectedStatus = elements.libraryStatusFilter.value;
  const visibleDishes = selectedStatus === "全部"
    ? dishes
    : dishes.filter((dish) => dish.status === selectedStatus);
  const groupedDishes = groupDishesByCategory(visibleDishes);

  elements.dishGroups.innerHTML = "";

  if (visibleDishes.length === 0) {
    elements.dishGroups.innerHTML = `<p class="empty-state">当前状态下没有菜品。</p>`;
    return;
  }

  Object.entries(groupedDishes).forEach(([category, categoryDishes], index) => {
    const group = document.createElement("details");
    const summary = document.createElement("summary");
    const list = document.createElement("ul");

    group.className = "dish-group";
    group.open = index === 0 || fridgeIngredients.length > 0;
    summary.textContent = `${category} · ${categoryDishes.length} 道`;
    list.className = "dish-grid";

    categoryDishes
      .slice()
      .sort((first, second) => getRecommendationScore(second) - getRecommendationScore(first))
      .forEach((dish) => {
        const item = document.createElement("li");
        const isMatched = fridgeIngredients.length === 0 || candidates.some((candidate) => candidate.name === dish.name);
        const isCustom = getCustomDishes().some((customDish) => customDish.name === dish.name);

        item.className = `dish-card${isMatched ? "" : " is-muted"}`;
        item.innerHTML = `
          <strong>${escapeHtml(dish.name)}</strong>
          <p class="ingredients">${dish.ingredients.length > 0 ? escapeHtml(dish.ingredients.join("、")) : "暂未填写食材"}</p>
          <p class="dish-note">${escapeHtml(dish.status || "已做过")} · ${escapeHtml(dish.note || "暂无备注")}</p>
          <div class="card-actions">
            <span class="match-badge">${escapeHtml(getRecommendationLabel(dish, isMatched))}</span>
            <a href="${escapeAttribute(getTutorialUrl(dish))}" target="_blank" rel="noreferrer">教程</a>
          </div>
          <div class="card-actions compact-actions">
            ${isCustom ? `<button class="text-button" type="button" data-edit-dish="${escapeAttribute(dish.name)}">编辑</button><button class="text-button danger-text" type="button" data-delete-dish="${escapeAttribute(dish.name)}">删除</button>` : `<span class="quiet-text">默认菜品</span>`}
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

function renderNewDishCategories(selectElement) {
  const categories = new Set(["全部"]);
  [...dishes, ...inspirationDishes].forEach((dish) => categories.add(dish.category || "我添加的菜"));
  const currentValue = selectElement.value || "全部";

  selectElement.innerHTML = Array.from(categories).map((category) => {
    return `<option value="${escapeAttribute(category)}">${escapeHtml(category)}</option>`;
  }).join("");
  selectElement.value = categories.has(currentValue) ? currentValue : "全部";
}

function renderHistory(listElement) {
  if (drawHistory.length === 0) {
    listElement.innerHTML = `<li class="empty-state">还没有抽签记录。</li>`;
    return;
  }

  listElement.innerHTML = drawHistory.map((item) => {
    return `
      <li>
        <span>${escapeHtml(item.name)}</span>
        <small>${escapeHtml(item.source)} · ${escapeHtml(item.time)}</small>
        <a href="${escapeAttribute(item.tutorialUrl)}" target="_blank" rel="noreferrer">教程</a>
      </li>
    `;
  }).join("");
}

function groupDishesByCategory(dishList) {
  return dishList.reduce((groups, dish) => {
    const category = dish.category || "我添加的菜";
    if (!groups[category]) groups[category] = [];
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

function updateTutorialLink(linkElement, dish) {
  linkElement.href = getTutorialUrl(dish);
  linkElement.textContent = `查看「${dish.name}」教程`;
  linkElement.classList.remove("hidden");
}

function addHistory(dish, source, elements) {
  drawHistory.unshift({
    name: dish.name,
    source,
    time: new Date().toLocaleString("zh-CN", { hour12: false }),
    tutorialUrl: getTutorialUrl(dish)
  });
  drawHistory = drawHistory.slice(0, MAX_HISTORY);
  saveHistory();
  renderHistory(elements.historyList);
}

function toggleIngredient(ingredient, elements) {
  if (fridgeIngredients.includes(ingredient)) {
    fridgeIngredients = fridgeIngredients.filter((item) => item !== ingredient);
  } else {
    fridgeIngredients.push(ingredient);
  }

  elements.fridgeInput.value = fridgeIngredients.join("、");
  noRepeatNames = [];
  renderFridgeDependentViews(elements);
}

function exportLibrary() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customDishes: getCustomDishes(),
    history: drawHistory
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "HomeDishPicker-library.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importLibrary(elements) {
  const file = elements.importFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const data = JSON.parse(reader.result);
      const importedDishes = Array.isArray(data.customDishes) ? data.customDishes : data;
      if (!Array.isArray(importedDishes)) throw new Error("Invalid data");

      const customDishes = importedDishes
        .map((dish) => normalizeDish(dish))
        .filter((dish) => dish.name);
      saveCustomDishes(customDishes);
      dishes = [...defaultDishes.map((defaultDish) => normalizeDish(defaultDish)), ...customDishes];
      if (Array.isArray(data.history)) {
        drawHistory = data.history.slice(0, MAX_HISTORY);
        saveHistory();
      }
      noRepeatNames = [];
      showMessage(elements.dataMessage, "导入成功。", "success");
      renderAll(elements);
    } catch {
      showMessage(elements.dataMessage, "导入失败，请选择有效的 JSON 文件。", "error");
    } finally {
      elements.importFileInput.value = "";
    }
  });
  reader.readAsText(file, "UTF-8");
}

function resetCustomData(elements) {
  const confirmed = window.confirm("确定重置自定义菜品和抽签历史吗？默认菜品会保留。");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
  dishes = defaultDishes.map((dish) => normalizeDish(dish));
  drawHistory = [];
  fridgeIngredients = [];
  noRepeatNames = [];
  lastNewDish = null;
  elements.fridgeInput.value = "";
  elements.saveNewDishButton.disabled = true;
  resetDishForm(elements);
  showMessage(elements.dataMessage, "已重置自定义数据。", "success");
  renderAll(elements);
}

function getTutorialUrl(dish) {
  return dish.tutorialUrl || buildSearchUrl(dish.name);
}

function buildSearchUrl(dishName) {
  return `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(`${dishName} 教程`)}`;
}

function findDishSuggestion(name) {
  const normalizedName = normalizeText(name);
  if (normalizedName.length === 0) return null;

  const suggestions = [...defaultDishes, ...inspirationDishes].map((dish) => normalizeDish(dish));
  return suggestions.find((dish) => normalizeText(dish.name) === normalizedName)
    || suggestions.find((dish) => normalizeText(dish.name).includes(normalizedName) && normalizedName.length >= 2);
}

function normalizeDish(dish) {
  const name = typeof dish.name === "string" ? dish.name.trim() : "";
  const suggestion = name ? findSuggestionWithoutNormalizeLoop(name) : null;

  return {
    name,
    ingredients: Array.isArray(dish.ingredients) ? dish.ingredients.map(String).filter(Boolean) : [],
    category: dish.category || suggestion?.category || "我添加的菜",
    status: dish.status || suggestion?.status || "已做过",
    tutorialUrl: dish.tutorialUrl || "",
    note: dish.note || suggestion?.note || ""
  };
}

function findSuggestionWithoutNormalizeLoop(name) {
  const normalizedName = normalizeText(name);
  const suggestions = [...defaultDishes, ...inspirationDishes];
  return suggestions.find((dish) => normalizeText(dish.name) === normalizedName);
}

function parseIngredients(value) {
  return value
    .split(/[、，,\s\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function showMessage(messageElement, text, type) {
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
