// 【重要】確認您的 Apps Script URL 正確
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby4opi6oUVwrGwJhQHNatkVji2yP0tLqC3JUpadcSxsUlruQEbj3SXQ1QauAzFpw0EEQw/exec'; 

// --- 輔助函數：處理複製按鈕 ---
function setupCopyButtons() {
    document.querySelectorAll('[id^="copy"]').forEach(button => {
        if (!button.dataset.setup) {
            button.addEventListener('click', function(e) {
                e.preventDefault(); 
                e.stopPropagation();
                
                let textToCopy = '';
                let labelElement = button.querySelector('span');
                
                if (button.id === 'copyLineIdButton') {
                    textToCopy = document.getElementById('lineIdToCopy').textContent;
                } else if (button.id === 'copyBankButton') {
                    // 假設銀行帳號是這個靜態字串
                    textToCopy = '0000-0000-0000'; 
                }
                
                if (textToCopy) {
                    navigator.clipboard.writeText(textToCopy.replace(/[\s-]/g, '')); // 移除空格和連字符
                    if (labelElement) labelElement.textContent = '已複製';
                    button.classList.remove('bg-sage-700', 'bg-sage-100');
                    button.classList.add('bg-green-100', 'text-green-700');
                    setTimeout(() => {
                        if (labelElement) labelElement.textContent = button.id === 'copyLineIdButton' ? '複製' : '複製';
                        button.classList.remove('bg-green-100', 'text-green-700');
                        button.classList.add(button.id === 'copyLineIdButton' ? 'bg-sage-700' : 'bg-sage-100');
                    }, 2000);
                }
            });
            button.dataset.setup = 'true'; // 標記已設定
        }
    });
}

// 在網頁載入完成後執行設定
document.addEventListener('DOMContentLoaded', setupCopyButtons);


// --- 表單提交邏輯 ---
async function handleFormSubmit(event) {
    event.preventDefault(); 

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const resultMessage = document.getElementById('resultMessage');
    
    // 設置提交狀態
    submitButton.disabled = true;
    submitButton.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 處理中...`;
    
    resultMessage.textContent = '正在提交...請稍候。';
    resultMessage.className = 'mt-4 text-center text-sage-500 block font-medium'; 

    // 1. 收集表單資料
    const formData = new FormData(form);
    const data = {};
    
    // 特別處理 '是否付款' 欄位，確保無論選擇 '已付款' 或 '未付款'，都能被正確捕捉
    formData.forEach((value, key) => {
        if (key === '是否付款' && value === '未付款') {
            data[key] = '未付款';
            // 如果未付款，將付款後五碼欄位設為空字串或特定標記
            data['付款後五碼'] = 'N/A (未付款)'; 
        } else if (key === '付款後五碼' && data['是否付款'] === '未付款') {
            // 忽略用戶在未付款狀態下可能輸入的後五碼
            return; 
        } else {
             data[key] = value;
        }
    });
    
    // 如果用戶選擇了 '已付款'，但是沒有填寫後五碼，我們可以在前端進行檢查（雖然 HTML required 已經處理）

    try {
        // 2. 發送 POST 請求
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(data), 
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // 3. 處理響應
        if (response.ok) {
            resultMessage.textContent = '✅ 報名成功！資料已累積。';
            resultMessage.className = 'mt-4 text-center text-green-600 block font-medium';
            // 由於這是靜態網頁，我們手動重設表單
            form.reset();
            // 重置提交狀態
            submitButton.disabled = false;
            submitButton.innerHTML = '確認報名';
        } else {
            const errorText = await response.text(); 
            resultMessage.textContent = `❌ 提交失敗！後端錯誤。請聯絡老師。`;
            resultMessage.className = 'mt-4 text-center text-red-600 block font-medium';
            // 重置提交狀態
            submitButton.disabled = false;
            submitButton.innerHTML = '確認報名';
        }

    } catch (error) {
        resultMessage.textContent = '❌ 提交失敗！網路錯誤，請檢查連線。';
        resultMessage.className = 'mt-4 text-center text-red-600 block font-medium';
        // 重置提交狀態
        submitButton.disabled = false;
        submitButton.innerHTML = '確認報名';
    }
}
