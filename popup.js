const statusElement = document.getElementById('status');

function setStatus(state) {
  if (state === 'running') {
    statusElement.textContent = '状態: 巡回中';
  } else if (state === 'waiting') {
    statusElement.textContent = '状態: 待機中';
  } else {
    statusElement.textContent = '状態: 停止中';
  }
  statusElement.dataset.state = state;
}

function refreshStatus() {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    setStatus((response && response.state) || 'stopped');
  });
}

document.getElementById('start').addEventListener('click', () => {
  const seconds = document.getElementById('interval').value;
  chrome.runtime.sendMessage({ action: 'start', interval: seconds }, () => {
    refreshStatus();
  });
});

document.getElementById('stop').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stop' }, () => {
    refreshStatus();
  });
});

refreshStatus();