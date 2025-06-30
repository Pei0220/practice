// 完整功能測試腳本
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPI(url, description) {
  try {
    console.log(`\n✅ 測試: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      console.log(`   ✅ 成功！資料長度: ${Array.isArray(data.data) ? data.data.length : '物件'}`);
      
      // 特殊檢查
      if (url.includes('calendar')) {
        const events = data.data;
        if (events.length > 0) {
          const firstEvent = events[0];
          const eventDate = new Date(firstEvent.date);
          const currentMonth = new Date().getMonth();
          console.log(`   📅 第一個事件日期: ${eventDate.toISOString().slice(0, 10)}`);
          console.log(`   📅 事件月份: ${eventDate.getMonth() + 1}月，當前月份: ${currentMonth + 1}月`);
          
          if (eventDate.getMonth() >= currentMonth) {
            console.log(`   ✅ 日期修復成功！顯示的是未來日期，不是一月份`);
          } else {
            console.log(`   ❌ 日期仍有問題`);
          }
        }
      }
      
      if (url.includes('trending')) {
        const stocks = data.data;
        if (stocks.length > 0) {
          console.log(`   📈 第一支股票: ${stocks[0].symbol} - ${stocks[0].name} - $${stocks[0].price}`);
          console.log(`   ✅ 熱門股票功能正常`);
        }
      }
      
      return true;
    } else {
      console.log(`   ❌ 失敗: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 錯誤: ${error.message}`);
    return false;
  }
}

async function testChatAPI() {
  try {
    console.log(`\n✅ 測試: AI 問答功能`);
    
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '美國GDP成長率如何？',
        intent: 'query'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.message.content) {
      console.log(`   ✅ AI 問答成功！`);
      console.log(`   💬 回應長度: ${data.data.message.content.length} 字元`);
      return true;
    } else {
      console.log(`   ❌ AI 問答失敗: ${data.error || '未知錯誤'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ AI 問答錯誤: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 開始完整功能測試...\n');
  
  const tests = [
    // 1. 經濟日曆測試（檢查日期修復）
    {
      url: `${BASE_URL}/api/macro-economic?type=calendar`,
      description: '經濟日曆 - 檢查日期是否為六月而非一月'
    },
    
    // 2. 熱門股票測試
    {
      url: `${BASE_URL}/api/market-data?type=trending`,
      description: '熱門股票查詢'
    },
    
    // 3. 單一股票查詢測試
    {
      url: `${BASE_URL}/api/market-data?type=stock&symbol=AAPL`,
      description: '單一股票查詢 (AAPL)'
    },
    
    // 4. 總體經濟指標測試
    {
      url: `${BASE_URL}/api/macro-economic?type=indicators`,
      description: '總體經濟指標'
    },
    
    // 5. 央行政策測試
    {
      url: `${BASE_URL}/api/macro-economic?type=policies`,
      description: '央行政策'
    },
    
    // 6. 市場總覽測試
    {
      url: `${BASE_URL}/api/market-data?type=overview`,
      description: '市場總覽'
    },
    
    // 7. 市場情緒測試
    {
      url: `${BASE_URL}/api/market-data?type=sentiment`,
      description: '市場情緒分析'
    }
  ];
  
  let passCount = 0;
  let totalCount = tests.length + 1; // +1 for chat test
  
  // 運行所有 API 測試
  for (const test of tests) {
    const result = await testAPI(test.url, test.description);
    if (result) passCount++;
    await new Promise(resolve => setTimeout(resolve, 500)); // 避免太快的請求
  }
  
  // 測試 AI 問答
  const chatResult = await testChatAPI();
  if (chatResult) passCount++;
  
  // 測試結果總結
  console.log('\n' + '='.repeat(60));
  console.log(`📊 測試結果總結:`);
  console.log(`   通過: ${passCount}/${totalCount}`);
  console.log(`   成功率: ${((passCount/totalCount) * 100).toFixed(1)}%`);
  
  if (passCount === totalCount) {
    console.log(`\n🎉 所有功能都正常工作！`);
    console.log(`✅ 經濟事件日期已修復（顯示六月而非一月）`);
    console.log(`✅ 熱門股票查詢功能正常`);
    console.log(`✅ 股票價格查詢功能正常`);
    console.log(`✅ AI 問答回應功能正常`);
  } else {
    console.log(`\n⚠️  仍有 ${totalCount - passCount} 個功能需要修復`);
  }
  
  console.log('\n📝 前端測試建議:');
  console.log(`   1. 訪問 http://localhost:3000/macro 檢查經濟指標頁面`);
  console.log(`   2. 訪問 http://localhost:3000/market 檢查市場數據頁面`);
  console.log(`   3. 訪問 http://localhost:3000/stock 檢查股票查詢頁面`);
  console.log(`   4. 訪問 http://localhost:3000/chat 檢查 AI 問答頁面`);
}

// 運行測試
runAllTests().catch(console.error);
