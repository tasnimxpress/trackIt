"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import type { Expense } from '@/types';
import ExpenseForm from '@/components/trackit/ExpenseForm';
import ExpenseDisplayCard from '@/components/trackit/ExpenseDisplayCard';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [displayedDate, setDisplayedDate] = useState<Date | null>(null);
  const [todayDateString, setTodayDateString] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setDisplayedDate(now);
    setTodayDateString(format(now, 'yyyy-MM-dd'));
    
    // Load expenses from localStorage if available
    const storedExpenses = localStorage.getItem('trackit-expenses');
    if (storedExpenses) {
      try {
        const parsedExpenses: Expense[] = JSON.parse(storedExpenses);
        // Ensure data integrity, perhaps filter by date or validate structure
        setExpenses(parsedExpenses);
      } catch (error) {
        console.error("Failed to parse expenses from localStorage", error);
        localStorage.removeItem('trackit-expenses'); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    // Save expenses to localStorage whenever they change
    if (expenses.length > 0 || localStorage.getItem('trackit-expenses')) { // Only save if there are expenses or if it was previously populated
        localStorage.setItem('trackit-expenses', JSON.stringify(expenses));
    }
  }, [expenses]);


  const handleAddExpense = (data: { category: string; subCategory: string; cost: number }) => {
    if (!todayDateString) return; // Should not happen if displayedDate is set

    const newExpense: Expense = {
      id: Date.now().toString(), // Simple unique ID
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

      <ExpenseForm onAddExpense={handleAddExpense} />
      
      <Separator className="max-w-lg" />

      <ExpenseDisplayCard 
        expenses={todaysExpenses} 
        dailyTotal={dailyTotal}
        displayDate={displayedDate} 
      />
    </main>
  );
}
