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
                let labelElement = button.querySelector('span#copyLineIdLabel, span#copyBankLabel');
                
                if (button.id === 'copyLineIdButton') {
                    textToCopy = document.getElementById('lineIdToCopy').textContent;
                } else if (button.id === 'copyBankButton') {
                    // 根據靜態 HTML 中的內容
                    textToCopy = '0000-0000-0000'; 
                }
                
                if (textToCopy) {
                    navigator.clipboard.writeText(textToCopy.replace(/[\s-]/g, ''));
                    if (labelElement) labelElement.textContent = '已複製';
                    // 確保複製樣式和原始樣式切換正確
                    const originalBg = button.id === 'copyLineIdButton' ? 'bg-sage-700' : 'bg-sage-100';
                    const originalText = button.id === 'copyLineIdButton' ? 'text-green-100' : 'text-sage-600';

                    button.classList.remove(originalBg, originalText);
                    button.classList.add('bg-green-100', 'text-green-700');
                    
                    setTimeout(() => {
                        if (labelElement) labelElement.textContent = '複製';
                        button.classList.remove('bg-green-100', 'text-green-700');
                        button.classList.add(originalBg, originalText);
                    }, 2000);
                }
            });
            button.dataset.setup = 'true';
        }
    });
}

// 在網頁載入完成後執行設定
document.addEventListener('DOMContentLoaded', setupCopyButtons);


// --- 表單提交邏輯 ---
async function handleFormSubmit(event) {
    event.preventDefault(); 

    const form = event.target;
    const submitButton = document.getElementById('submitButton');
    const resultMessage = document.getElementById('resultMessage');
    
    // 設置提交狀態
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 處理中...`;
    
    resultMessage.textContent = '正在提交...請稍候。';
    resultMessage.className = 'mt-4 text-center text-sage-500 block font-medium'; 

    // 1. 收集表單資料
    const formData = new FormData(form);
    const data = {};
    const selectedCourses = [];
    let isPaidValue = '未付款'; // 預設值

    for (const [key, value] of formData.entries()) {
        if (key === '課程選擇[]') {
            selectedCourses.push(value);
        } else if (key === '是否付款') {
            isPaidValue = value;
            data[key] = value;
        } else {
            data[key] = value;
        }
    }
    
    // 2. 將所有課程選擇合併為一個字串，便於寫入試算表的一個儲存格
    data['課程選擇'] = selectedCourses.join(' / '); 
    // 移除陣列形式的 key
    delete data['課程選擇[]']; 
    
    // 3. 處理付款後五碼邏輯
    if (isPaidValue === '未付款') {
        data['付款後五碼'] = 'N/A (未付款)';
    }
    // 如果選擇已付款，但後五碼欄位是空的，我們會讓瀏覽器內建的 required 檢查處理 (如果前面有 required 屬性)


    try {
        // 4. 發送 POST 請求
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(data), 
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // 5. 處理響應
        if (response.ok) {
            resultMessage.textContent = '✅ 報名成功！資料已累積。';
            resultMessage.className = 'mt-4 text-center text-green-600 block font-medium';
            form.reset();
        } else {
            resultMessage.textContent = `❌ 提交失敗！後端錯誤。請聯絡老師。`;
            resultMessage.className = 'mt-4 text-center text-red-600 block font-medium';
        }

    } catch (error) {
        resultMessage.textContent = '❌ 提交失敗！網路錯誤，請檢查連線。';
        resultMessage.className = 'mt-4 text-center text-red-600 block font-medium';
    } finally {
        // 無論成功或失敗，都恢復按鈕狀態
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}
