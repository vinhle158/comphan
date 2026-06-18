// Mapping days of the week to menu image filenames (for Image Mode)
const menuMapping = {
    1: 'MENU/THUHAI.jpg',
    2: 'MENU/THUBA.jpg',
    3: 'MENU/THU4.jpg',
    4: 'MENU/THUNAM.jpg',
    5: 'MENU/THUSAU.jpg',
    6: 'MENU/THUBAY.jpg',
    0: 'MENU/CHUNHAT.jpg'
};

// Map day numbers to readable Vietnamese names for subtitle
const vietnameseDays = {
    1: 'Thứ Hai',
    2: 'Thứ Ba',
    3: 'Thứ Tư',
    4: 'Thứ Năm',
    5: 'Thứ Sáu',
    6: 'Thứ Bảy',
    0: 'Chủ Nhật'
};

let currentSelectedDay = 1;
let currentViewMode = 'text';
let currentConfig = STORE_CONFIG; // Using the global variable from data.js

// DOM Elements
const menuImage = document.getElementById('menu-image');
const imageWrapper = document.getElementById('image-wrapper');
const dayTabs = document.querySelectorAll('.day-tab');
const currentDateEl = document.getElementById('current-date');
const menuSectionsContainer = document.getElementById('menu-sections-container');

// View toggle elements
const textMenuView = document.getElementById('text-menu-view');
const imageMenuView = document.getElementById('image-menu-view');
const viewModeBtns = document.querySelectorAll('.view-mode-btn');

// Contact elements
const zaloLinkEl = document.getElementById('zalo-link');
const toastContainer = document.getElementById('toast-container');
const hotlineTextEl = document.getElementById('hotline-text');
const priceValueEl = document.querySelector('.price-value');
const priceUnitEl = document.querySelector('.price-unit');
const deliveryHoursEl = document.getElementById('delivery-hours');
const deliveryPolicyEl = document.getElementById('delivery-policy');
const storeNameEl = document.querySelector('.header-info h1');

// Lightbox Elements
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');

// Helper function to return contextual food emoji icons
function getFoodIcon(itemName) {
    const nameLower = itemName.toLowerCase();
    if (nameLower.includes('cá') || nameLower.includes('đối') || nameLower.includes('thú')) return '🐟';
    if (nameLower.includes('thịt') || nameLower.includes('sườn') || nameLower.includes('ba rọi') || nameLower.includes('heo')) return '🐷';
    if (nameLower.includes('gà') || nameLower.includes('vịt')) return '🍗';
    if (nameLower.includes('ếch')) return '🐸';
    if (nameLower.includes('lươn') || nameLower.includes('lưỡn')) return '🐍';
    if (nameLower.includes('tép') || nameLower.includes('tôm')) return '🍤';
    if (nameLower.includes('trứng')) return '🍳';
    if (nameLower.includes('chả')) return '🍥';
    if (nameLower.includes('đậu hũ') || nameLower.includes('đậu hủ')) return '🧀';
    return '🍱';
}

function getSoupIcon(itemName) {
    const nameLower = itemName.toLowerCase();
    if (nameLower.includes('khổ qua')) return '🍲';
    if (nameLower.includes('chua')) return '🥣';
    if (nameLower.includes('bí')) return '🎃';
    if (nameLower.includes('mướp') || nameLower.includes('tơi')) return '🥬';
    if (nameLower.includes('cải')) return '🥗';
    if (nameLower.includes('rong biển')) return '🍀';
    return '🥣';
}

function getVegetableIcon(itemName) {
    const nameLower = itemName.toLowerCase();
    if (nameLower.includes('bắp cải')) return '🥬';
    if (nameLower.includes('rau muống') || nameLower.includes('que') || nameLower.includes('đũa')) return '🥦';
    if (nameLower.includes('bắp luộc') || nameLower.includes('xu')) return '🥗';
    return '🥦';
}

// Generate the menu blocks dynamically
function renderMenuBlocks() {
    if (!currentConfig.menus) return;
    
    menuSectionsContainer.innerHTML = ''; // Clear existing content

    Object.keys(currentConfig.menus).forEach(dayKey => {
        const dayData = currentConfig.menus[dayKey];
        const dayBlock = document.createElement('div');
        dayBlock.className = 'day-menu-block hidden';
        dayBlock.id = `menu-block-${dayKey}`;

        // 1. Món Mặn Section
        const manSection = createMenuSection('Món Mặn', '🥩', dayData.man || [], 'grid-list mon-man-list', getFoodIcon);
        dayBlock.appendChild(manSection);

        // 2. Row for Canh & Xào
        const row = document.createElement('div');
        row.className = 'menu-section-row';
        
        const canhSection = createMenuSection('Món Canh', '🥣', dayData.canh || [], 'mon-canh-list flex-1', getSoupIcon);
        const xaoSection = createMenuSection('Món Xào', '🥦', dayData.xao || [], 'mon-xao-list flex-1', getVegetableIcon);
        
        row.appendChild(canhSection);
        row.appendChild(xaoSection);
        dayBlock.appendChild(row);

        // 3. Món Gọi Thêm Section
        const addonSection = createAddonSection(dayData.goithem || []);
        dayBlock.appendChild(addonSection);

        menuSectionsContainer.appendChild(dayBlock);
    });
}

function createMenuSection(title, icon, items, listClass, iconFunc) {
    const section = document.createElement('div');
    section.className = 'menu-section';
    if (listClass.includes('flex-1')) section.classList.add('flex-1');

    section.innerHTML = `
        <div class="section-title">
            <span class="section-icon">${icon}</span>
            <h2>${title}</h2>
        </div>
        <ul class="item-list ${listClass}"></ul>
    `;

    const list = section.querySelector('ul');
    items.forEach(itemName => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="select-indicator"></span>
            <span class="section-icon">${iconFunc(itemName)}</span>
            <span class="food-name">${itemName}</span>
        `;
        li.addEventListener('click', () => {
            li.classList.toggle('selected');
            updateOrderButton();
        });
        list.appendChild(li);
    });

    return section;
}

function createAddonSection(addons) {
    const section = document.createElement('div');
    section.className = 'menu-section optional-section';
    
    section.innerHTML = `
        <div class="section-title">
            <span class="section-icon">🍲</span>
            <h2>Món Gọi Thêm</h2>
        </div>
        <ul class="item-list addon-list"></ul>
    `;

    const list = section.querySelector('ul');
    addons.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="select-indicator"></span>
                <span class="section-icon">🍲</span>
                <span class="food-name">${item.name}</span>
            </div>
            <span class="addon-price">${item.price}</span>
        `;
        li.addEventListener('click', () => {
            li.classList.toggle('selected');
            updateOrderButton();
        });
        list.appendChild(li);
    });

    return section;
}

// Switch showing menu block depending on day index
function selectDay(dayIndex) {
    currentSelectedDay = dayIndex;
    const dayMenuBlocks = document.querySelectorAll('.day-menu-block');

    // 1. Show correct day menu block and hide others
    dayMenuBlocks.forEach(block => {
        const blockId = `menu-block-${dayIndex}`;
        if (block.id === blockId) {
            block.classList.remove('hidden');
            // Remove selections inside active day
            block.querySelectorAll('.item-list li').forEach(li => li.classList.remove('selected'));
        } else {
            block.classList.add('hidden');
        }
    });

    // 2. Load the menu image
    loadImageMenu(dayIndex);

    // 3. Highlight day tab in navigation
    dayTabs.forEach(tab => {
        if (parseInt(tab.dataset.day) === parseInt(dayIndex)) {
            tab.classList.add('active');
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            tab.classList.remove('active');
        }
    });

    // 4. Update the Zalo order button
    updateOrderButton();
}

// Load menu image for a specific day
function loadImageMenu(dayIndex) {
    const filename = menuMapping[dayIndex];
    if (!filename) return;

    imageWrapper.classList.add('is-loading');
    menuImage.classList.add('loading');

    const tempImg = new Image();
    tempImg.src = filename;
    tempImg.onload = function() {
        menuImage.src = filename;
        menuImage.alt = `Thực đơn ${vietnameseDays[dayIndex]}`;
        imageWrapper.classList.remove('is-loading');
        menuImage.classList.remove('loading');
    };
    
    tempImg.onerror = function() {
        console.error(`Failed to load image: ${filename}`);
        menuImage.alt = 'Không thể tải hình ảnh thực đơn cho ngày này.';
        imageWrapper.classList.remove('is-loading');
        menuImage.classList.remove('loading');
    };
}

// Format and display current date in header
function displayCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    let formattedDate = today.toLocaleDateString('vi-VN', options);
    
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    currentDateEl.textContent = `Hôm nay: ${formattedDate}`;
}

// Lightbox controller
function openLightbox() {
    lightboxImage.src = menuImage.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Set view mode (text or image)
function setViewMode(mode) {
    currentViewMode = mode;
    
    viewModeBtns.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (mode === 'text') {
        textMenuView.classList.remove('hidden');
        imageMenuView.classList.add('hidden');
    } else {
        imageMenuView.classList.remove('hidden');
        textMenuView.classList.add('hidden');
        loadImageMenu(currentSelectedDay);
    }
}

// Show Toast Notification
let toastTimeout;
function showToast() {
    clearTimeout(toastTimeout);
    toastContainer.classList.add('show');
    toastTimeout = setTimeout(() => {
        toastContainer.classList.remove('show');
    }, 4500);
}

// Apply configuration to UI elements
function applyConfig() {
    // Update header store name
    if (currentConfig.storeName) {
        storeNameEl.textContent = currentConfig.storeName.toUpperCase();
    }

    // Update hotline in call button
    if (currentConfig.hotline) {
        const formattedHotline = currentConfig.hotline.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        hotlineTextEl.textContent = formattedHotline;
        zaloLinkEl.href = `https://zalo.me/${currentConfig.hotline}`;
        document.getElementById('call-link').href = `tel:${currentConfig.hotline}`;
    }

    // Update price
    if (currentConfig.priceValue) {
        let price = currentConfig.priceValue;
        if (!price.includes('đ')) price += 'đ';
        priceValueEl.textContent = price;
    }
    if (currentConfig.priceUnit) {
        priceUnitEl.textContent = currentConfig.priceUnit;
    }

    // Update delivery info
    if (currentConfig.deliveryHours) {
        deliveryHoursEl.textContent = currentConfig.deliveryHours;
    }
    if (currentConfig.deliveryPolicy) {
        deliveryPolicyEl.textContent = currentConfig.deliveryPolicy;
    }
}

// Update Order Zalo button text and styling based on selection count
function updateOrderButton() {
    const activeBlock = document.getElementById(`menu-block-${currentSelectedDay}`);
    const selectedElements = activeBlock ? activeBlock.querySelectorAll('.item-list li.selected') : [];
    const count = selectedElements.length;
    const btnText = zaloLinkEl.querySelector('span:last-child');

    if (count > 0) {
        btnText.textContent = `Đặt ${count} món qua Zalo`;
        zaloLinkEl.classList.add('glow-button');
    } else {
        btnText.textContent = `Nhắn Zalo`;
        zaloLinkEl.classList.remove('glow-button');
    }
}

// Event Listeners
dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const selectedDay = parseInt(tab.dataset.day);
        selectDay(selectedDay);
    });
});

viewModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setViewMode(btn.dataset.mode);
    });
});

menuImage.addEventListener('click', openLightbox);
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Zalo link listener to intercept ordering
zaloLinkEl.addEventListener('click', (e) => {
    const activeBlock = document.getElementById(`menu-block-${currentSelectedDay}`);
    const selectedElements = activeBlock ? activeBlock.querySelectorAll('.item-list li.selected') : [];
    
    if (selectedElements.length > 0) {
        e.preventDefault();

        const orderSummary = {
            'Món Mặn': [],
            'Món Canh': [],
            'Món Xào': [],
            'Món Gọi Thêm': []
        };

        selectedElements.forEach(el => {
            const name = el.querySelector('.food-name').textContent.trim();
            const section = el.closest('.menu-section').querySelector('h2').textContent.trim();
            
            if (orderSummary[section]) {
                orderSummary[section].push(name);
            } else {
                orderSummary[section] = [name];
            }
        });

        const dayName = vietnameseDays[currentSelectedDay];
        let msgText = `Chào ${currentConfig.storeName || 'Cơm Phần Chất Lượng'}! Tôi muốn đặt cơm trưa (${dayName}):\n`;
        
        for (const [section, items] of Object.entries(orderSummary)) {
            if (items.length > 0) {
                msgText += `\n[${section.toUpperCase()}]\n`;
                items.forEach(item => {
                    msgText += `- ${item}\n`;
                });
            }
        }
        
        msgText += `\n-------------------------\n📞 SĐT người nhận: \n📍 Địa chỉ giao: `;

        navigator.clipboard.writeText(msgText).then(() => {
            showToast();
            const hotline = currentConfig.hotline || '0987785876';
            setTimeout(() => {
                window.open(`https://zalo.me/${hotline}`, "_blank");
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
            const hotline = currentConfig.hotline || '0987785876';
            window.open(`https://zalo.me/${hotline}`, "_blank");
        });
    }
});

// Initialize the application
function initApp() {
    displayCurrentDate();
    renderMenuBlocks();
    applyConfig();
    
    // Auto-detect current day of week and load the menu
    const currentDay = new Date().getDay();
    selectDay(currentDay);
    
    setViewMode('text');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}