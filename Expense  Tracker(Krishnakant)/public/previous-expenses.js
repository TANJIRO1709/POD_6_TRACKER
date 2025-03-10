document.addEventListener('DOMContentLoaded', function() {
    try {
        const previousExpenses = JSON.parse(localStorage.getItem('previousExpenses')) || [];
        const tableBody = document.getElementById('expenseTableBody');
        
        if (previousExpenses.length === 0) {
            showNoExpensesMessage(tableBody);
            return;
        }

        displayExpenses(previousExpenses, tableBody);
    } catch (error) {
        console.error('Error loading previous expenses:', error);
        alert('Error loading previous expenses');
    }
});

function showNoExpensesMessage(tableBody) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td colspan="5" style="text-align: center; padding: 20px;">
            No previous expenses found
        </td>
    `;
    tableBody.appendChild(row);
}

function displayExpenses(expenses, tableBody) {
    expenses.forEach(expense => {
        const row = createExpenseRow(expense);
        tableBody.appendChild(row);
    });
}

function createExpenseRow(expense) {
    const row = document.createElement('tr');
    const total = calculateTotal(expense);
    
    row.innerHTML = `
        <td>${formatDate(expense.date)}</td>
        <td>${expense.name}</td>
        <td>Rs. ${total.toFixed(2)}</td>
        <td>${formatCategories(expense.categories)}</td>
        <td>
            <button class="view-btn" onclick="viewDetails('${expense.date}')">
                View Details
            </button>
        </td>
    `;
    return row;
}

function calculateTotal(expense) {
    return expense.categories.reduce((sum, category) => {
        return sum + category.items.reduce((catSum, item) => 
            catSum + (item.price * item.quantity), 0);
    }, 0);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString();
}

function formatCategories(categories) {
    return categories.map(cat => cat.name).join(', ');
}

window.viewDetails = function(date) {
    try {
        const previousExpenses = JSON.parse(localStorage.getItem('previousExpenses')) || [];
        const expense = previousExpenses.find(exp => exp.date === date);
        
        if (expense) {
            localStorage.setItem('currentBill', JSON.stringify(expense));
            window.location.href = './analysis.html';
        }
    } catch (error) {
        console.error('Error viewing details:', error);
        alert('Error loading expense details');
    }
};