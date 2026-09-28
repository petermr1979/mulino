/* ============================================================
   Движок сценария — слайд-шоу анимации.
   Последовательность:
     подсветка номера -> падение вниз -> открытие нижней панели
     -> показ слайдов 1..7 -> закрытие панели -> номер "прилетает" в Готово
   ============================================================ */

const Engine = (() => {
  const state = {
    phase: "idle",
    running: false,
    orders: [],
    current: null
  };

  const SLIDE_COUNT = 7;
  const SLIDE_INTERVAL = 2800;   // мс на слайд (включая плавный переход)

  function setProgress(frac) {
    $("#progressFill").style.width = `${Math.round(frac * 100)}%`;
  }

  function setProgressLabel(text) {
    $("#progressLabel").textContent = text;
  }

  // ================= ФАЗА 1: ВЫБОР / ПОДСВЕТКА =================
  async function phaseSelect(order) {
    setStatus(`Анимация: заказ №${order.id}`);
    setProgress(0.05);
    setProgressLabel("Выбираем заказ…");
    highlightPreparing(order.id);
    await delay(500);
  }

  // ================= ФАЗА 2: ПАДЕНИЕ ВНИЗ =================
  async function phaseFall(order) {
    setProgress(0.1);
    setProgressLabel("Опускаем заказ на конвейер…");
    await fallPreparing(order.id);   // номер гаснет и падает вниз
  }

  // ================= ФАЗА 3: ОТКРЫТИЕ ПАНЕЛИ =================
  async function phaseOpen(order) {
    setProgress(0.15);
    setProgressLabel("");
    setStageOrderNum(order.id);
    openStage();
    await delay(700);
  }

  // ================= ФАЗА 4: СЛАЙД-ШОУ =================
  async function phaseSlides(order) {
    for (let i = 1; i <= SLIDE_COUNT; i++) {
      // Картинки шага появляются слева направо внутри showSlide
      await showSlide(i);
      setProgress(0.2 + (i / SLIDE_COUNT) * 0.7);
      setProgressLabel("");
      await delay(SLIDE_INTERVAL);
    }
  }

  // ================= ФАЗА 5: ЗАКРЫТИЕ И ПОДЪЁМ ВВЕРХ =================
  async function phaseClose(order) {
    setProgress(1);
    setProgressLabel("");
    setCaption("");
    await delay(400);

    // Закрываем нижнюю панель
    closeStage();
    await delay(700);

    // Переносим номер из "Готовится" в "Готово" с подъёмом вверх
    order.status = "ready";
    state.orders.forEach(o => {
      if (o.id === order.id) o.status = "ready";
    });
    renderOrders(state.orders);
    riseIntoReady(order.id);
    setStatus(`Заказ №${order.id} — готово`);
    await delay(700);
  }

  // ================= ГОЛОВНОЙ ЗАПУСК =================
  async function runAnimation(order) {
    if (state.running) return;

    state.running = true;
    state.current = order;

    try {
      await phaseSelect(order);
      await phaseFall(order);
      await phaseOpen(order);
      await phaseSlides(order);
      await phaseClose(order);
    } finally {
      state.running = false;
      state.current = null;
      setProgress(0);
      setProgressLabel("");
      setCaption("");
      setStatus("Обычный режим");
      onComplete && onComplete();
    }
  }

  let onComplete = null;
  function setOnComplete(fn) { onComplete = fn; }

  /** Полный сброс к исходному состоянию (без смены данных). */
  async function reset() {
    state.running = false;
    state.current = null;
    closeStage();
    resetSlides();
    setProgress(0);
    setProgressLabel("");
    setCaption("");
    // Убрать классы у всех номеров
    document.querySelectorAll(".order-list__item").forEach(el => {
      el.classList.remove("is-selected", "is-falling");
    });
  }

  return {
    runAnimation,
    setOnComplete,
    reset,
    get running() { return state.running; },
    get orders() { return state.orders; },
    set orders(v) { state.orders = v; }
  };
})();