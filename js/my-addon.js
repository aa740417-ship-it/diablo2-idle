/* 原作外掛模板 v1
   目的：
   1. 不修改原作核心檔案
   2. 把新增功能集中在這個檔案
   3. 原作更新後，只要調整這裡的相容層

   這個模板目前只加入一個獨立外掛按鈕與測試面板，
   不讀寫原作戰鬥數值，避免還沒確認 API 就破壞存檔。
*/
(() => {
  "use strict";

  const ADDON = {
    version: "1.0.0",
    mounted: false,

    log(...args) {
      console.log("[MyAddon]", ...args);
    },

    findGameState() {
      // 先只做「偵測」，不直接修改原作 state。
      // 之後確認原作實際變數名稱後，再在這裡做相容層。
      const candidates = ["state", "gameState", "playerState"];
      for (const key of candidates) {
        try {
          if (window[key] && typeof window[key] === "object") {
            return { key, value: window[key] };
          }
        } catch (_) {}
      }
      return null;
    },

    createUI() {
      if (document.getElementById("my-addon-fab")) return;

      const fab = document.createElement("button");
      fab.id = "my-addon-fab";
      fab.className = "addon-fab";
      fab.type = "button";
      fab.textContent = "⚙";
      fab.title = "我的外掛";
      fab.addEventListener("click", () => this.togglePanel());

      const panel = document.createElement("div");
      panel.id = "my-addon-panel";
      panel.className = "addon-panel";
      panel.hidden = true;
      panel.innerHTML = `
        <div class="addon-title">我的外掛 v${this.version}</div>
        <div id="my-addon-status" class="addon-small">正在偵測原作...</div>
        <div class="addon-row">
          <button class="addon-btn" id="my-addon-test">測試外掛</button>
          <button class="addon-btn" id="my-addon-close">關閉</button>
        </div>
      `;

      document.body.appendChild(fab);
      document.body.appendChild(panel);

      document.getElementById("my-addon-test").addEventListener("click", () => {
        const found = this.findGameState();
        const status = document.getElementById("my-addon-status");
        if (found) {
          status.textContent = `已偵測到原作狀態物件：${found.key}。下一步可以開始接功能。`;
        } else {
          status.textContent = "外掛本身運作正常，但還沒辨識到原作狀態物件。";
        }
      });

      document.getElementById("my-addon-close").addEventListener("click", () => {
        panel.hidden = true;
      });
    },

    togglePanel() {
      const panel = document.getElementById("my-addon-panel");
      if (!panel) return;
      panel.hidden = !panel.hidden;
      if (!panel.hidden) this.refreshStatus();
    },

    refreshStatus() {
      const status = document.getElementById("my-addon-status");
      if (!status) return;
      const found = this.findGameState();
      status.textContent = found
        ? `外掛已載入。偵測到原作狀態物件：${found.key}`
        : "外掛已載入。尚未辨識到原作狀態物件。";
    },

    mount() {
      if (this.mounted) return;
      this.mounted = true;
      this.createUI();
      this.refreshStatus();
      this.log("loaded", this.version);
    }
  };

  window.MyAddon = ADDON;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ADDON.mount(), { once: true });
  } else {
    ADDON.mount();
  }
})();
