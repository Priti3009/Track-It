// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext.jsx";
import api from "../utils/api.jsx";
import DateFilter from "../components/DateFilter.jsx";
import RecentTransactions from "../components/RecentTransactions.jsx";

const Dashboard = () => {
  // State for month/year filter (dummy for now)
 const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const {user}=useAuth();

  const [totalIncome,setTotalIncome]=useState();
  const [totalExpense,setTotalExpense]=useState();
  const [totalSavings,setTotalSavings]=useState()

  const [transactions,setTransactions]=useState([]);

  //Fetch totalIncome,totalExpense,totalSavings (from /dashboard)
  useEffect(()=>{
    const getDashboardSummary=async()=>{
      try {
        const query=[]
        if(month) query.push(`month=${month}`);
        if(year) query.push(`year=${year}`);
        const queryString=query.length? `?${query.join("&")}`:"";    

        const res=await api.get(`/v1/dashboard${queryString}`);    //v1/dashboard?month=09&year=2025
        const data=res.data.data;

        setTotalIncome(data.totalIncome || 0)   
        setTotalExpense(data.totalExpense || 0)
        setTotalSavings(data.savings ||0)  
        
        console.log("Dashboard Summary: ",data)
      } catch (error) {
        console.log("Cannot fetch dashboard summary",error)
        setTotalIncome(0)
        setTotalExpense(0);
        setTotalSavings(0);
      }
    }
    getDashboardSummary()
  },[month,year]);     //Refetch whenever month/year changes

  //Fetch recent transactions(from /income ,/expense)
  useEffect(()=>{
    const getTransactions=async()=>{
      try {
        const query=[]
        if(month) query.push(`month=${month}`);
        if(year) query.push(`year=${year}`);
        const queryString=query.length?`?${query.join("&")}`:"";

        const incomeRes=await api.get(`/v1/income/all${queryString}`)
        const expenseRes=await api.get(`/v1/expense/all${queryString}`)

        const incomeData=incomeRes.data.data.map((item)=>({
          ...item,
          type:"income"
        }));

        const expenseData=expenseRes.data.data.map((item)=>({
          ...item,
          type:"expense",
        }));

        const merged=[...incomeData,...expenseData].sort(
        (a,b)=>
          new Date(b.date) - new Date(a.date)
      )

      setTransactions(merged)
        
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]);
        
      }
    };
    getTransactions();
  },[month,year])


  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* --- Page Title + DateFilter --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <DateFilter
          defaultMonth={month}
          defaultYear={year}
          onChange={({ month, year }) => {
            setMonth(month);
            setYear(year);
          }}
        />
      </div>

      {/* --- Summary Cards Section --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Income Card */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-600">Total Income</h2>
          <p className="mt-2 text-2xl font-bold text-emerald-600">₹{totalIncome}</p>
         
        </div>

        {/* Expense Card */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-600">Total Expense</h2>
          <p className="mt-2 text-2xl font-bold text-red-500">₹{totalExpense}</p>
        
        </div>

        {/* Savings Card */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-600">Total Savings</h2>
          <p className="mt-2 text-2xl font-bold text-blue-500">₹{totalSavings}</p>
          
        </div>
      </div>

      {/* --- Recent Transactions --- */}
      <RecentTransactions transactions={transactions}/>
     
     
    </div>
  );
};

export default Dashboard;