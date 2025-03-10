document.addEventListener('DOMContentLoaded', function() {
    try {
        const billData = JSON.parse(localStorage.getItem('currentBill'));
        
        if (!billData || !billData.categories || billData.categories.length === 0) {
            alert('No expense data found!');
            return;
        }

        // Initialize expensive items tracking
        let mostExpensive = { name: '', price: 0, quantity: 0, totalPrice: 0 };
        let leastExpensive = { name: '', price: Infinity, quantity: 0, totalPrice: Infinity };
        let hasValidItems = false;

        // Process all categories for expensive items
        billData.categories.forEach(category => {
            category.items.forEach(item => {
                const price = parseFloat(item.price);
                const quantity = parseInt(item.quantity);
                
                if (!isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
                    const totalPrice = price * quantity;
                    hasValidItems = true;

                    if (totalPrice > mostExpensive.totalPrice) {
                        mostExpensive = { 
                            name: item.name, 
                            price, 
                            quantity, 
                            totalPrice 
                        };
                    }
                    if (totalPrice < leastExpensive.totalPrice) {
                        leastExpensive = { 
                            name: item.name, 
                            price, 
                            quantity, 
                            totalPrice 
                        };
                    }
                }
            });
        });

        // Update expensive items display
        if (hasValidItems) {
            document.getElementById('most-expensive-item').textContent = 
                `${mostExpensive.name} (Rs. ${mostExpensive.totalPrice.toFixed(2)} - ${mostExpensive.quantity} units at Rs. ${mostExpensive.price} each)`;
            document.getElementById('least-expensive-item').textContent = 
                `${leastExpensive.name} (Rs. ${leastExpensive.totalPrice.toFixed(2)} - ${leastExpensive.quantity} units at Rs. ${leastExpensive.price} each)`;
        } else {
            document.getElementById('most-expensive-item').textContent = 'No valid items found';
            document.getElementById('least-expensive-item').textContent = 'No valid items found';
        }

        // Calculate total expense and update wallet
        const totalExpense = calculateTotalExpense(billData);
        if (totalExpense > 0) {
            checkWalletBalance(totalExpense);
        }

        // Create chart only if we have valid data
        if (hasValidItems) {
            createExpenseChart(billData);
        }

        // Setup split bill
        setupSplitBill();

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while loading the analysis.');
    }
});

// Update createExpenseChart function to handle empty categories
function createExpenseChart(billData) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    const categoryTotals = billData.categories
        .map(category => {
            const total = category.items.reduce((sum, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 0;
                return sum + (price * quantity);
            }, 0);
            
            return {
                name: category.name || 'Unnamed Category',
                total: total
            };
        })
        .filter(cat => cat.total > 0);

    if (categoryTotals.length === 0) {
        console.error('No valid categories found for chart');
        return;
    }

    const labels = categoryTotals.map(cat => cat.name);
    const data = categoryTotals.map(cat => cat.total);
    const totalExpense = data.reduce((sum, value) => sum + value, 0);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: generateColors(data.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        font: { size: window.innerWidth < 480 ? 12 : 14 }
                    }
                },
                title: {
                    display: true,
                    text: `Total Expenses: Rs. ${totalExpense.toFixed(2)}`,
                    font: { size: window.innerWidth < 480 ? 14 : 16 }
                }
            }
        }
    });
}

function calculateTotalExpense(billData) {
    return billData.categories.reduce((total, category) => {
        return total + category.items.reduce((catTotal, item) => {
            return catTotal + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
    }, 0);
}

function checkWalletBalance(totalExpense) {
    const walletData = JSON.parse(localStorage.getItem('walletData')) || { balance: 0 };
    
    if (totalExpense > walletData.balance) {
        showInsufficientBalance(totalExpense, walletData.balance);
    } else {
        updateWalletBalance(totalExpense, walletData.balance);
    }
}

function showInsufficientBalance(expense, balance) {
    const container = document.createElement('div');
    container.className = 'balance-warning';
    container.innerHTML = `
        <p>Insufficient balance!</p>
        <p>Expense: Rs. ${expense.toFixed(2)}</p>
        <p>Available: Rs. ${balance.toFixed(2)}</p>
        <p>Required: Rs. ${(expense - balance).toFixed(2)}</p>
        <button onclick="window.location.href='./wallet.html'" class="add-money-btn">Add Money</button>
    `;
    document.querySelector('.analysis-container').prepend(container);
}

function updateWalletBalance(expense, balance) {
    try {
        const newBalance = balance - expense;
        if (newBalance < 0) throw new Error('Insufficient balance');

        const walletData = JSON.parse(localStorage.getItem('walletData')) || {
            balance: 0,
            transactions: []
        };

        // Add transaction with more details
        const transaction = {
            type: 'debit',
            amount: expense,
            date: new Date().toISOString(),
            balance: newBalance,
            description: 'Expense payment',
            timestamp: Date.now()
        };

        walletData.balance = newBalance;
        walletData.transactions.unshift(transaction);
        localStorage.setItem('walletData', JSON.stringify(walletData));

        displayBalanceInfo(newBalance);
    } catch (error) {
        console.error('Wallet update error:', error);
        alert('Failed to update wallet balance');
    }
}

function displayBalanceInfo(balance) {
    const container = document.createElement('div');
    container.className = 'balance-info';
    container.innerHTML = `
        <p>Remaining Balance: Rs. ${balance.toFixed(2)}</p>
        <small>Updated: ${new Date().toLocaleString()}</small>
    `;
    document.querySelector('.analysis-container').prepend(container);
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${(i * 360) / count}, 70%, 50%)`);
    }
    return colors;
}

function setupSplitBill() {
    const splitBillBtn = document.getElementById('splitBill');
    const splitInputArea = document.querySelector('.split-input-area');
    const peopleCount = document.getElementById('peopleCount');
    const splitResult = document.getElementById('splitResult');

    if (!splitBillBtn || !splitInputArea || !peopleCount || !splitResult) {
        console.error('Split bill elements not found');
        return;
    }

    splitBillBtn.addEventListener('click', function() {
        try {
            if (splitInputArea.style.display === 'none') {
                splitInputArea.style.display = 'block';
                splitBillBtn.textContent = 'Calculate Split';
            } else {
                const numberOfPeople = parseInt(peopleCount.value);
                
                if (!numberOfPeople || numberOfPeople <= 0) {
                    splitResult.textContent = 'Please enter a valid number of people';
                    splitResult.style.color = '#ff4444';
                    return;
                }

                const billData = JSON.parse(localStorage.getItem('currentBill'));
                if (!billData || !billData.categories) {
                    throw new Error('No expense data found');
                }

                const totalExpense = calculateTotalExpense(billData);
                const amountPerPerson = totalExpense / numberOfPeople;

                splitResult.style.color = '#4CAF50';
                splitResult.textContent = `Amount per person: Rs. ${amountPerPerson.toFixed(2)}`;
            }
        } catch (error) {
            console.error('Split bill error:', error);
            splitResult.style.color = '#ff4444';
            splitResult.textContent = 'Error calculating split amount';
        }
    });

    // Reset result when input changes
    peopleCount.addEventListener('input', function() {
        splitResult.textContent = '';
        if (splitBillBtn.textContent !== 'Calculate Split') {
            splitBillBtn.textContent = 'Calculate Split';
        }
    });
}