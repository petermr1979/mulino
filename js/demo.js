/* ============================================================
   Управление табло (PWA-версия): кнопки-символы Запустить / Следующий / Сброс.
   ============================================================ */

(function init() {
  // Загружаем заказы (в будущем — через API)
  let orders = loadOrders();
  Engine.orders = orders;

  renderOrders(orders);

  // Очередь анимируемых заказов (с реалистичным составом)
  const animatableQueue = orders
    .filter(o => o.status === "preparing" && canAnimate(o))
    .sort((a, b) => a.id - b.id);

  let queueIndex = 0;

  // --- Выбор следующего заказа ---
  function nextAnimatedOrder() {
    const candidates = animatableQueue.filter(o => o.status === "preparing");
    if (candidates.length === 0) {
      // Все анимируемые заказы уже готовы — сбросить демо-данные
      resetDemoData();
      return animatableQueue.filter(o => o.status === "preparing")[0];
    }
    // Берём по кругу
    const item = candidates[queueIndex % candidates.length];
    queueIndex++;
    return item;
  }

  /** Вернуть данные к исходному демо-состоянию. */
  function resetDemoData() {
    orders = loadOrders();
    Engine.orders = orders;
    renderOrders(orders);
    queueIndex = 0;
    setStatus("Демо сброшено");
  }

  // --- Кнопка "Сброс" ---
  function resetAll() {
    Engine.reset();
    resetDemoData();
  }

  // --- Запуск анимации ---
  function runNext() {
    if (Engine.running) return;
    const order = nextAnimatedOrder();
    if (!order) return;
    Engine.runAnimation(order);
  }

  // --- Привязка кнопок-символов ---
  $("#btnRun").addEventListener("click", () => {
    if (!Engine.running) runNext();
  });

  $("#btnNext").addEventListener("click", () => {
    if (Engine.running) return;
    // Выбор следующего заказа без запуска
    setStatus(`Выбран заказ №${nextAnimatedOrder().id}`);
  });

  $("#btnReset").addEventListener("click", resetAll);

  // --- Стартовое состояние ---
  setStatus("Готово к демонстрации");
})();
