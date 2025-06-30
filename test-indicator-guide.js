// 測試總體經濟分析頁面的指標解讀功能
console.log('測試經濟指標解讀功能...');

// 等待頁面載入完成
setTimeout(() => {
  console.log('頁面載入完成，開始測試...');
  
  // 尋找經濟指標標籤並點擊
  const indicatorsTab = document.querySelector('button[data-state="active"][value="indicators"], button[value="indicators"]');
  if (indicatorsTab) {
    indicatorsTab.click();
    console.log('✓ 已切換到經濟指標標籤');
    
    // 等待指標載入後尋找解讀按鈕
    setTimeout(() => {
      const infoButtons = document.querySelectorAll('button[title*="指標解讀"], button[title*="顯示指標解讀"]');
      console.log(`找到 ${infoButtons.length} 個指標解讀按鈕`);
      
      if (infoButtons.length > 0) {
        console.log('✓ 指標解讀按鈕已正確顯示');
        
        // 測試點擊第一個按鈕
        const firstButton = infoButtons[0];
        firstButton.click();
        console.log('✓ 已點擊第一個指標解讀按鈕');
        
        // 檢查是否出現解讀區域
        setTimeout(() => {
          const guideSection = document.querySelector('[class*="bg-gradient-to-r from-blue-50"]');
          if (guideSection) {
            console.log('✓ 指標解讀區域已正確顯示');
            
            // 檢查解讀內容
            const ranges = guideSection.querySelectorAll('[class*="border"]');
            console.log(`找到 ${ranges.length} 個數值範圍說明`);
            
            if (ranges.length > 0) {
              console.log('✓ 數值範圍說明已正確顯示');
              console.log('測試完成！功能正常運作');
            } else {
              console.log('❌ 未找到數值範圍說明');
            }
          } else {
            console.log('❌ 指標解讀區域未顯示');
          }
          
          // 測試關閉功能
          setTimeout(() => {
            firstButton.click();
            console.log('✓ 測試關閉功能');
            
            setTimeout(() => {
              const hiddenGuideSection = document.querySelector('[class*="bg-gradient-to-r from-blue-50"]');
              if (!hiddenGuideSection) {
                console.log('✓ 解讀區域已正確隱藏');
              } else {
                console.log('❌ 解讀區域未能正確隱藏');
              }
            }, 500);
          }, 1000);
          
        }, 1000);
      } else {
        console.log('❌ 未找到指標解讀按鈕');
      }
    }, 2000);
  } else {
    console.log('❌ 未找到經濟指標標籤');
  }
}, 3000);

// 手動測試函數
window.testIndicatorGuide = function() {
  console.log('手動測試指標解讀功能...');
  const buttons = document.querySelectorAll('button[title*="指標解讀"]');
  if (buttons.length > 0) {
    buttons[0].click();
    console.log('已點擊第一個解讀按鈕');
  } else {
    console.log('未找到解讀按鈕');
  }
};

console.log('測試腳本已載入。您可以：');
console.log('1. 等待自動測試完成');
console.log('2. 手動執行：testIndicatorGuide()');
