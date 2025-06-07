// Global variables
let travelers = [];
let expenses = [];
let manualPayments = [];
let currentTab = "travelers";

// Currency configuration
const CURRENCIES = {
  TOMAN: { label: "ریال", symbol: "﷼" },
  USD: { label: "دلار آمریکا", symbol: "$" },
  EUR: { label: "یورو", symbol: "€" },
  GBP: { label: "پوند انگلیس", symbol: "£" },
};

// API base URL
const API_BASE = "api/";

// Utility functions
function showLoading() {
  document.getElementById("loading").classList.add("show");
}

function hideLoading() {
  document.getElementById("loading").classList.remove("show");
}

function showError(message) {
  alert("خطا: " + message);
}

function showSuccess(message) {
  // You can implement a toast notification here
  console.log("Success: " + message);
}

// API functions
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(API_BASE + endpoint, options);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "خطای ناشناخته");
    }

    return result.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Tab management
function showTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("bg-blue-500", "text-white", "shadow-md");
    btn.classList.add(
      "text-gray-600",
      "hover:bg-gray-50",
      "hover:text-gray-800"
    );
  });

  document
    .getElementById(`tab-${tabName}`)
    .classList.remove(
      "text-gray-600",
      "hover:bg-gray-50",
      "hover:text-gray-800"
    );
  document
    .getElementById(`tab-${tabName}`)
    .classList.add("bg-blue-500", "text-white", "shadow-md");

  // Update content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.add("hidden");
  });

  document.getElementById(`${tabName}-content`).classList.remove("hidden");
  currentTab = tabName;

  // Load data for the current tab
  if (tabName === "travelers") {
    loadTravelers();
  } else if (tabName === "expenses") {
    loadExpenses();
  } else if (tabName === "summary") {
    loadSummary();
  }
}

// Travelers management
async function loadTravelers() {
  try {
    showLoading();
    travelers = await apiCall("travelers.php");
    renderTravelers();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

function renderTravelers() {
  const container = document.getElementById("travelers-list");
  const emptyState = document.getElementById("travelers-empty");

  if (travelers.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  container.innerHTML = travelers
    .map(
      (traveler) => `
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    ${
                      traveler.profile_picture
                        ? `<img src="${traveler.profile_picture}" alt="${traveler.name}" class="w-full h-full object-cover">`
                        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>`
                    }
                </div>
                
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800">${
                      traveler.name
                    }</h3>
                    <p class="text-sm text-gray-500">
                        عضو تیم از ${new Date(
                          traveler.created_at
                        ).toLocaleDateString("fa-IR")}
                    </p>
                </div>
                
                <button onclick="deleteTraveler('${
                  traveler.id
                }')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

function toggleAddTravelerForm() {
  const form = document.getElementById("traveler-form");
  form.classList.toggle("hidden");

  if (!form.classList.contains("hidden")) {
    document.getElementById("traveler-name").focus();
  }
}

function cancelAddTraveler() {
  document.getElementById("traveler-form").classList.add("hidden");
  document.getElementById("traveler-form").reset();
  document.getElementById("profile-preview").classList.add("hidden");
  document.getElementById("profile-placeholder").classList.remove("hidden");
}

// Handle profile picture upload
document
  .getElementById("profile-picture")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const preview = document.getElementById("profile-preview");
        const placeholder = document.getElementById("profile-placeholder");

        preview.src = event.target.result;
        preview.classList.remove("hidden");
        placeholder.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

// Handle traveler form submission
document
  .getElementById("traveler-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("traveler-name").value.trim();
    const profilePicture =
      document.getElementById("profile-preview").src || null;

    if (!name) {
      showError("نام مسافر الزامی است");
      return;
    }

    try {
      showLoading();
      await apiCall("travelers.php", "POST", {
        name,
        profilePicture:
          profilePicture && profilePicture.startsWith("data:")
            ? profilePicture
            : null,
      });

      cancelAddTraveler();
      loadTravelers();
      showSuccess("مسافر با موفقیت اضافه شد");
    } catch (error) {
      showError(error.message);
    } finally {
      hideLoading();
    }
  });

async function deleteTraveler(id) {
  if (!confirm("آیا از حذف این مسافر اطمینان دارید؟")) {
    return;
  }

  try {
    showLoading();
    await apiCall("travelers.php", "DELETE", { id });
    loadTravelers();
    showSuccess("مسافر با موفقیت حذف شد");
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Expenses management
async function loadExpenses() {
  try {
    showLoading();
    expenses = await apiCall("expenses.php");
    renderExpenses();
    updateExpenseForm();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

function renderExpenses() {
  const container = document.getElementById("expenses-list");
  const emptyState = document.getElementById("expenses-empty");
  const noTravelersWarning = document.getElementById("expenses-no-travelers");

  if (travelers.length === 0) {
    container.innerHTML = "";
    emptyState.classList.add("hidden");
    noTravelersWarning.classList.remove("hidden");
    return;
  }

  noTravelersWarning.classList.add("hidden");

  if (expenses.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  container.innerHTML = expenses
    .map(
      (expense) => `
        <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${
                      expense.title
                    }</h3>
                    <div class="flex items-center gap-2 text-2xl font-bold text-blue-600 mb-2">
                        <span>${parseFloat(expense.amount).toLocaleString(
                          "fa-IR"
                        )}</span>
                        <span class="text-sm">${
                          CURRENCIES[expense.currency].symbol
                        }</span>
                    </div>
                </div>
                <button onclick="deleteExpense('${
                  expense.id
                }')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>

            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                        ${
                          expense.payer_picture
                            ? `<img src="${expense.payer_picture}" alt="${expense.payer_name}" class="w-full h-full object-cover">`
                            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>`
                        }
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">پرداخت کننده:</p>
                        <p class="font-medium text-gray-800">${
                          expense.payer_name
                        }</p>
                    </div>
                </div>

                <div>
                    <p class="text-sm text-gray-600 mb-2">شرکت کنندگان:</p>
                    <div class="flex flex-wrap gap-2">
                        ${expense.participants
                          .map(
                            (participant) => `
                            <div class="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                                <div class="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                                    ${
                                      participant.profile_picture
                                        ? `<img src="${participant.profile_picture}" alt="${participant.name}" class="w-full h-full object-cover">`
                                        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>`
                                    }
                                </div>
                                <span class="text-sm font-medium text-gray-700">${
                                  participant.name
                                }</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div class="flex items-center gap-2 text-gray-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span class="text-sm">${new Date(
                          expense.date
                        ).toLocaleDateString("fa-IR")}</span>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

function updateExpenseForm() {
  const payerSelect = document.getElementById("expense-payer");
  const participantsContainer = document.getElementById("expense-participants");

  // Update payer dropdown
  payerSelect.innerHTML =
    '<option value="">انتخاب کنید</option>' +
    travelers
      .map(
        (traveler) => `<option value="${traveler.id}">${traveler.name}</option>`
      )
      .join("");

  // Update participants checkboxes
  participantsContainer.innerHTML = travelers
    .map(
      (traveler) => `
        <label class="flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 border-gray-200 hover:border-gray-300">
            <input type="checkbox" value="${traveler.id}" class="w-4 h-4 text-green-600 participant-checkbox">
            <span class="text-sm font-medium">${traveler.name}</span>
        </label>
    `
    )
    .join("");

  // Add event listeners to update checkbox styles
  document.querySelectorAll(".participant-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const label = this.closest("label");
      if (this.checked) {
        label.classList.remove("border-gray-200", "hover:border-gray-300");
        label.classList.add("border-green-500", "bg-green-50");
      } else {
        label.classList.remove("border-green-500", "bg-green-50");
        label.classList.add("border-gray-200", "hover:border-gray-300");
      }
    });
  });
}

function toggleAddExpenseForm() {
  if (travelers.length === 0) {
    showError("ابتدا باید مسافران را اضافه کنید");
    return;
  }

  const form = document.getElementById("expense-form");
  form.classList.toggle("hidden");

  if (!form.classList.contains("hidden")) {
    document.getElementById("expense-title").focus();
    // Set today's date as default
    document.getElementById("expense-date").value = new Date()
      .toISOString()
      .split("T")[0];
  }
}

function cancelAddExpense() {
  document.getElementById("expense-form").classList.add("hidden");
  document.getElementById("expense-form").reset();

  // Reset participant checkboxes
  document.querySelectorAll(".participant-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
    const label = checkbox.closest("label");
    label.classList.remove("border-green-500", "bg-green-50");
    label.classList.add("border-gray-200", "hover:border-gray-300");
  });
}

// Handle expense form submission
document
  .getElementById("expense-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("expense-title").value.trim();
    const amount = parseFloat(document.getElementById("expense-amount").value);
    const currency = document.getElementById("expense-currency").value;
    const payerId = document.getElementById("expense-payer").value;
    const date = document.getElementById("expense-date").value;

    const participantIds = Array.from(
      document.querySelectorAll(".participant-checkbox:checked")
    ).map((checkbox) => checkbox.value);

    if (!title || !amount || !payerId || !date || participantIds.length === 0) {
      showError("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    try {
      showLoading();
      await apiCall("expenses.php", "POST", {
        title,
        amount,
        currency,
        payerId,
        participantIds,
        date,
      });

      cancelAddExpense();
      loadExpenses();
      showSuccess("هزینه با موفقیت اضافه شد");
    } catch (error) {
      showError(error.message);
    } finally {
      hideLoading();
    }
  });

async function deleteExpense(id) {
  if (!confirm("آیا از حذف این هزینه اطمینان دارید؟")) {
    return;
  }

  try {
    showLoading();
    await apiCall("expenses.php", "DELETE", { id });
    loadExpenses();
    showSuccess("هزینه با موفقیت حذف شد");
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Summary management
async function loadSummary() {
  try {
    showLoading();
    const summaryData = await apiCall("settlement.php");
    renderSummary(summaryData);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

function renderSummary(data) {
  const container = document.getElementById("summary-cards");
  const emptyState = document.getElementById("summary-empty");
  const manualPaymentSection = document.getElementById(
    "manual-payment-section"
  );

  if (!data.totalExpenses || Object.keys(data.totalExpenses).length === 0) {
    container.innerHTML = "";
    manualPaymentSection.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  // Render summary cards
  let summaryHTML = "";

  // Total Trip Costs
  summaryHTML += `
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">کل هزینه‌های سفر</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${Object.entries(data.totalExpenses)
                  .map(
                    ([currency, amount]) => `
                    <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div class="text-2xl font-bold text-blue-600">
                            ${parseFloat(amount).toLocaleString("fa-IR")}
                        </div>
                        <div class="text-sm text-gray-600 mt-1">
                            ${CURRENCIES[currency].label} (${
                      CURRENCIES[currency].symbol
                    })
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  // Total Paid Per Person
  summaryHTML += `
        <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">مجموع پرداخت هر نفر</h3>
            <div class="space-y-4">
                ${Object.entries(data.travelers)
                  .map(([travelerId, travelerName]) => {
                    const paidAmounts = data.totalPaid[travelerId] || {};
                    const hasPaid = Object.values(paidAmounts).some(
                      (amount) => amount > 0
                    );

                    return `
                        <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white">
                                    <span class="text-lg">${travelerName.charAt(
                                      0
                                    )}</span>
                                </div>
                                <span class="font-medium text-gray-800">${travelerName}</span>
                            </div>
                            <div class="text-left">
                                ${
                                  hasPaid
                                    ? Object.entries(paidAmounts)
                                        .filter(([, amount]) => amount > 0)
                                        .map(
                                          ([currency, amount]) => `
                                        <div class="text-sm">
                                            <span class="font-semibold">${parseFloat(
                                              amount
                                            ).toLocaleString("fa-IR")}</span>
                                            <span class="text-gray-500 mr-1">${
                                              CURRENCIES[currency].symbol
                                            }</span>
                                        </div>
                                    `
                                        )
                                        .join("")
                                    : '<span class="text-gray-500 text-sm">پرداخت نکرده</span>'
                                }
                            </div>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        </div>
    `;

  // Settlement Plan
  summaryHTML += `
        <div class="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">برنامه تسویه حساب</h3>
            ${
              data.settlements.length === 0
                ? `
                <div class="text-center py-8">
                    <div class="text-6xl mb-4">🎉</div>
                    <h3 class="text-xl font-semibold text-green-600 mb-2">
                        همه حساب‌ها تسویه شده!
                    </h3>
                    <p class="text-gray-600">
                        هیچ بدهی باقی نمانده است
                    </p>
                </div>
            `
                : `
                <div class="space-y-3">
                    ${data.settlements
                      .map(
                        (settlement) => `
                        <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-r-4 border-orange-400">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white">
                                    <span class="text-sm">${settlement.fromName.charAt(
                                      0
                                    )}</span>
                                </div>
                                <span class="font-medium">${
                                  settlement.fromName
                                }</span>
                                <span class="text-gray-500">باید بپردازد به</span>
                                <span class="font-medium">${
                                  settlement.toName
                                }</span>
                            </div>
                            <div class="text-left">
                                <div class="text-lg font-bold text-orange-600">
                                    ${parseFloat(
                                      settlement.amount
                                    ).toLocaleString("fa-IR")} ${
                          CURRENCIES[settlement.currency].symbol
                        }
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `
            }
        </div>
    `;

  container.innerHTML = summaryHTML;

  // Render manual payment form and list
  renderManualPaymentSection(data);
}

function renderManualPaymentSection(data) {
  const container = document.getElementById("manual-payment-section");

  if (data.travelers && Object.keys(data.travelers).length >= 2) {
    let html = `
            <div class="space-y-4">
                <button onclick="toggleManualPaymentForm()" class="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-colors duration-200 shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    ثبت پرداخت دستی
                </button>
                
                <form id="manual-payment-form" class="hidden bg-white rounded-xl shadow-md p-6 space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">ثبت پرداخت دستی</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">پرداخت کننده</label>
                            <select id="manual-payer" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" required>
                                <option value="">انتخاب کنید</option>
                                ${Object.entries(data.travelers)
                                  .map(
                                    ([id, name]) =>
                                      `<option value="${id}">${name}</option>`
                                  )
                                  .join("")}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">دریافت کننده</label>
                            <select id="manual-receiver" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" required>
                                <option value="">انتخاب کنید</option>
                                ${Object.entries(data.travelers)
                                  .map(
                                    ([id, name]) =>
                                      `<option value="${id}">${name}</option>`
                                  )
                                  .join("")}
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex gap-2">
                            <input type="number" id="manual-amount" placeholder="مبلغ پرداخت شده" step="0.01" min="0" class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" required>
                            <select id="manual-currency" class="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                <option value="TOMAN">ریال</option>
                                <option value="USD">دلار</option>
                                <option value="EUR">یورو</option>
                                <option value="GBP">پوند</option>
                            </select>
                        </div>

                        <input type="date" id="manual-date" class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" required>
                    </div>

                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                            ثبت پرداخت
                        </button>
                        <button type="button" onclick="cancelManualPayment()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                            انصراف
                        </button>
                    </div>
                </form>
        `;

    // Add manual payments list if any exist
    if (data.manualPayments && data.manualPayments.length > 0) {
      html += `
                <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-md p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">پرداخت‌های ثبت شده</h3>
                    <div class="space-y-3">
                        ${data.manualPayments
                          .map(
                            (payment) => `
                            <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                <div class="flex items-center gap-2 text-sm">
                                    <span class="font-medium">${
                                      data.travelers[payment.payer_id]
                                    }</span>
                                    <span class="text-gray-500">→</span>
                                    <span class="font-medium">${
                                      data.travelers[payment.receiver_id]
                                    }</span>
                                </div>
                                <div class="text-sm font-semibold text-purple-600">
                                    ${parseFloat(payment.amount).toLocaleString(
                                      "fa-IR"
                                    )} ${CURRENCIES[payment.currency].symbol}
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            `;
    }

    html += "</div>";
    container.innerHTML = html;

    // Set today's date as default
    const dateInput = document.getElementById("manual-date");
    if (dateInput) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    // Add form submission handler
    const form = document.getElementById("manual-payment-form");
    if (form) {
      form.addEventListener("submit", handleManualPaymentSubmit);
    }

    // Add payer change handler to update receiver options
    const payerSelect = document.getElementById("manual-payer");
    const receiverSelect = document.getElementById("manual-receiver");
    if (payerSelect && receiverSelect) {
      payerSelect.addEventListener("change", function () {
        const selectedPayer = this.value;
        receiverSelect.innerHTML =
          '<option value="">انتخاب کنید</option>' +
          Object.entries(data.travelers)
            .filter(([id]) => id !== selectedPayer)
            .map(([id, name]) => `<option value="${id}">${name}</option>`)
            .join("");
      });
    }
  } else {
    container.innerHTML = "";
  }
}

function toggleManualPaymentForm() {
  const form = document.getElementById("manual-payment-form");
  if (form) {
    form.classList.toggle("hidden");
  }
}

function cancelManualPayment() {
  const form = document.getElementById("manual-payment-form");
  if (form) {
    form.classList.add("hidden");
    form.reset();
    document.getElementById("manual-date").value = new Date()
      .toISOString()
      .split("T")[0];
  }
}

async function handleManualPaymentSubmit(e) {
  e.preventDefault();

  const payerId = document.getElementById("manual-payer").value;
  const receiverId = document.getElementById("manual-receiver").value;
  const amount = parseFloat(document.getElementById("manual-amount").value);
  const currency = document.getElementById("manual-currency").value;
  const date = document.getElementById("manual-date").value;

  if (!payerId || !receiverId || !amount || !date) {
    showError("لطفاً تمام فیلدها را پر کنید");
    return;
  }

  if (payerId === receiverId) {
    showError("پرداخت کننده و دریافت کننده نمی‌توانند یکسان باشند");
    return;
  }

  try {
    showLoading();
    await apiCall("manual-payments.php", "POST", {
      payerId,
      receiverId,
      amount,
      currency,
      date,
    });

    cancelManualPayment();
    loadSummary();
    showSuccess("پرداخت دستی با موفقیت ثبت شد");
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Reset all data
async function resetAllData() {
  if (
    !confirm(
      "⚠️ هشدار: این عمل تمام داده‌ها را پاک می‌کند و قابل بازگشت نیست. آیا اطمینان دارید؟"
    )
  ) {
    return;
  }

  if (
    !confirm(
      "آیا واقعاً می‌خواهید تمام مسافران، هزینه‌ها و پرداخت‌ها را حذف کنید؟"
    )
  ) {
    return;
  }

  try {
    showLoading();
    await apiCall("reset.php", "POST");

    // Reset local data
    travelers = [];
    expenses = [];
    manualPayments = [];

    // Reload current tab
    showTab("travelers");
    showSuccess("تمام داده‌ها با موفقیت حذف شدند");
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  showTab("travelers");
});
