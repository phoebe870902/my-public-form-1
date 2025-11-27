// 【重要】將您的 Apps Script URL 替換到這裡
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby4opi6oUVwrGwJhQHNatkVji2yP0tLqC3JUpadcSxsUlruQEbj3SXQ1QauAzFpw0EEQw/exec'; 

async function handleFormSubmit(event) {
    // 阻止表單的傳統提交方式
    event.preventDefault(); 

    const form = event.target;
    const resultMessage = document.getElementById('resultMessage');
    
    // 收集表單資料
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        // 將資料鍵值對儲存在物件中，鍵名會成為 Google Sheet 的欄位標題
        data[key] = value;
    });

    // 顯示載入狀態
    resultMessage.textContent = '正在提交...請稍候。';
    resultMessage.className = 'mt-4 text-center text-blue-500 block';

    try {
        // 使用 fetch 將資料以 POST 請求發送到 Apps Script
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(data), // 將資料以 JSON 格式發送
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // 檢查 HTTP 狀態碼
        if (response.ok) {
            resultMessage.textContent = '✅ 報名成功！資料已累積。';
            resultMessage.className = 'mt-4 text-center text-green-600 block';
            form.reset(); // 清空表單
        } else {
            resultMessage.textContent = '❌ 提交失敗！請檢查 Apps Script 設定或稍後再試。';
            resultMessage.className = 'mt-4 text-center text-red-600 block';
        }

    } catch (error) {
        console.error('Fetch 錯誤:', error);
        resultMessage.textContent = '❌ 提交失敗！網路或伺服器錯誤。';
        resultMessage.className = 'mt-4 text-center text-red-600 block';
    }
}
