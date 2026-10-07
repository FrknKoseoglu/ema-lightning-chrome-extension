document.addEventListener("DOMContentLoaded", () => {
  const readBtn = document.getElementById("read-current-page");

  readBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.runtime.sendMessage({
        action: "READ_PAGE_FROM_POPUP",
        tabId: tab.id
      });
      window.close();
    }
  });
});
