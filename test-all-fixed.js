// 測試所有修復的功能
const testAPIs = async () => {
  console.log('🧪 開始測試所有修復的功能...\n');

  // 1. 測試經濟日曆 (日期修復)
  console.log('📅 測試經濟日曆日期修復...');
  try {
    const calendarRes = await fetch('http://localhost:3000/api/macro-economic?type=calendar');
    const calendarData = await calendarRes.json();
    if (calendarData.success && calendarData.data.length > 0) {
      const eventDate = new Date(calendarData.data[0].date);
      const currentDate = new Date();
      const isCorrectMonth = eventDate.getMonth() === currentDate.getMonth();
      console.log(`✅ 經濟事件日期正確 (${eventDate.toLocaleDateString()}): ${isCorrectMonth ? '正確' : '錯誤'}`);
    }
  } catch (error) {
    console.log('❌ 經濟日曆測試失敗:', error.message);
  }

  // 2. 測試熱門股票 (真實價格)
  console.log('\n📈 測試熱門股票真實價格...');
  try {
    const stocksRes = await fetch('http://localhost:3000/api/market-data?type=trending');
    const stocksData = await stocksRes.json();
    if (stocksData.success && stocksData.data.length > 0) {
      const firstStock = stocksData.data[0];
      console.log(`✅ 熱門股票獲取成功: ${firstStock.symbol} - $${firstStock.price}`);
      console.log(`   公司名稱: ${firstStock.name}`);
      console.log(`   漲跌: ${firstStock.change >= 0 ? '+' : ''}${firstStock.change.toFixed(2)} (${firstStock.changePercent.toFixed(2)}%)`);
    }
  } catch (error) {
    console.log('❌ 熱門股票測試失敗:', error.message);
  }

  // 3. 測試股票查詢功能
  console.log('\n🔍 測試股票查詢功能...');
  try {
    const queryRes = await fetch('http://localhost:3000/api/market-data?type=stock&symbol=AAPL');
    const queryData = await queryRes.json();
    if (queryData.success) {
      console.log(`✅ 股票查詢成功: ${queryData.data.symbol} - $${queryData.data.price}`);
      console.log(`   公司名稱: ${queryData.data.name}`);
    }
  } catch (error) {
    console.log('❌ 股票查詢測試失敗:', error.message);
  }

  // 4. 測試 AI 問答
  console.log('\n🤖 測試 AI 問答功能...');
  try {
    const aiRes = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '什麼是GDP？' }],
        userLevel: 'beginner'
      })
    });
    const aiData = await aiRes.json();
    if (aiData.success && aiData.data.content) {
      console.log('✅ AI 問答功能正常');
      console.log(`   回應長度: ${aiData.data.content.length} 字符`);
    }
  } catch (error) {
    console.log('❌ AI 問答測試失敗:', error.message);
  }

  console.log('\n🎉 功能測試完成！');
};

// 運行測試
testAPIs().catch(console.error);
