const HOST_NAME = "com.emalightning.tts";
let nativePort = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ema-read-selection",
    title: "Ema ile dinle",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "ema-read-page",
    title: "Ema ile tüm sayfayı / haberi dinle",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ema-read-selection") {
    // Content script'e "seçili metni hazırla ve bana metni dön" de
    chrome.tabs.sendMessage(tab.id, { action: "PREPARE_SELECTION" }, (response) => {
      let textToRead = (response && response.text) ? response.text : info.selectionText;
      if (textToRead) {
        startNativeTTS(tab.id, textToRead);
      }
    });
  } else if (info.menuItemId === "ema-read-page") {
    chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_TEXT" }, (response) => {
      if (response && response.text) {
        startNativeTTS(tab.id, response.text);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "READ_PAGE_FROM_POPUP" && request.tabId) {
    chrome.tabs.sendMessage(request.tabId, { action: "GET_PAGE_TEXT" }, (response) => {
      if (response && response.text) {
        startNativeTTS(request.tabId, response.text);
      }
    });
  }
  return true;
});

function startNativeTTS(tabId, text) {
  if (!text || !text.trim()) return;

  chrome.tabs.sendMessage(tabId, { action: "SHOW_LOADING", textLength: text.length }).catch(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    }).then(() => {
      chrome.tabs.sendMessage(tabId, { action: "SHOW_LOADING", textLength: text.length });
    });
  });

  if (nativePort) {
    try { nativePort.disconnect(); } catch (e) {}
    nativePort = null;
  }

  try {
    nativePort = chrome.runtime.connectNative(HOST_NAME);

    nativePort.onMessage.addListener((msg) => {
      if (msg.type === "chunk" && msg.audio_base64) {
        chrome.tabs.sendMessage(tabId, {
          action: "RECEIVE_CHUNK",
          audio_base64: msg.audio_base64,
          duration: msg.duration
        });
      } else if (msg.type === "done") {
        chrome.tabs.sendMessage(tabId, { action: "STREAM_DONE" });
      } else if (msg.type === "error") {
        chrome.tabs.sendMessage(tabId, { action: "PLAY_ERROR", error: msg.message });
      }
    });

    nativePort.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        chrome.tabs.sendMessage(tabId, {
          action: "PLAY_ERROR",
          error: chrome.runtime.lastError.message
        });
      }
    });

    nativePort.postMessage({
      action: "SYNTHESIZE",
      text: text
    });

  } catch (err) {
    console.error("Native connect hatası:", err);
    chrome.tabs.sendMessage(tabId, { action: "PLAY_ERROR", error: err.message });
  }
}
