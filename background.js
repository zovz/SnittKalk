chrome.runtime.onInstalled.addListener(() => {
    console.log('Grade Calculator Extension Installed');
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => console.log('Grade Calculator Extension Activated')
    });
});
