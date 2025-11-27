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
    // 確保這裡的 key (鍵名) 與 Apps Script 中的表頭 (姓名, 電子郵件, 備註) 完全一致
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // 顯示載入狀態
    resultMessage.textContent = '正在提交...請稍候。';
    resultMessage.className = 'mt-4 text-center text-sage-500 block font-medium'; // 使用您的 sage 顏色

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
            resultMessage.className = 'mt-4 text-center text-green-600 block font-medium';
            form.reset(); // 清空表單
        } else {
            // 讀取 Apps Script 返回的錯誤訊息
            const errorText = await response.text(); 
            resultMessage.textContent = `❌ 提交失敗！伺服器錯誤: ${errorText.substring(0, 50)}...`;
            resultMessage.className = 'mt-4 text-center text-red-600 block font-medium';
        }

    } catch (error) {
        console.error('Fetch 錯誤:', error);
        resultMessage.textContent = '❌ 提交失敗！網路錯誤，請檢查連線。';
        resultMessage.className = 'mt-4 text-center text-red-600 block font-medium';
    }
}
