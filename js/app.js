const dishes = [
  "番茄炒蛋",
  "青椒肉丝",
  "红烧茄子",
  "土豆丝",
  "麻婆豆腐",
  "可乐鸡翅",
  "宫保鸡丁",
  "蛋炒饭"
];

document.addEventListener("DOMContentLoaded", () => {
  const pickButton = document.querySelector("#pick-button");
  const dishResult = document.querySelector("#dish-result");
  const dishList = document.querySelector("#dish-list");

  renderDishList(dishList);

  pickButton.addEventListener("click", () => {
    const randomDish = pickRandomDish();

    dishResult.textContent = randomDish;
    pickButton.textContent = "再抽一次";
  });
});

function pickRandomDish() {
  const randomIndex = Math.floor(Math.random() * dishes.length);

  return dishes[randomIndex];
}

function renderDishList(listElement) {
  const fragment = document.createDocumentFragment();

  dishes.forEach((dish) => {
    const item = document.createElement("li");
    item.textContent = dish;
    fragment.appendChild(item);
  });

  listElement.appendChild(fragment);
}
