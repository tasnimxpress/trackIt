
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import type { Expense } from '@/types';
import ExpenseForm from '@/components/trackit/ExpenseForm';
import ExpenseDisplayCard from '@/components/trackit/ExpenseDisplayCard';
import MonthlyExpenseReport from '@/components/trackit/MonthlyExpenseReport';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [displayedDate, setDisplayedDate] = useState<Date | null>(null);
  const [todayDateString, setTodayDateString] = useState<string>("");
  const [reportMonth, setReportMonth] = useState<Date>(new Date());

  useEffect(() => {
    const now = new Date();
    setDisplayedDate(now);
    setTodayDateString(format(now, 'yyyy-MM-dd'));
    setReportMonth(now); 
    
    const storedExpenses = localStorage.getItem('trackit-expenses');
    if (storedExpenses) {
      try {
        const parsedExpenses: Expense[] = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses);
      } catch (error) {
        console.error("Failed to parse expenses from localStorage", error);
        localStorage.removeItem('trackit-expenses'); 
      }
    }
  }, []);

  useEffect(() => {
    if (expenses.length > 0 || localStorage.getItem('trackit-expenses')) {
        localStorage.setItem('trackit-expenses', JSON.stringify(expenses));
    }
  }, [expenses]);


  const handleAddExpense = (data: { category: string; subCategory: string; cost: number }) => {
    if (!todayDateString) return; 

    const newExpense: Expense = {
      id: Date.now().toString(), 
      ...data,
      date: todayDateString,
    };
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
  };

  const todaysExpenses = useMemo(() => {
    if (!todayDateString) return [];
    return expenses.filter(expense => expense.date === todayDateString);
  }, [expenses, todayDateString]);

  const dailyTotal = useMemo(() => {
    return todaysExpenses.reduce((sum, expense) => sum + expense.cost, 0);
  }, [todaysExpenses]);

  const handlePreviousMonth = () => {
    setReportMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setReportMonth(prev => addMonths(prev, 1));
  };

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDateParts = expense.date.split('-').map(Number);
      const expenseYear = expenseDateParts[0];
      const expenseMonth = expenseDateParts[1] - 1; // JS Date month is 0-indexed
      return expenseYear === reportMonth.getFullYear() && expenseMonth === reportMonth.getMonth();
    });
  }, [expenses, reportMonth]);

  return (
    <main className="flex flex-col items-center min-h-screen p-4 sm:p-8 space-y-8 bg-background">
      <header className="text-center space-y-2">
        <h1 className="text-5xl font-bold font-headline text-primary">
          TrackIt
        </h1>
        {displayedDate && (
          <p className="text-xl text-muted-foreground font-medium">
            Today: {format(displayedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        )}
      </header>
      
      <Separator className="max-w-lg" />

      <ExpenseForm onAddExpense={handleAddExpense} expenses={expenses} />
      
      <Separator className="max-w-2xl" />

      <Tabs defaultValue="daily" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="daily" className="text-base py-2.5">Daily View</TabsTrigger>
          <TabsTrigger value="monthly" className="text-base py-2.5">Monthly Report</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <ExpenseDisplayCard 
            expenses={todaysExpenses} 
            dailyTotal={dailyTotal}
            displayDate={displayedDate} 
          />
        </TabsContent>
        <TabsContent value="monthly">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center space-x-4 my-4">
              <Button onClick={handlePreviousMonth} variant="outline" size="icon" aria-label="Previous month">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-xl font-medium text-center w-48 tabular-nums">
                {format(reportMonth, 'MMMM yyyy')}
              </span>
              <Button onClick={handleNextMonth} variant="outline" size="icon" aria-label="Next month">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <MonthlyExpenseReport expenses={monthlyExpenses} reportDate={reportMonth} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
