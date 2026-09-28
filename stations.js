/* ============================================================
   Станции сборки.
   Каждая станция умеет:
     mount(order)      — построить DOM-содержимое
     run(onReady)      — проиграть анимацию сборки, затем вызвать onReady
     unmount()         — убрать DOM-содержимое
   Станции регистрируются в словаре STATIONS по типу предмета.
   ============================================================ */

/* ----- Вспомогательные иконки-заполнители ----- */
function stationIcon(emoji) {
  const div = document.createElement("div");
  div.className = "station__icon";
  div.textContent = emoji;
  return div;
}

/* ================= БУРГЕР ================= */
const BurgerStation = {
  key: "burger",
  label: "Бургер",

  mount() {
    this.el = $("#stationBurger");
    this.el.innerHTML = "";
    this.el.appendChild(stationIcon("🍔"));

    const name = document.createElement("div");
    name.className = "station__name";
    name.textContent = this.label;
    this.el.appendChild(name);

    this.build = document.createElement("div");
    this.build.className = "burger-build";
    this.layers = {};

    const defs = {
      "bun-b": "burger-layer--bun-b",
      "patty": "burger-layer--patty",
      "sauce": "burger-layer--sauce",
      "bun-t": "burger-layer--bun-t"
    };
    Object.entries(defs).forEach(([k, cls]) => {
      const layer = document.createElement("div");
      layer.className = `burger-layer ${cls}`;
      layer.dataset.layer = k;
      this.build.appendChild(layer);
      this.layers[k] = layer;
    });

    this.el.appendChild(this.build);
    this.el.classList.add("is-visible");
  },

  /** Показать слой с небольшой задержкой (последовательная сборка). */
  showLayer(key, step) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.layers[key].classList.add("is-on");
        resolve();
      }, step);
    });
  },

  async run() {
    // булочка -> котлета -> соус -> верхняя булочка
    await this.showLayer("bun-b", 0);
    await this.showLayer("patty", 350);
    await this.showLayer("sauce", 350);
    await this.showLayer("bun-t", 350);
    await delay(300);
  },

  unmount() {
    this.el.classList.remove("is-visible");
    this.el.innerHTML = "";
  }
};

/* ================= КАРТОФЕЛЬ ФРИ ================= */
const FriesStation = {
  key: "fries",
  label: "Картофель",

  mount() {
    this.el = $("#stationFries");
    this.el.innerHTML = "";
    this.el.appendChild(stationIcon("🍟"));

    const name = document.createElement("div");
    name.className = "station__name";
    name.textContent = this.label;
    this.el.appendChild(name);

    this.stack = document.createElement("div");
    this.stack.className = "fries-stack";
    // 6 палочек для демо
    for (let i = 0; i < 6; i++) {
      const fry = document.createElement("div");
      fry.className = "fry";
      this.stack.appendChild(fry);
    }
    this.el.appendChild(this.stack);
    this.el.classList.add("is-visible");
  },

  showFries() {
    return new Promise(resolve => {
      const fries = this.stack.querySelectorAll(".fry");
      fries.forEach((f, i) => {
        setTimeout(() => f.classList.add("is-on"), i * 120);
      });
      setTimeout(resolve, fries.length * 120 + 200);
    });
  },

  async run() {
    await this.showFries();
    await delay(200);
  },

  unmount() {
    this.el.classList.remove("is-visible");
    this.el.innerHTML = "";
  }
};

/* ================= НАПИТКИ (общий для горячего/холодного) ================= */
function makeDrinkStation(key, label, cupClass, emoji) {
  return {
    key,
    label,

    mount() {
      this.el = $(`#station${key === "hot_drink" ? "Hot" : "Cold"}`);
      this.el.innerHTML = "";
      this.el.appendChild(stationIcon(emoji));

      const name = document.createElement("div");
      name.className = "station__name";
      name.textContent = this.label;
      this.el.appendChild(name);

      this.cup = document.createElement("div");
      this.cup.className = `cup ${cupClass}`;

      const fill = document.createElement("div");
      fill.className = "cup__fill";
      this.cup.appendChild(fill);

      if (key === "hot_drink") {
        const steam = document.createElement("div");
        steam.className = "cup__steam";
        this.cup.appendChild(steam);
      } else {
        const drop = document.createElement("div");
        drop.className = "cup__droplet";
        this.cup.appendChild(drop);
      }

      const lid = document.createElement("div");
      lid.className = "cup__lid";
      this.cup.appendChild(lid);

      this.el.appendChild(this.cup);
      this.el.classList.add("is-visible");
    },

    async run() {
      // Наполняем стакан
      await delay(250);
      this.cup.classList.add("is-full");
      await delay(650);
    },

    unmount() {
      this.el.classList.remove("is-visible");
      this.el.innerHTML = "";
    }
  };
}

const HotDrinkStation = makeDrinkStation("hot_drink", "Кофе", "cup--hot", "☕");
const ColdDrinkStation = makeDrinkStation("cold_drink", "Напиток", "cup--cold", "🥤");

/* ================= УПАКОВКА ================= */
const PackagingStation = {
  key: "packaging",
  label: "Упаковка",

  mount() {
    this.el = $("#packZone");
    this.el.innerHTML = "";

    const label = document.createElement("div");
    label.className = "pack-zone__label";
    label.textContent = "Упаковка";
    this.el.appendChild(label);

    this.bag = document.createElement("div");
    this.bag.className = "bag";

    const handle = document.createElement("div");
    handle.className = "bag__handle";
    this.bag.appendChild(handle);

    this.itemContainer = document.createElement("div");
    this.itemContainer.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:2px;";
    this.bag.appendChild(this.itemContainer);

    this.el.appendChild(this.bag);
    this.el.classList.add("is-visible");
  },

  /** Поочерёдно кладём каждый предмет в пакет. */
  async addItems(order) {
    const icons = order.items.map(i => ITEM_ICON[i.type]).filter(Boolean);
    for (const ic of icons) {
      const span = document.createElement("span");
      span.className = "bag__item";
      span.textContent = ic;
      this.itemContainer.appendChild(span);
      await delay(40);
      span.classList.add("is-in");
      await delay(260);
    }
  },

  unmount() {
    this.el.classList.remove("is-visible");
    this.el.innerHTML = "";
  }
};

/* ================= ВЫДАЧА ================= */
const PickupStation = {
  key: "pickup",
  label: "Выдача",

  mount() { /* зона выдачи уже статична в разметке */ },
  unmount() {}
};

/* ============================================================
   Mapping: тип предмета -> станция.
   Добавление нового типа заказа = добавление пары сюда + станция.
   ============================================================ */
const STATIONS = {
  burger: BurgerStation,
  fries: FriesStation,
  hot_drink: HotDrinkStation,
  cold_drink: ColdDrinkStation
};

/** Получить уникальные станции для заказа (в порядке появления в items). */
function stationsForOrder(order) {
  const seen = [];
  order.items.forEach(item => {
    const st = STATIONS[item.type];
    if (st && !seen.includes(st)) seen.push(st);
  });
  return seen;
}