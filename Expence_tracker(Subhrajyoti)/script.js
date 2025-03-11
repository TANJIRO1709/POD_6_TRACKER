const balance = document.getElementById("balance"),
    moneyPlus = document.getElementById("moneyPlus"),
    moneyMins = document.getElementById("moneyMins"),
    list = document.getElementById("list"),
    form = document.getElementById("form"),
    text = document.getElementById("text"),
    amount = document.getElementById("amount"),
    expensedate = document.getElementById("expensedate");

let transactions = [];
let pieChart; // Variable to store the pie chart instance

// Add transaction
form.addEventListener("submit", addTransaction);
function addTransaction(e) {
    e.preventDefault();
    const transaction = {
        id: generateID(),
        text: text.value,
        amount: amount.value,
        expensedate: expensedate.value
    };

    addTransactionDOM(transaction);
    transactions.push(transaction);
    updateTransaction();

    text.value = "";
    amount.value = "";
    expensedate.value = "";
    init();
    
    document.getElementById('viewPieChartBtn').hidden = false;
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add transaction to DOM
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? "-" : "+";
    const Item = document.createElement("li");

    Item.classList.add(transaction.amount < 0 ? "minus" : "plus");

    Item.innerHTML = `
        ${transaction.text}
        <div><span>${sign} $${Math.abs(transaction.amount)}</span></div>
        <div>${transaction.expensedate}</div>
        <div><button class="delete" onclick="removeTransaction(${transaction.id})">X</button></div>
    `;
    list.appendChild(Item);
}

// Remove transaction
function removeTransaction(id) {
    transactions = transactions.filter((transaction) => transaction.id !== id);
    init();
}

// Initialize the app
function init() {
    list.innerHTML = "";
    if (transactions.length == 0) {
        const Item = document.createElement("li");
        Item.innerHTML = "No Transaction";
        list.appendChild(Item);
    }
    transactions.forEach(addTransactionDOM);
    updateTransaction();
}

// Update transaction totals and pie chart
function updateTransaction() {
    const amounts = transactions.map((transaction) => Number(transaction.amount));
    const total = amounts.reduce((acc, Item) => acc += Number(Item), 0).toFixed(2);

    const income = amounts.filter(Item => Number(Item) > 0).reduce((acc, Item) => acc += Number(Item), 0).toFixed(2);
    const expense = (amounts.filter(Item => Number(Item) < 0).reduce((acc, Item) => acc += Number(Item), 0) * -1).toFixed(2);

    balance.innerText = `$${ total }`;
    moneyPlus.innerText = `$${ income }`;
    moneyMins.innerText = `$${ expense }`;

    // Update the pie chart
    updatePieChart(income, expense, total);
}

// Function to show the second page (Pie Chart)
function showPage2() {
    document.getElementById('page1').style.display = 'none'; // Hide first page
    document.getElementById('page2').style.display = 'block'; // Show second page
    updatePieChart(); // Update the pie chart when the page is shown
}

// Function to show the first page (Transactions)
function showPage1() {
    document.getElementById('page2').style.display = 'none'; // Hide second page
    document.getElementById('page1').style.display = 'block'; // Show first page
}

// Update the pie chart
function updatePieChart() {
    const amounts = transactions.map((transaction) => Number(transaction.amount));
    const total = amounts.reduce((acc, Item) => acc += Number(Item), 0).toFixed(2);
    const income = amounts.filter(Item => Number(Item) > 0).reduce((acc, Item) => acc += Number(Item), 0).toFixed(2);
    const expense = (amounts.filter(Item => Number(Item) < 0).reduce((acc, Item) => acc += Number(Item), 0) * -1).toFixed(2);

    const ctx = document.getElementById('pieChart').getContext('2d');

    // Destroy existing chart if it exists
    if (pieChart) {
        pieChart.destroy();
    }

    // Create new pie chart
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expense', 'Balance'],
            datasets: [{
                data: [income, expense, total],
                backgroundColor: ['#3bb549', '#ff0505', '#2342db'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += `$${context.raw}`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}
// Initialize the app
init();