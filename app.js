/* ==========================================
   AeroFinance JS — Application Logic & Charts
   ========================================== */

// Initialize state
let state = {
  accounts: [],
  transactions: [],
  currentCurrency: 'RUB'
};

// Available expense categories (budgets in Rubles)
const EXPENSE_CATEGORIES = [
  { name: 'Продукты', icon: '🛒', color: 'var(--purple)', budget: 35000 },
  { name: 'Рестораны', icon: '🍽️', color: 'var(--rose)', budget: 15000 },
  { name: 'Транспорт', icon: '🚗', color: 'var(--cyan)', budget: 8000 },
  { name: 'Развлечения', icon: '🎬', color: 'var(--amber)', budget: 12000 },
  { name: 'Покупки', icon: '🛍️', color: 'var(--blue)', budget: 25000 },
  { name: 'Жилье', icon: '🏠', color: 'var(--purple)', budget: 30000 },
  { name: 'Здоровье', icon: '💊', color: 'var(--emerald)', budget: 10000 },
  { name: 'Другое', icon: '📦', color: 'var(--text-muted)', budget: 15000 }
];

// Color mapping for account templates
const COLOR_MAP = {
  purple: '#8b5cf6',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b'
};

// Seed/Mock data in Rubles
const SEED_ACCOUNTS = [
  { id: 'acc-1', name: 'Сбербанк', balance: 245000, type: 'card', color: 'purple' },
  { id: 'acc-2', name: 'Наличные', balance: 35000, type: 'cash', color: 'cyan' },
  { id: 'acc-3', name: 'Накопительный счет', balance: 850000, type: 'savings', color: 'emerald' }
];

const SEED_TRANSACTIONS = [
  { id: 'tx-1', type: 'income', amount: 150000, category: 'Работа', accountId: 'acc-1', date: getRelativeDate(0), note: 'Заработная плата' },
  { id: 'tx-2', type: 'expense', amount: 4500, category: 'Продукты', accountId: 'acc-1', date: getRelativeDate(-1), note: 'Супермаркет' },
  { id: 'tx-3', type: 'expense', amount: 1200, category: 'Рестораны', accountId: 'acc-1', date: getRelativeDate(-2), note: 'Обед в кафе' },
  { id: 'tx-4', type: 'expense', amount: 350, category: 'Транспорт', accountId: 'acc-2', date: getRelativeDate(-2), note: 'Автобус/Метро' },
  { id: 'tx-5', type: 'expense', amount: 8000, category: 'Развлечения', accountId: 'acc-1', date: getRelativeDate(-3), note: 'Билеты в кино' },
  { id: 'tx-6', type: 'expense', amount: 12000, category: 'Покупки', accountId: 'acc-1', date: getRelativeDate(-4), note: 'Одежда' },
  { id: 'tx-7', type: 'income', amount: 5000, category: 'Перевод', accountId: 'acc-2', date: getRelativeDate(-5), note: 'Перевод от друга' },
  { id: 'tx-8', type: 'expense', amount: 2400, category: 'Здоровье', accountId: 'acc-1', date: getRelativeDate(-6), note: 'Аптека' }
];

// Exchange rates config (base is RUB)
const EXCHANGE_RATES = {
  RUB: 1,
  USD: 90, // 1 USD = 90 RUB
  EUR: 97  // 1 EUR = 97 RUB
};

// Helper to get dates relative to today
function getRelativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Format currency (handles conversion dynamically based on state.currentCurrency)
function formatCurrency(amount) {
  try {
    const currency = state.currentCurrency || 'RUB';
    const rate = EXCHANGE_RATES[currency] || 1;
    const converted = amount / rate;
    
    if (currency === 'RUB') {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(converted);
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(converted);
    } else if (currency === 'EUR') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(converted);
    }
    return converted.toFixed(0) + ' ' + currency;
  } catch (e) {
    console.warn("Currency formatting failed, using fallback.", e);
    const symbol = state.currentCurrency === 'USD' ? '$' : state.currentCurrency === 'EUR' ? '€' : '₽';
    const rate = EXCHANGE_RATES[state.currentCurrency] || 1;
    return (amount / rate).toFixed(0) + ' ' + symbol;
  }
}

// -------------------------------------------------------------
// Core Setup & Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Load data from localStorage or seed
  loadData();
  
  // Set current date in header
  updateHeaderDate();
  
  // Bind UI Elements and Event Listeners
  setupNavigation();
  setupBottomSheets();
  setupForms();
  setupHistoryFilters();
  setupCurrencySelector();
  setupProfileSettings();
  
  // Initial render
  renderApp();
  
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

function setupCurrencySelector() {
  const selector = document.getElementById('currencySelector');
  if (!selector) return;
  
  // Set initial active state based on loaded currency
  const activeBtn = selector.querySelector(`.currency-btn[data-currency="${state.currentCurrency}"]`);
  if (activeBtn) {
    selector.querySelectorAll('.currency-btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }
  
  selector.querySelectorAll('.currency-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = btn.getAttribute('data-currency');
      state.currentCurrency = cur;
      
      // Update active styling
      selector.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Persist choice
      try {
        localStorage.setItem('af_currency', cur);
      } catch (err) {}
      
      // Re-render to show converted values
      renderApp();
    });
  });
}

// Update today's date in human readable format
function updateHeaderDate() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString('ru-RU', options);
  }
}

// Storage Helpers
function loadData() {
  try {
    state.currentCurrency = localStorage.getItem('af_currency') || 'RUB';
    state.profileName = localStorage.getItem('af_profile_name') || 'Пользователь';
    state.profileAvatar = localStorage.getItem('af_profile_avatar') || 'preset-1';
    
    const storedAccounts = localStorage.getItem('af_accounts');
    const storedTransactions = localStorage.getItem('af_transactions');
    
    if (storedAccounts && storedTransactions) {
      state.accounts = JSON.parse(storedAccounts);
      state.transactions = JSON.parse(storedTransactions);
    } else {
      // Fresh launch: use seed data
      state.accounts = [...SEED_ACCOUNTS];
      state.transactions = [...SEED_TRANSACTIONS];
      saveData();
    }
  } catch (e) {
    console.warn("Storage access is blocked or failed. Using seed data.", e);
    state.currentCurrency = 'RUB';
    state.profileName = 'Пользователь';
    state.profileAvatar = 'preset-1';
    state.accounts = [...SEED_ACCOUNTS];
    state.transactions = [...SEED_TRANSACTIONS];
  }
}

function saveData() {
  try {
    localStorage.setItem('af_accounts', JSON.stringify(state.accounts));
    localStorage.setItem('af_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('af_profile_name', state.profileName || 'Пользователь');
    localStorage.setItem('af_profile_avatar', state.profileAvatar || 'preset-1');
  } catch (e) {
    console.warn("Storage write failed.", e);
  }
}

// -------------------------------------------------------------
// Navigation (Tab Switching)
// -------------------------------------------------------------
function setupNavigation() {
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-target');
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update active pane
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === targetTab) {
          pane.classList.add('active');
        }
      });
      
      // Recalculate and re-render charts when switching tabs to trigger animations
      setTimeout(() => {
        renderCharts();
      }, 50);
    });
  });
}

// -------------------------------------------------------------
// Bottom Sheets (Modals Drawer)
// -------------------------------------------------------------
function setupBottomSheets() {
  const mainFab = document.getElementById('mainFab');
  const addAccountBtn = document.getElementById('addAccountBtn');
  const addExpenseQuickBtn = document.getElementById('addExpenseQuickBtn');
  
  const txOverlay = document.getElementById('transactionSheetOverlay');
  const txSheet = document.getElementById('transactionSheet');
  const closeTxBtn = document.getElementById('closeTransactionSheet');
  
  const accOverlay = document.getElementById('accountSheetOverlay');
  const accSheet = document.getElementById('accountSheet');
  const closeAccBtn = document.getElementById('closeAccountSheet');

  // Open transaction sheet (default to expense)
  const openTransactionSheet = (type = 'expense') => {
    document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('txAmount').value = '';
    document.getElementById('txNote').value = '';
    
    // Set type switcher checked value
    if (type === 'income') {
      document.getElementById('typeIncome').checked = true;
      toggleTxType('income');
    } else {
      document.getElementById('typeExpense').checked = true;
      toggleTxType('expense');
    }
    
    // Populate Account select options
    populateAccountDropdown();
    
    txOverlay.classList.add('active');
  };

  mainFab.addEventListener('click', () => openTransactionSheet('expense'));
  addExpenseQuickBtn.addEventListener('click', () => openTransactionSheet('expense'));
  
  // Open account sheet
  addAccountBtn.addEventListener('click', () => {
    document.getElementById('accName').value = '';
    document.getElementById('accBalance').value = '';
    accOverlay.classList.add('active');
  });

  // Close helper
  const closeSheets = () => {
    txOverlay.classList.remove('active');
    accOverlay.classList.remove('active');
  };

  closeTxBtn.addEventListener('click', closeSheets);
  closeAccBtn.addEventListener('click', closeSheets);
  
  // Click overlay to close
  txOverlay.addEventListener('click', (e) => {
    if (e.target === txOverlay) closeSheets();
  });
  accOverlay.addEventListener('click', (e) => {
    if (e.target === accOverlay) closeSheets();
  });

  // Listen to transaction type radio buttons
  document.querySelectorAll('input[name="txType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      toggleTxType(e.target.value);
    });
  });
}

function toggleTxType(type) {
  const categoryGroup = document.getElementById('categoryInputGroup');
  const submitBtnText = document.querySelector('#transactionForm .submit-btn span');
  const sheetTitle = document.getElementById('sheetTitle');
  
  if (type === 'income') {
    categoryGroup.style.display = 'none';
    sheetTitle.innerText = 'Новый доход';
    submitBtnText.innerText = 'Сохранить доход';
  } else {
    categoryGroup.style.display = 'flex';
    sheetTitle.innerText = 'Новый расход';
    submitBtnText.innerText = 'Сохранить расход';
  }
}

function populateAccountDropdown() {
  const select = document.getElementById('txAccount');
  select.innerHTML = '';
  
  state.accounts.forEach(acc => {
    const opt = document.createElement('option');
    opt.value = acc.id;
    opt.innerText = `${acc.type === 'card' ? '💳' : acc.type === 'savings' ? '🐷' : '💵'} ${acc.name} (${formatCurrency(acc.balance)})`;
    select.appendChild(opt);
  });
}

// -------------------------------------------------------------
// Form Submissions
// -------------------------------------------------------------
function setupForms() {
  const txForm = document.getElementById('transactionForm');
  const accForm = document.getElementById('accountForm');
  
  // Add Transaction Form
  txForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(txForm);
    const type = formData.get('txType');
    const amount = parseFloat(formData.get('amount'));
    const accountId = formData.get('accountId');
    const category = type === 'income' ? 'Доход' : formData.get('category');
    const date = formData.get('date');
    const note = formData.get('note') || category;
    
    if (isNaN(amount) || amount <= 0) return;
    
    // Find account to update balance
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return;
    
    // Create transaction object
    const newTx = {
      id: 'tx-' + Date.now(),
      type,
      amount,
      category,
      accountId,
      date,
      note
    };
    
    // Update account balance
    if (type === 'expense') {
      account.balance -= amount;
    } else {
      account.balance += amount;
    }
    
    // Add transaction to state
    state.transactions.unshift(newTx);
    
    // Save, close drawer, and re-render
    saveData();
    document.getElementById('transactionSheetOverlay').classList.remove('active');
    renderApp();
    
    // Trigger cool glowing transaction animation
    triggerTransactionAnimation(type, amount);
  });
  
  // Add Account Form
  accForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(accForm);
    const name = formData.get('name');
    const balance = parseFloat(formData.get('balance'));
    const type = formData.get('type');
    const color = formData.get('color');
    
    if (!name || isNaN(balance)) return;
    
    const newAcc = {
      id: 'acc-' + Date.now(),
      name,
      balance,
      type,
      color
    };
    
    state.accounts.push(newAcc);
    
    saveData();
    document.getElementById('accountSheetOverlay').classList.remove('active');
    renderApp();
  });

  // Clear history action
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите очистить всю историю операций? Балансы счетов останутся прежними.')) {
      state.transactions = [];
      saveData();
      renderApp();
    }
  });
}

// -------------------------------------------------------------
// History Filters
// -------------------------------------------------------------
let activeHistoryFilter = 'all';

function setupHistoryFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeHistoryFilter = chip.getAttribute('data-filter');
      renderHistoryList();
    });
  });
}

// -------------------------------------------------------------
// UI Rendering
// -------------------------------------------------------------
function renderApp() {
  renderUserProfile();
  renderTotalBalanceCard();
  renderAccountsGrid();
  renderExpensesCategories();
  renderHistoryList();
  renderCharts();
  
  // Re-run lucide icons markup
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Total Net Worth and Cashflows
function renderTotalBalanceCard() {
  const total = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  document.getElementById('totalBalance').innerText = formatCurrency(total);
  
  // Calculate this month's incomes & expenses
  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // "YYYY-MM"
  
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  
  state.transactions.forEach(tx => {
    if (tx.date.startsWith(currentMonthStr)) {
      if (tx.type === 'income') monthlyIncome += tx.amount;
      if (tx.type === 'expense') monthlyExpense += tx.amount;
    }
  });
  
  document.getElementById('totalIncome').innerText = formatCurrency(monthlyIncome);
  document.getElementById('totalExpense').innerText = formatCurrency(monthlyExpense);
  
  // Dynamic trend value
  const trendEl = document.getElementById('balanceTrend');
  if (trendEl) {
    if (monthlyIncome > 0) {
      const percentage = Math.min(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100, 100);
      const isPositive = percentage >= 0;
      trendEl.className = `trend ${isPositive ? 'positive' : 'negative'}`;
      trendEl.innerHTML = `<i data-lucide="${isPositive ? 'trending-up' : 'trending-down'}"></i> ${isPositive ? '+' : ''}${percentage.toFixed(1)}%`;
    } else {
      trendEl.className = 'trend negative';
      trendEl.innerHTML = '<i data-lucide="trending-down"></i> -100%';
    }
  }
}

// Accounts Grid under Accounts Tab
function renderAccountsGrid() {
  const list = document.getElementById('accountsList');
  list.innerHTML = '';
  
  state.accounts.forEach(acc => {
    const cardColor = COLOR_MAP[acc.color] || COLOR_MAP.purple;
    
    // Get account icon based on type
    let iconName = 'credit-card';
    if (acc.type === 'cash') iconName = 'banknote';
    if (acc.type === 'savings') iconName = 'piggy-bank';
    
    const card = document.createElement('div');
    card.className = 'account-card';
    card.style.setProperty('--accent-color', cardColor);
    card.innerHTML = `
      <div class="account-card-header">
        <div class="account-card-icon" style="color: ${cardColor}">
          <i data-lucide="${iconName}"></i>
        </div>
        <button class="btn-delete-account" data-id="${acc.id}" aria-label="Удалить счет">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <span class="account-card-name">${acc.name}</span>
      <span class="account-card-balance">${formatCurrency(acc.balance)}</span>
    `;
    
    // Bind delete button listener
    const deleteBtn = card.querySelector('.btn-delete-account');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteAccount(acc.id);
      });
    }
    
    list.appendChild(card);
  });
}

function deleteAccount(id) {
  if (state.accounts.length <= 1) {
    alert("Нельзя удалить единственный счет. Сначала добавьте другой счет.");
    return;
  }
  
  const account = state.accounts.find(a => a.id === id);
  if (!account) return;
  
  const confirmed = confirm(`Вы действительно хотите удалить счет "${account.name}"?\nЭто также удалит всю историю операций, привязанных к этому счету.`);
  if (!confirmed) return;
  
  // Remove account
  state.accounts = state.accounts.filter(a => a.id !== id);
  
  // Remove related transactions
  state.transactions = state.transactions.filter(tx => tx.accountId !== id);
  
  // Save & re-render
  saveData();
  renderApp();
}

// Categories Progress List under Expenses Tab
function renderExpensesCategories() {
  const list = document.getElementById('categoriesList');
  list.innerHTML = '';
  
  // Aggregate expenses by category
  const categoryTotals = {};
  let totalExpense = 0;
  
  state.transactions.forEach(tx => {
    if (tx.type === 'expense') {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      totalExpense += tx.amount;
    }
  });
  
  EXPENSE_CATEGORIES.forEach(cat => {
    const amount = categoryTotals[cat.name] || 0;
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
    const budgetPercent = Math.min((amount / cat.budget) * 100, 100);
    
    const row = document.createElement('div');
    row.className = 'category-row';
    row.innerHTML = `
      <div class="category-row-meta">
        <div class="category-row-title">
          <span class="category-row-icon">${cat.icon}</span>
          <span>${cat.name}</span>
        </div>
        <div class="category-row-values">
          <span class="category-row-amount">${formatCurrency(amount)}</span>
          <span class="category-row-percent">${percentage.toFixed(1)}% от расходов</span>
        </div>
      </div>
      <div class="progress-track">
        <div class="progress-bar" style="width: ${budgetPercent}%; --accent-color: ${cat.color}"></div>
      </div>
    `;
    list.appendChild(row);
  });
}

// Chronological transaction lists under History Tab
function renderHistoryList() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  
  const filteredTx = state.transactions.filter(tx => {
    if (activeHistoryFilter === 'all') return true;
    return tx.type === activeHistoryFilter;
  });
  
  if (filteredTx.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
        <i data-lucide="info" style="width: 32px; height: 32px; stroke-width: 1.5; margin-bottom: 8px;"></i>
        <p>Нет операций для отображения</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }
  
  filteredTx.forEach(tx => {
    // Get account info
    const account = state.accounts.find(a => a.id === tx.accountId) || { name: 'Неизвестно' };
    
    // Find category details
    const catDetails = EXPENSE_CATEGORIES.find(c => c.name === tx.category);
    const catIcon = tx.type === 'income' ? '💰' : (catDetails ? catDetails.icon : '📦');
    
    const item = document.createElement('div');
    item.className = 'history-item';
    
    // Format date beautifully
    const txDate = new Date(tx.date);
    const options = { day: 'numeric', month: 'short' };
    const dateStr = txDate.toLocaleDateString('ru-RU', options);
    
    item.innerHTML = `
      <div class="history-item-left">
        <div class="history-item-icon">${catIcon}</div>
        <div class="history-item-meta">
          <span class="history-item-category">${tx.note || tx.category}</span>
          <span class="history-item-details">${dateStr} • ${account.name}</span>
        </div>
      </div>
      <div class="history-item-right">
        <span class="history-item-amount ${tx.type}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
        </span>
        <span class="history-item-account">${tx.type === 'income' ? 'Доход' : tx.category}</span>
      </div>
    `;
    
    list.appendChild(item);
  });
}

// -------------------------------------------------------------
// Interactive Custom SVG Charts (Zero Dependencies)
// -------------------------------------------------------------
function renderCharts() {
  renderAccountsDonutChart();
  renderExpensesTrendLineChart();
}

function renderAccountsDonutChart() {
  const container = document.getElementById('accountsChartContainer');
  const legend = document.getElementById('accountsChartLegend');
  if (!container || !legend) return;
  
  const total = state.accounts.reduce((sum, a) => sum + a.balance, 0);
  legend.innerHTML = '';
  
  if (total === 0) {
    container.innerHTML = `
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="20"/>
        <text x="100" y="105" text-anchor="middle" class="chart-donut-text" font-size="14">Нет средств</text>
      </svg>
    `;
    return;
  }
  
  let accumulatedAngle = 0;
  const radius = 60;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  
  let svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" style="transform: rotate(-90deg)">`;
  
  state.accounts.forEach(acc => {
    const cardColor = COLOR_MAP[acc.color] || COLOR_MAP.purple;
    const share = acc.balance / total;
    const strokeDash = share * circumference;
    const strokeOffset = circumference - strokeDash;
    const rotation = accumulatedAngle;
    
    svgContent += `
      <circle 
        cx="${cx}" 
        cy="${cy}" 
        r="${radius}" 
        fill="none" 
        stroke="${cardColor}" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${strokeDash} ${circumference - strokeDash}"
        stroke-dashoffset="${strokeOffset}"
        style="transform: rotate(${rotation}deg); transform-origin: center;"
        class="chart-donut-segment"
      />
    `;
    
    // Add legend items
    const legItem = document.createElement('div');
    legItem.className = 'legend-item';
    legItem.innerHTML = `
      <span class="legend-color" style="background-color: ${cardColor}"></span>
      <span class="legend-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${acc.name} (${(share * 100).toFixed(0)}%)
      </span>
    `;
    legend.appendChild(legItem);
    
    accumulatedAngle += share * 360;
  });
  
  // Center label and total amount text (unrotated so they're horizontal)
  svgContent += `
    <g style="transform: rotate(90deg); transform-origin: center;">
      <text x="100" y="95" text-anchor="middle" fill="var(--text-secondary)" font-size="11" font-weight="500">ВСЕГО АКТИВОВ</text>
      <text x="100" y="115" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="'Outfit'">${formatCurrency(total)}</text>
    </g>
  `;
  
  svgContent += `</svg>`;
  container.innerHTML = svgContent;
}

function renderExpensesTrendLineChart() {
  const container = document.getElementById('expensesTrendContainer');
  if (!container) return;
  
  // Get expenses in the past 7 days (including today)
  const last7Days = [];
  const dayLabels = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last7Days.push(dateStr);
    
    // Format label like "Пн", "Вт" etc.
    const dayLabel = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    dayLabels.push(dayLabel);
  }
  
  const dailyTotals = last7Days.map(dateStr => {
    return state.transactions
      .filter(tx => tx.type === 'expense' && tx.date === dateStr)
      .reduce((sum, tx) => sum + tx.amount, 0);
  });
  
  const maxVal = Math.max(...dailyTotals, 10000); // minimum scale limit
  
  // SVG drawing configuration
  const width = 340;
  const height = 150;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Build SVG content
  let svgContent = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add neon gradient for line
  svgContent += `
    <defs>
      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--secondary)" stop-opacity="1" />
        <stop offset="100%" stop-color="var(--primary)" stop-opacity="1" />
      </linearGradient>
      <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--secondary)" stop-opacity="0.25" />
        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  `;
  
  // Grid Lines and Y labels (3 ticks)
  const yTicks = [0, maxVal / 2, maxVal];
  yTicks.forEach(tick => {
    const y = paddingTop + chartHeight - (tick / maxVal) * chartHeight;
    svgContent += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid-line" stroke-dasharray="3,3" />
      <text x="${paddingLeft - 8}" y="${y + 4}" fill="var(--text-muted)" font-size="9" text-anchor="end">${formatCompact(tick)}</text>
    `;
  });
  
  // Calculate points
  const points = dailyTotals.map((val, idx) => {
    const x = paddingLeft + (idx / 6) * chartWidth;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });
  
  // Draw line path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    // Smooth control points
    const cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
    const cpY1 = points[i-1].y;
    const cpX2 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
    const cpY2 = points[i].y;
    
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
  }
  
  // Draw filled area under path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  svgContent += `<path d="${areaD}" fill="url(#area-gradient)" />`;
  
  // Draw stroke path
  svgContent += `<path d="${pathD}" class="chart-line-path" filter="url(#glow)" />`;
  
  // Draw dots and X-axis labels
  points.forEach((pt, idx) => {
    // Dots
    svgContent += `
      <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="var(--secondary)" stroke="#0d0b18" stroke-width="2" class="chart-dot" />
    `;
    
    // Day Label (X-axis)
    svgContent += `
      <text x="${pt.x}" y="${height - 8}" fill="var(--text-secondary)" font-size="10" font-weight="500" text-anchor="middle">${dayLabels[idx]}</text>
    `;
  });
  
  svgContent += `</svg>`;
  container.innerHTML = svgContent;
}

// Compact numbers for charts
function formatCompact(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
  return num;
}

// -------------------------------------------------------------
// User Profile Logic
// -------------------------------------------------------------
function setupProfileSettings() {
  const headerUser = document.querySelector('.header-user');
  const overlay = document.getElementById('profileSheetOverlay');
  const closeBtn = document.getElementById('closeProfileSheet');
  const form = document.getElementById('profileForm');
  const fileInput = document.getElementById('profAvatarFile');
  const uploadStatus = document.getElementById('uploadStatus');
  
  if (!headerUser || !overlay || !form) return;
  
  let currentUploadedAvatar = null;
  
  // Open settings
  headerUser.addEventListener('click', () => {
    document.getElementById('profName').value = state.profileName || 'Пользователь';
    
    // Set active preset in dialog
    const avatar = state.profileAvatar || 'preset-1';
    if (avatar.startsWith('data:image')) {
      // Custom image: uncheck presets, set status text
      document.querySelectorAll('input[name="avatarPreset"]').forEach(radio => radio.checked = false);
      uploadStatus.innerText = 'Своя фотография загружена';
      currentUploadedAvatar = avatar;
    } else {
      // Preset
      const radio = document.querySelector(`input[name="avatarPreset"][value="${avatar}"]`);
      if (radio) radio.checked = true;
      uploadStatus.innerText = 'Файл не выбран';
      currentUploadedAvatar = null;
    }
    
    overlay.classList.add('active');
  });
  
  // Close settings
  const closeProfile = () => {
    overlay.classList.remove('active');
  };
  
  closeBtn.addEventListener('click', closeProfile);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeProfile();
  });
  
  // File Upload handling
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    uploadStatus.innerText = file.name;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      currentUploadedAvatar = event.target.result; // Base64 Data URL
      // Uncheck preset radio buttons since we are uploading a custom photo
      document.querySelectorAll('input[name="avatarPreset"]').forEach(radio => radio.checked = false);
    };
    reader.readAsDataURL(file);
  });
  
  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameVal = document.getElementById('profName').value.trim();
    if (!nameVal) return;
    
    state.profileName = nameVal;
    
    // Check if custom uploaded avatar is active or a preset
    const checkedPreset = document.querySelector('input[name="avatarPreset"]:checked');
    if (checkedPreset) {
      state.profileAvatar = checkedPreset.value;
    } else if (currentUploadedAvatar) {
      state.profileAvatar = currentUploadedAvatar;
    }
    
    saveData();
    closeProfile();
    renderApp();
  });
}

function renderUserProfile() {
  const avatarEl = document.querySelector('.avatar');
  const greetingEl = document.querySelector('.greeting');
  
  if (!avatarEl || !greetingEl) return;
  
  greetingEl.innerText = `Привет, ${state.profileName || 'Пользователь'}`;
  
  const avatar = state.profileAvatar || 'preset-1';
  if (avatar.startsWith('data:image')) {
    avatarEl.style.background = `url(${avatar})`;
    avatarEl.style.backgroundSize = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    avatarEl.innerHTML = '';
  } else {
    avatarEl.style.background = getPresetGradient(avatar);
    avatarEl.style.backgroundSize = '';
    avatarEl.style.backgroundPosition = '';
    const firstLetter = (state.profileName || 'П').trim().charAt(0).toUpperCase();
    avatarEl.innerHTML = `<span>${firstLetter}</span>`;
  }
}

function getPresetGradient(preset) {
  switch (preset) {
    case 'preset-2': return 'linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)';
    case 'preset-3': return 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
    case 'preset-4': return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
    case 'preset-5': return 'linear-gradient(135deg, #d946ef 0%, #ec4899 100%)';
    default: return 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
  }
}

// -------------------------------------------------------------
// Transaction Animations
// -------------------------------------------------------------
function triggerTransactionAnimation(type, amount) {
  const balanceCard = document.querySelector('.balance-card');
  const balanceAmountEl = document.getElementById('totalBalance');
  if (!balanceCard || !balanceAmountEl) return;
  
  // 1. Add Pulse Class to Balance Card
  const pulseClass = type === 'income' ? 'pulse-income' : 'pulse-expense';
  balanceCard.classList.remove('pulse-income', 'pulse-expense');
  void balanceCard.offsetWidth; // Trigger reflow to restart animation
  balanceCard.classList.add(pulseClass);
  setTimeout(() => balanceCard.classList.remove(pulseClass), 1000);
  
  // 2. Create Floating Number Indicator
  const floating = document.createElement('div');
  floating.className = `floating-feedback ${type}`;
  floating.innerText = `${type === 'income' ? '+' : '-'}${formatCurrency(amount)}`;
  balanceCard.appendChild(floating);
  setTimeout(() => floating.remove(), 1200);
  
  // 3. Create Particle Burst
  createParticles(balanceCard, type);
}

function createParticles(parent, type) {
  const rect = parent.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const color = type === 'income' ? 'var(--success)' : 'var(--danger)';
  
  // Create 18 glowing particles
  for (let i = 0; i < 18; i++) {
    const particle = document.createElement('div');
    particle.className = `burst-particle ${type}`;
    particle.style.backgroundColor = color;
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    
    // Random angle and distance
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    // Set CSS custom properties for animation
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    
    // Randomize duration and delay
    particle.style.animationDuration = `${0.6 + Math.random() * 0.4}s`;
    particle.style.animationDelay = `${Math.random() * 0.15}s`;
    
    parent.appendChild(particle);
    
    // Cleanup after animation completes
    setTimeout(() => particle.remove(), 1000);
  }
}
