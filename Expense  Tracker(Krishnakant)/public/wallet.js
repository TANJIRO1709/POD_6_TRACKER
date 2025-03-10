document.addEventListener('DOMContentLoaded', function() {
    const currentBalanceElement = document.getElementById('currentBalance');
    const amountInput = document.getElementById('amountInput');
    const addMoneyBtn = document.getElementById('addMoneyBtn');
    const transactionsList = document.getElementById('transactionsList');

    let walletData = loadWalletData();
    updateUI();

    addMoneyBtn.addEventListener('click', handleAddMoney);
    amountInput.addEventListener('input', validateInput);

    function loadWalletData() {
        try {
            return JSON.parse(localStorage.getItem('walletData')) || {
                balance: 0,
                transactions: []
            };
        } catch (error) {
            console.error('Error loading wallet data:', error);
            return {
                balance: 0,
                transactions: []
            };
        }
    }

    function handleAddMoney() {
        try {
            const amount = parseFloat(amountInput.value);
            
            if (!validateAmount(amount)) return;

            updateWalletData(amount);
            updateUI();
            resetInput();

        } catch (error) {
            console.error('Error adding money:', error);
            alert('Failed to add money. Please try again.');
        }
    }

    function validateAmount(amount) {
        if (!amount || amount <= 0 || isNaN(amount)) {
            alert('Please enter a valid amount');
            return false;
        }
        return true;
    }

    function updateWalletData(amount) {
        walletData.balance += amount;
        walletData.transactions.unshift({
            type: 'credit',
            amount: amount,
            date: new Date().toISOString(),
            balance: walletData.balance
        });
        
        localStorage.setItem('walletData', JSON.stringify(walletData));
    }

    function updateUI() {
        currentBalanceElement.textContent = walletData.balance.toFixed(2);
        updateTransactionsList();
    }

    function updateTransactionsList() {
        transactionsList.innerHTML = walletData.transactions.map(transaction => `
            <div class="transaction-item">
                <div>
                    <span class="transaction-amount">
                        ${transaction.type === 'credit' ? '+' : '-'} 
                        Rs. ${transaction.amount.toFixed(2)}
                    </span>
                    <div class="transaction-date">
                        ${new Date(transaction.date).toLocaleString()}
                    </div>
                </div>
                <div>
                    Balance: Rs. ${transaction.balance.toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    function resetInput() {
        amountInput.value = '';
    }

    function validateInput() {
        const amount = parseFloat(amountInput.value);
        validateAmount(amount);
    }

    // Initial render of transactions
    updateTransactionsList();
});