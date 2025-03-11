let users = JSON.parse(localStorage.getItem("users"))|| [];


const addName = document.querySelector(".add-user");
const names = document.querySelector(".name-cover");
const content = document.querySelector(".container");


function displayNames() {
    names.innerHTML = "";

    users.forEach((user) => {

        
        names.innerHTML+=`
        <div class="name-content">
                <h2>${user.name}</h2>
                
                <button class="del-user">Delete</button>
            </div>`
    });



    document.querySelectorAll(".del-user").forEach((button) => {
        button.addEventListener("click", function () {

            event.stopPropagation();


            let delName = this.parentElement.querySelector("h2").innerText;
            deleteUser(delName);
        });
    });

    document.querySelectorAll(".name-content").forEach((name) => {
        name.addEventListener("click", ()=>{

            nameClick(name.querySelector("h2").innerText);
        })
    });
}

function addUser(){
    let newInput = document.querySelector(".get-name");
    let newName = newInput.value;
    if (newName != ""){
        let newUser = { name: newName};
    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));
    
    newInput.value = "";
    newInput.blur();
    }
    displayNames(); 
}



displayNames();

addName.addEventListener("click", addUser);

function deleteUser(delName){
    users = users.filter(user=> user.name != delName);
    localStorage.setItem("users",JSON.stringify(users));
    displayNames();
}

const delUser = document.querySelectorAll(".del-user");

function nameClick(selectedName){
    content.innerHTML=`<div class="container2">
            <div class="sidebar">
                <h2>${selectedName}</h2>
                <ul>
                    <li class="home">home</li>
                    <li class = "dashboard">dashboard</li>
                    <li class="split">split (working)</li>
                    
                </ul>

            </div>
            <div class="main-content">
                <div class="curr-bal"><h1>balance</h1></div>
                <div class="notes">
                    <div class="bal-container">
                        <div class="deposits"><h1 class="balance">Deposits</h1>
                        
                            <input type="number" id="credit" class="credit money-btn" placeholder="Enter credit amount">
                        </div>
                       
    
                        <input type="text" id="c-text" class="c-text money-btn" placeholder="add a note">
    
                        <button class="add-balance submit-btn">Add Deposit</button>
                    </div>


                    <div class="expense-container">
                        <div class="expense">
                            <h1>Expense</h1>
                        <input type="number" id="debit" class="debit money-btn" placeholder="Enter debit amount">
                        </div>
                        
    
                        <div class="category">
                            <p class="cat-text">Category
                            </p>
                            <div class="cat-container">
                                <div class="cats" data-id="0"><i class="fa-solid fa-house"></i> </div>
                                <div class="cats" data-id="1"><i class="fa-solid fa-utensils"></i> </div>
                                <div class="cats" data-id="2"><i class="fa-solid fa-car-side"></i> </div>
                                <div class="cats" data-id="3"><i class="fa-solid fa-user-graduate"></i> </div>
                                <div class="cats" data-id="4"><i class="fa-solid fa-gamepad"></i> </div>
                                <div class="cats" data-id="5"><i class="fa-solid fa-suitcase-medical"></i> </div>
                                <div class="cats" data-id="6"><i class="fa-solid fa-money-bill-trend-up"></i> </div>
                                <div class="cats" data-id="7">Others</div>

                            
                        </div>
                        
                        
    
                    </div>
                    <input type="text" id="d-text" class="d-text money-btn" placeholder="add a note">
    
                        <button class="add-expense submit-btn">Add Expense</button>
                </div>
                
        </div>
    </div>`

    
    const categoryLabels = ['Housing', 'Food', 'Transportation', 'Education', 'Entertainment', 'Healthcare', 'Investment', 'Others'];
    let selCat=7;
    document.querySelectorAll(".cats").forEach((cat) => {
        cat.addEventListener("click", function () {
            selCat = this.getAttribute("data-id");
    
            document.querySelectorAll(".cats").forEach(c => c.style.border = "none");
            this.style.border = "2px solid #112D4E";
        });
    });
    

    let addDeposit = content.querySelector(".add-balance");
    addDeposit.addEventListener("click", ()=> addCredit(selectedName));

    let addExpense=content.querySelector(".add-expense");
    
    addExpense.addEventListener("click",()=>{addDebit(selectedName, categoryLabels[selCat])
        document.querySelectorAll(".cats").forEach(c => c.style.border = "none")
    });

    calBal(selectedName);


    document.querySelector(".dashboard").addEventListener("click", ()=>{showDashboard(selectedName)});
    document.querySelector(".home").addEventListener("click", ()=>{nameClick(selectedName)});

}


function addDebit(selectedName,selCat){
    let debInput=document.querySelector(".debit");
    let newDeb = debInput.value;
    let debNote=document.querySelector(".d-text");
    let newDNote= debNote.value;
    
    
    if (newDeb != ""){

        let userIndex = users.findIndex(user => user.name === selectedName);

        if (!users[userIndex].debit) {
            users[userIndex].debit = [];
        }
        
        users[userIndex].debit.push({ balance: newDeb, note: newDNote, category:selCat });

        
        if (!users[userIndex].statement){
            users[userIndex].statement = [];
        }
        users[userIndex].statement.push({type:"debit",note:newDNote, amount:newDeb,category:selCat});

        localStorage.setItem("users", JSON.stringify(users));
        debInput.value = "";
        debNote.value = "";
        debInput.blur();  
        debNote.blur();

    
    }
    calBal(selectedName);
}

function addCredit(selectedName){
    let creInput=document.querySelector(".credit");
    let newCre = creInput.value;
    let creNote = document.querySelector(".c-text");
    let newCNote = creNote.value;

    if (newCre!=""){
        let userIndex = users.findIndex(user => user.name === selectedName);

        if (!users[userIndex].credit){
            users[userIndex].credit = [];
        };
        users[userIndex].credit.push({balance: newCre, note: newCNote});
        if (!users[userIndex].statement){
            users[userIndex].statement = [];
        }
        users[userIndex].statement.push({type:"credit",note:newCNote, amount:newCre})
        localStorage.setItem("users",JSON.stringify(users));
    creInput.value="";
    creNote.value="";
    creInput.blur();  
    creNote.blur();

    }
    calBal(selectedName);
}


function calBal(selectedName){
    let totalCredit = 0;
    let totalDebit=0;
    let totalBalance = 0;

    let userIndex = users.findIndex(user=>user.name===selectedName);
    let user = users[userIndex];
    if (user.credit){
        user.credit.forEach(entry => {
            totalCredit += Number(entry.balance);
        });
    }
    if (user.debit){
        user.debit.forEach(entry=>{
            totalDebit+=Number(entry.balance);
        });
    }
    
    
    
    totalBalance = totalCredit-totalDebit;
    document.querySelector(".curr-bal").innerHTML=`<h1>Balance: ${totalBalance}</h1>`

  

}



function showDashboard(selectedName){
    let user = users.find(user => user.name === selectedName);
    document.querySelector(".main-content").innerHTML=`
    <div class="curr-bal"><h1>Dashboard</h1></div>

            <div class="chart">
                
                <canvas id = "myChart" class="my-chart" ></canvas></div>
            <div class="past-transaction">
                
            </div>`


            let transactionContainer = document.querySelector(".past-transaction");

            if (user.statement) {
                user.statement.forEach(transaction => {
                    transactionContainer.innerHTML += `
                        <div class="transaction-detail">
                            <div class="tText">
                                <div class="tNote">Note: ${transaction.note || 'No Note'}</div>
                                <div class="tCat">Category: ${transaction.category || '-'}</div>
                            </div>
                            <div class="tAmount">${transaction.type === "debit" ? '-' : ''}${transaction.amount}</div>
                        </div>
                    `;
                });
            }
            else{
                transactionContainer.innerHTML=`<h2>No Transaction Record</h2>`
    
            }
            
            const ctx = document.getElementById('myChart');
const categoryLabels = ['Housing', 'Food', 'Transportation', 'Education', 'Entertainment', 'Healthcare', 'Investment', 'Others'];
const categoryData = Array(8).fill(0);

if (user.statement) {
    user.statement.forEach(transaction => {
        if (transaction.type === "debit" && transaction.category !== undefined) {
            const categoryIndex = categoryLabels.indexOf(transaction.category);
            if (categoryIndex !== -1) {
                categoryData[categoryIndex] += Number(transaction.amount);
            }
        }
    });
}

function createChart() {
    const totalAmount = categoryData.reduce((acc, value) => acc + value, 0);

    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: categoryLabels,
            datasets: [{
                label: "Expense",
                data: categoryData,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)', 
                    'rgba(255, 99, 132, 0.5)', 
                    'rgba(54, 162, 235, 0.5)', 
                    'rgba(255, 206, 86, 0.5)', 
                    'rgba(153, 102, 255, 0.5)', 
                    'rgba(255, 159, 64, 0.5)', 
                    'rgba(199, 199, 199, 0.5)', 
                    'rgba(128, 0, 128, 0.5)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = tooltipItem.raw;
                            const percentage = ((value / totalAmount) * 100).toFixed(2);
                            return `Category ${tooltipItem.label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
    });
}

if (ctx) {
    createChart();
}
}


