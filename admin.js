// Configuration variables
const CONFIG_API = '/api/config';
let currentConfig = {};
let activeEditingDay = 1; // Default to Monday (1)

// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password-input');
const adminDashboard = document.getElementById('admin-dashboard');
const logoutBtn = document.getElementById('logout-btn');

// Form inputs
const storeNameInput = document.getElementById('store-name');
const hotlineInput = document.getElementById('hotline');
const priceValueInput = document.getElementById('price-value');
const priceUnitInput = document.getElementById('price-unit');
const deliveryHoursInput = document.getElementById('delivery-hours');
const deliveryPolicyInput = document.getElementById('delivery-policy');

// Tab inputs
const tabBtns = document.querySelectorAll('.tab-btn');
const monManInput = document.getElementById('mon-man-input');
const monCanhInput = document.getElementById('mon-canh-input');
const monXaoInput = document.getElementById('mon-xao-input');
const monGoiThemInput = document.getElementById('mon-goi-them-input');
const monManLabel = document.getElementById('mon-man-label');

// Action buttons & feedback
const saveBtn = document.getElementById('save-btn');
const adminToast = document.getElementById('admin-toast');
const toastText = document.getElementById('toast-text');
const toastIcon = document.getElementById('toast-icon');

// 1. Authentication Logic
function checkLogin() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        loginOverlay.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadStoreConfig();
    } else {
        loginOverlay.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();
    if (password === 'admin123') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        checkLogin();
        showToastNotification('Đăng nhập thành công!', '🔑');
    } else {
        showToastNotification('Sai mật khẩu! Vui lòng thử lại.', '❌');
        passwordInput.value = '';
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    checkLogin();
    showToastNotification('Đã đăng xuất.', '🚪');
});

// 2. Toast notifications
let toastTimeout;
function showToastNotification(text, icon = '💾') {
    clearTimeout(toastTimeout);
    toastText.textContent = text;
    toastIcon.textContent = icon;
    adminToast.classList.add('show');
    toastTimeout = setTimeout(() => {
        adminToast.classList.remove('show');
    }, 3500);
}

// 3. Database Fetch & Form Binding
function loadStoreConfig() {
    fetch(CONFIG_API)
        .then(response => {
            if (!response.ok) throw new Error('API fetch failed');
            return response.json();
        })
        .then(data => {
            currentConfig = data;
            
            // Populate store details
            storeNameInput.value = data.storeName || '';
            hotlineInput.value = data.hotline || '';
            priceValueInput.value = data.priceValue || '';
            priceUnitInput.value = data.priceUnit || '';
            deliveryHoursInput.value = data.deliveryHours || '';
            deliveryPolicyInput.value = data.deliveryPolicy || '';

            // Render default editing day tab
            activeEditingDay = 1;
            highlightActiveTab(activeEditingDay);
            loadDayMenuFields(activeEditingDay);
        })
        .catch(err => {
            console.error('Failed to load menu configuration:', err);
            showToastNotification('Lỗi kết nối cơ sở dữ liệu!', '❌');
        });
}

// 4. Menu Fields Mapping & Formatting
function loadDayMenuFields(dayIndex) {
    const dayMenu = currentConfig.menus && currentConfig.menus[dayIndex];
    if (!dayMenu) {
        monManInput.value = '';
        monCanhInput.value = '';
        monXaoInput.value = '';
        monGoiThemInput.value = '';
        return;
    }

    // Set labels
    const dayNames = { 1:'Thứ 2', 2:'Thứ 3', 3:'Thứ 4', 4:'Thứ 5', 5:'Thứ 6', 6:'Thứ 7', 0:'Chủ Nhật' };
    monManLabel.textContent = `Món Mặn - ${dayNames[dayIndex]} (Mỗi món viết 1 dòng)`;

    // Map arrays to strings (one item per line)
    monManInput.value = (dayMenu.man || []).join('\n');
    monCanhInput.value = (dayMenu.canh || []).join('\n');
    monXaoInput.value = (dayMenu.xao || []).join('\n');
    
    // Map addon arrays (e.g. {name: "Canh khổ qua", price: "35K"}) to "name : price" text format
    const formattedAddons = (dayMenu.goithem || []).map(item => `${item.name} : ${item.price}`);
    monGoiThemInput.value = formattedAddons.join('\n');
}

// Save active form elements to local config memory
function saveActiveFieldsToMemory(dayIndex) {
    if (!currentConfig.menus) currentConfig.menus = {};
    if (!currentConfig.menus[dayIndex]) currentConfig.menus[dayIndex] = {};

    // 1. Save Món Mặn
    currentConfig.menus[dayIndex].man = monManInput.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');

    // 2. Save Món Canh
    currentConfig.menus[dayIndex].canh = monCanhInput.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');

    // 3. Save Món Xào
    currentConfig.menus[dayIndex].xao = monXaoInput.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');

    // 4. Save Món Gọi Thêm
    currentConfig.menus[dayIndex].goithem = monGoiThemInput.value
        .split('\n')
        .map(line => {
            const trimmed = line.trim();
            if (trimmed === '') return null;
            
            // Split by colon to extract name and price
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > -1) {
                const name = trimmed.substring(0, colonIndex).trim();
                const price = trimmed.substring(colonIndex + 1).trim();
                return { name, price };
            }
            
            // Fallback price if colon is missing
            return { name: trimmed, price: '35K' };
        })
        .filter(item => item !== null);
}

// Highlight the active day settings tab
function highlightActiveTab(dayIndex) {
    tabBtns.forEach(btn => {
        if (parseInt(btn.dataset.day) === parseInt(dayIndex)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Tab click handler
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetDay = parseInt(btn.dataset.day);
        if (targetDay === activeEditingDay) return;

        // Save current day to memory before switching
        saveActiveFieldsToMemory(activeEditingDay);
        
        // Switch editing focus
        activeEditingDay = targetDay;
        highlightActiveTab(activeEditingDay);
        loadDayMenuFields(activeEditingDay);
    });
});

// 5. Save config changes to API POST endpoint
saveBtn.addEventListener('click', () => {
    // 1. Save the currently active day's fields to memory first
    saveActiveFieldsToMemory(activeEditingDay);

    // 2. Retrieve store general configuration fields
    currentConfig.storeName = storeNameInput.value.trim();
    currentConfig.hotline = hotlineInput.value.trim();
    currentConfig.priceValue = priceValueInput.value.trim();
    currentConfig.priceUnit = priceUnitInput.value.trim();
    currentConfig.deliveryHours = deliveryHoursInput.value.trim();
    currentConfig.deliveryPolicy = deliveryPolicyInput.value.trim();

    // Validate main requirements
    if (!currentConfig.storeName || !currentConfig.hotline) {
        showToastNotification('Tên quán và Số điện thoại không được để trống!', '⚠️');
        return;
    }

    // 3. Post data payload to server
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Đang lưu cấu hình...';

    fetch(CONFIG_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(currentConfig)
    })
    .then(response => {
        if (!response.ok) throw new Error('API save failed');
        return response.json();
    })
    .then(data => {
        showToastNotification('Lưu tất cả thay đổi thành công!', '💾');
    })
    .catch(err => {
        console.error('Failed to save configuration:', err);
        showToastNotification('Gặp lỗi khi lưu! Hãy kiểm tra kết nối server.', '❌');
    })
    .finally(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Lưu Tất Cả Thay Đổi';
    });
});

// Run initial login gate check
checkLogin();
