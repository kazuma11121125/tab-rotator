let rotationTimer = null;
let currentInterval = 10000; // デフォルトは10秒
let isEnabled = false;
let rotationState = "stopped";

// アイドル判定のしきい値（15秒）
const IDLE_THRESHOLD = 15;
chrome.idle.setDetectionInterval(IDLE_THRESHOLD);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getStatus") {
    sendResponse({ state: rotationState });
    return;
  }

  if (message.action === "start") {
    isEnabled = true;
    rotationState = "waiting";
    currentInterval = parseInt(message.interval) * 1000;
    
    // 現在の状態を確認し、すでにアイドルなら即座に開始
    chrome.idle.queryState(IDLE_THRESHOLD, (state) => {
      if (state === "idle") startRotation();
    });
  } else if (message.action === "stop") {
    isEnabled = false;
    rotationState = "stopped";
    stopRotation();
  }
});

// ユーザーの操作状態が変化した時に実行
chrome.idle.onStateChanged.addListener((newState) => {
  if (!isEnabled) return;

  if (newState === "idle") {
    console.log("15秒の無操作を検知：巡回を開始します");
    startRotation();
  } else {
    console.log("操作を検知：巡回を停止しました");
    stopRotation();
    rotationState = "waiting";
  }
});

function startRotation() {
  if (rotationTimer) return;
  rotationState = "running";
  rotationTimer = setInterval(() => { // タブの切り替え処理
    chrome.tabs.query({ currentWindow: true }, (tabs) => { // 現在のウィンドウのタブを取得
      if (tabs.length <= 1) return; // タブが1つ以下なら切り替え不要
      const activeTab = tabs.find(tab => tab.active); // 現在アクティブなタブを見つける
      if (!activeTab) return; // アクティブなタブが見つからない場合は何もしない
      const nextIndex = (activeTab.index + 1) % tabs.length; // 次のタブのインデックスを計算
      chrome.tabs.update(tabs[nextIndex].id, { active: true }); // 次のタブをアクティブにする
    });
  }, currentInterval);
}

function stopRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
}