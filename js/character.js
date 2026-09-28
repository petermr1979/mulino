/* ============================================================
   Персонаж: передвижение по конвейеру и переноска предметов.
   ============================================================ */

const character = {
  /** Смещение по горизонтали (пиксели от левого края сцены). */
  x: 0,

  el: $("#character"),
  ticket: $("#characterTicket"),
  carry: $("#characterCarry"),

  /** Позиционировать персонажа на сцене по x (px). */
  setX(x) {
    this.x = x;
    this.el.style.transform = `translateX(${x}px)`;
  },

  /** Плавно переместить к заданному x. */
  moveTo(x, opts = {}) {
    const { fast = false, onDone = null, dur = 500 } = opts;
    this.el.classList.toggle("is-moving-fast", fast);
    this.el.classList.add("is-walking");
    this.el.style.transitionDuration = `${dur}ms`;
    this.el.style.transform = `translateX(${x}px)`;
    this.x = x;

    if (onDone) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.el.classList.remove("is-walking");
        if (onDone) onDone();
      }, dur);
    }
    return dur;
  },

  /** Остановить ходьбу (без удаления позиции). */
  stop() {
    this.el.classList.remove("is-walking");
    clearTimeout(this._timer);
  },

  /** Установить номер в билете персонажа. */
  setTicket(id) {
    this.ticket.textContent = `№${id}`;
    this.ticket.hidden = false;
  },

  hideTicket() {
    this.ticket.hidden = true;
  },

  /** Показать переносимые предметы (эмодзи) в руке персонажа. */
  showCarry(icons) {
    this.carry.innerHTML = "";
    icons.forEach(ic => {
      const span = document.createElement("span");
      span.textContent = ic;
      this.carry.appendChild(span);
    });
    this.carry.hidden = false;
  },

  hideCarry() {
    this.carry.hidden = true;
    this.carry.innerHTML = "";
  },

  /** Показать персонажа и разместить на стартовой позиции. */
  show(startX) {
    this.el.hidden = false;
    this.setX(startX);
  },

  hide() {
    this.stop();
    this.el.hidden = true;
    this.hideCarry();
  }
};

/** Функция-хелпер: задержка в мс (Promise). */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}