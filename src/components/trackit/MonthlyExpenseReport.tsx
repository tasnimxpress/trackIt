
"use client";

import type { FC } from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import type { Expense } from '@/types';
import { format } from 'date-fns';

interface MonthlyExpenseReportProps {
  expenses: Expense[];
  reportDate: Date;
}

const MonthlyExpenseReport: FC<MonthlyExpenseReportProps> = ({ expenses, reportDate }) => {
  const monthlyTotal = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.cost, 0);
  }, [expenses]);

  const handleDownloadCSV = () => {
    const monthYear = format(reportDate, 'yyyy-MM');
    const filename = `expenses-${monthYear}.csv`;

    let csvContent = "Date,Category,Sub-Category,Cost\n";
    expenses.forEach(expense => {
      const row = [
        expense.date,
        `"${expense.category.replace(/"/g, '""')}"`, // Escape double quotes in category
        `"${(expense.subCategory || "").replace(/"/g, '""')}"`, // Handle empty subCategory and escape
        expense.cost.toFixed(2)
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Expenses for {format(reportDate, "MMMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-base">
            No expenses recorded for {format(reportDate, "MMMM yyyy")}.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base w-[120px]">Date</TableHead>
                <TableHead className="text-base">Category</TableHead>
                <TableHead className="text-base">Sub-Category</TableHead>
                <TableHead className="text-right text-base w-[100px]">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-base tabular-nums">{expense.date}</TableCell>
                  <TableCell className="text-base">{expense.category}</TableCell>
                  <TableCell className="text-base">{expense.subCategory || "-"}</TableCell>
                  <TableCell className="text-right text-base tabular-nums">${expense.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-4">
        <Button onClick={handleDownloadCSV} variant="outline" disabled={expenses.length === 0}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
        <p className="text-xl font-bold font-headline">
          Monthly Total: <span className="text-primary">${monthlyTotal.toFixed(2)}</span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default MonthlyExpenseReport;
