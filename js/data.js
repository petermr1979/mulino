/* ============================================================
   Слой данных.
   В будущем здесь будут загружаться заказы из API системы.
   Сейчас — mock-данные.
   ============================================================ */

/**
 * Список демонстрационных заказов.
 * Структура заказа соответствует ТЗ:
 * { id, status, items: [{ type, name }] }
 */
const MOCK_ORDERS = [
  {
    id: 124,
    status: "preparing",
    items: [
      { type: "burger", name: "Burger" },
      { type: "fries", name: "Fries" }
    ]
  },
  {
    id: 125,
    status: "preparing",
    items: [
      { type: "burger", name: "Burger" },
      { type: "fries", name: "Fries" },
      { type: "hot_drink", name: "Coffee" },
      { type: "cold_drink", name: "Cola" }
    ]
  },
  {
    id: 126,
    status: "preparing",
    items: [
      { type: "burger", name: "Burger" },
      { type: "fries", name: "Fries" },
      { type: "cold_drink", name: "Cola" }
    ]
  },
  {
    id: 127,
    status: "preparing",
    items: [
      { type: "burger", name: "Burger" },
      { type: "burger", name: "Burger" },
      { type: "fries", name: "Fries" },
      { type: "hot_drink", name: "Coffee" }
    ]
  },
  {
    id: 121,
    status: "ready",
    items: []
  },
  {
    id: 122,
    status: "ready",
    items: []
  },
  {
    id: 123,
    status: "ready",
    items: []
  }
];

/**
 * Набор типов заказов, которые демо умеет анимировать.
 * Используется, чтобы не выбирать в анимацию заказ с неизвестным составом.
 */
const ANIMATABLE_TYPES = new Set(["burger", "fries", "hot_drink", "cold_drink"]);

/**
 * Признак, что у заказа есть хотя бы один анимируемый предмет.
 */
function canAnimate(order) {
  return Array.isArray(order.items) && order.items.some(i => ANIMATABLE_TYPES.has(i.type));
}

/**
 * Абстракция загрузки заказов — точка интеграции с API.
 * Сейчас возвращает копию mock-данных.
 */
function loadOrders() {
  return MOCK_ORDERS.map(o => JSON.parse(JSON.stringify(o)));
}