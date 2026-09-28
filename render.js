/* ============================================================
   Рендер табло (ГОТОВИТСЯ / ГОТОВО) и вспомогательные утилиты.
   ============================================================ */

const $ = (sel) => document.querySelector(sel);

const orderList = {
  preparing: $("#preparingList"),
  ready: $("#readyList")
};

const stageEl = $("#stage");
const statusText = $("#statusText");
const slideViewport = $("#slideViewport");
const stageCaption = $("#stageCaption");

/* ============================================================
   Слайд-шоу: на каждом шаге показывается 3 картинки
   (слева, по центру, справа). Файлы называются "<шаг>.<позиция>.png",
   например для шага 1: 1.1.png, 1.2.png, 1.3.png.
   ============================================================ */
const SLIDE_STEPS = 7;      // количество шагов
const SLOTS_PER_STEP = 3;   // картинок в шаге
const SLOT_INTERVAL = 900;  // мс между появлением позиций (слева -> направо)

/** Построить DOM всех слайдов: по 3 изображения на шаг. */
function buildSlides() {
  slideViewport.innerHTML = "";
  for (let step = 1; step <= SLIDE_STEPS; step++) {
    for (let slot = 1; slot <= SLOTS_PER_STEP; slot++) {
      const img = document.createElement("img");
      img.className = "slide";
      img.dataset.step = step;
      img.dataset.slot = slot;
      img.src = `assets/${step}.${slot}.png`;
      img.alt = `Шаг ${step}, картинка ${slot}`;
      slideViewport.appendChild(img);
    }
  }
}
buildSlides();

/** Отображение типа предмета в иконку/эмодзи (зарезервировано для будущего расширения). */
const ITEM_ICON = {
  burger: "🍔",
  fries: "🍟",
  hot_drink: "☕",
  cold_drink: "🥤"
};

/**
 * Рендер списков заказов.
 * Возвращает Map id -> DOM-элемент для доступа при анимации.
 */
function renderOrders(orders) {
  const preparing = orders.filter(o => o.status === "preparing").sort((a, b) => a.id - b.id);
  const ready = orders.filter(o => o.status === "ready").sort((a, b) => a.id - b.id);

  orderList.preparing.innerHTML = "";
  orderList.ready.innerHTML = "";

  preparing.forEach(o => {
    const li = document.createElement("li");
    li.className = "order-list__item";
    li.dataset.id = o.id;
    li.textContent = o.id;
    orderList.preparing.appendChild(li);
  });

  ready.forEach(o => {
    const li = document.createElement("li");
    li.className = "order-list__item";
    li.dataset.id = o.id;
    li.textContent = o.id;
    orderList.ready.appendChild(li);
  });
}

/** Получить DOM-элемент номера в списке "Готовится" по id. */
function getPreparingItem(id) {
  return orderList.preparing.querySelector(`[data-id="${id}"]`);
}

/** Установить текст статуса на панели управления. */
function setStatus(text) {
  statusText.textContent = text;
}

/** Подсветить выбранный номер (до начала падения). */
function highlightPreparing(id) {
  const el = getPreparingItem(id);
  if (!el) return;
  el.classList.add("is-selected");
}

/** Анимация падения номера вниз из списка. Возвращает Promise. */
function fallPreparing(id) {
  const el = getPreparingItem(id);
  if (!el) return Promise.resolve();
  el.classList.remove("is-selected");
  el.classList.add("is-falling");
  return delay(700);
}

/** Анимация подъёма номера в колонку "Готово". Возвращает Promise. */
function riseIntoReady(id) {
  const el = orderList.ready.querySelector(`[data-id="${id}"]`);
  if (!el) return Promise.resolve();
  el.classList.add("is-rise-in");
  return delay(700);
}

/** Показать картинки текущего шага до позиции slot (накапливая, слева направо). */
function showSlideImage(step, slot) {
  slideViewport.querySelectorAll(".slide").forEach(img => {
    const isCurrentStep = Number(img.dataset.step) === step;
    const isVisibleSlot = Number(img.dataset.slot) <= slot;
    img.classList.toggle("is-active", isCurrentStep && isVisibleSlot);
  });
}

/**
 * Показать весь шаг: картинки появляются слева направо (1.1, затем 1.2, затем 1.3),
 * при этом ранее появившиеся не гаснут. В конце шага все картинки гаснут.
 */
async function showSlide(step) {
  for (let slot = 1; slot <= SLOTS_PER_STEP; slot++) {
    showSlideImage(step, slot);
    await delay(SLOT_INTERVAL);
  }
  // В конце шага гасим все картинки перед переходом на следующий шаг
  slideViewport.querySelectorAll(".slide").forEach(img => img.classList.remove("is-active"));
  await delay(600);
}

/** Сбросить слайд-шоу к неактивному состоянию. */
function resetSlides() {
  slideViewport.querySelectorAll(".slide").forEach(img => img.classList.remove("is-active"));
}

/** Установить подпись над слайд-шоу. */
function setCaption(text) {
  stageCaption.textContent = text;
}

/** Показать/скрыть нижнюю панель (сцену). */
function openStage() {
  stageEl.classList.add("is-open");
}
function closeStage() {
  stageEl.classList.remove("is-open");
}

/** Установить номер заказа в плашках слева и справа от слайда. */
function setStageOrderNum(id) {
  $("#stageOrderNum").textContent = `${id}`;
  $("#stageOrderNumRight").textContent = `${id}`;
}

/** Обновить часы на табло. */
function tickClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  $("#clock").textContent = `${hh}:${mm}`;
}
setInterval(tickClock, 1000);
tickClock();