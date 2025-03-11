if (!sessionStorage.getItem("browser")) {
    localStorage.clear();
    sessionStorage.setItem("browser", "true");
}

let expense=JSON.parse(localStorage.getItem("expense")) || [];
window.onload = function () {
    if (localStorage.getItem("balance")) {
        document.querySelector("#remain_balance").innerHTML = localStorage.getItem("balance");
    }
};
document.querySelector("#blur").style.visibility="hidden";
document.querySelector("#table").style.visibility="hidden";
document.querySelector("#legend").style.visibility="hidden";

function setBalance(){
    const balance=document.getElementById("balance").value;
    const max=document.getElementById("daily_limit").value;
    if (balance<=0)
    {
        document.getElementById("invalid").innerHTML="Please enter a valid balance";
        return;
    }
    localStorage.setItem("balance",balance);
    localStorage.setItem("limit",max);
    document.querySelector("#remain_balance").innerHTML=balance;
}

function addExpense(){
    document.querySelector("#inv").innerHTML="";
    document.querySelector("#max").innerHTML="";
    const des=document.querySelector("#desc").value;
    const amt=Number(document.querySelector("#amount").value);
    const date=document.querySelector("#date").value;
    const catg=document.querySelector("#category").value;
    if (amt<=0){
        document.querySelector("#inv").innerHTML="Please enter valid amount";
        return;
    }
    let balance=Number(localStorage.getItem("balance"));
    let max_limit=Number(localStorage.getItem("limit"));
    let ex = JSON.parse(localStorage.getItem("expense")) || [];
    if (amt>balance){
        document.querySelector("#inv").innerHTML="Insufficient balance !!";
        return;
    }
    let exp_date=ex.filter(e=>{
        return e.date==date;
    });
    let total_day=exp_date.reduce((sum,e)=>{
        return sum+Number(e.amt);
    },0);
    if((total_day+amt)>max_limit)
    {
        document.querySelector("#max").innerHTML="Maximum daily limit reached !!";
        return;
    }
    balance-=amt;
    localStorage.setItem("balance",balance);
    expense.push({date,des,amt,catg});
    localStorage.setItem("expense",JSON.stringify(expense));
    showExpense();
}
function showExpense(){
    if (expense.length==0){
        document.querySelector("#blur").style.visibility="hidden";
        document.querySelector("#table").style.visibility="hidden";
        document.querySelector("#piechart").style.visibility="hidden";
        document.querySelector("#legend").style.visibility="hidden";
        return;
    }
    document.querySelector("#blur").style.visibility="visible";
    document.querySelector("#table").style.visibility="visible";
    document.querySelector("#piechart").style.visibility="visible";
    document.querySelector("#legend").style.visibility="visible";
    const expense_list=document.querySelector("#expense");
    expense_list.innerHTML="";
    let expenses=JSON.parse(localStorage.getItem("expense")) || [];
    let total_food = 0, total_trans = 0, total_shop = 0, total_ent = 0, total_others = 0, total = 0;
    expenses.forEach((exp,i)=> {
        let tr = document.createElement("tr");
                tr.innerHTML =  '<td>'+exp.date+'</td>'+
                                '<td>'+exp.des+'</td>'+
                                '<td>'+exp.amt+'</td>'+
                                '<td>'+exp.catg+'</td>'+
                                `<td><button class="delete" onclick="deleteExpense(${i}, ${exp.amt})">Delete</button></td>`;
                expense_list.appendChild(tr);
        let amount=Number(exp.amt);
        if (exp.catg=='Food')
            total_food+=amount;
        if (exp.catg=='Transport')
            total_trans+=amount;
        if (exp.catg=='Shopping')
            total_shop+=amount;
        if (exp.catg=='Entertainment')
            total_ent+=amount;
        if (exp.catg=='Others')
            total_others+=amount;
        total+=amount;
    });
    let food=total_food/total*100;
    let transport=food+(total_trans/total)*100;
    let shop=transport+(total_shop/total)*100;
    let entertain=shop+(total_ent/total)*100;
    let others=entertain+(total_others/total)*100;
    document.querySelector("#piechart").style.background = `conic-gradient(green 0% ${food}%,red ${food}% ${transport}%, blue ${transport}% ${shop}%, orange ${shop}% ${entertain}%, lightgray ${entertain}% 100%)`;
    document.querySelector("#remain_balance").innerHTML=localStorage.getItem("balance");
    console.log(total);
}
function hideExpense(){
    document.querySelector("#blur").style.visibility="hidden";
    document.querySelector("#table").style.visibility="hidden";
    document.querySelector("#piechart").style.visibility="hidden";
    document.querySelector("#legend").style.visibility="hidden";
}
function deleteExpense(k, amount) {
    let balance=Number(localStorage.getItem("balance"));
    balance +=Number(amount);
    localStorage.setItem("balance", balance);
    let e = JSON.parse(localStorage.getItem("expense")) || [];
    e.splice(k,1);
    localStorage.setItem("expense",JSON.stringify(e));
    expense=e;
    showExpense(); 
}