"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Expense } from '@/types';
import { format } from 'date-fns';

interface ExpenseDisplayCardProps {
  expenses: Expense[];
  dailyTotal: number;
  displayDate: Date | null;
}

const ExpenseDisplayCard: FC<ExpenseDisplayCardProps> = ({ expenses, dailyTotal, displayDate }) => {
  if (!displayDate) {
    return (
       <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Today's Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading date...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Expenses for {format(displayDate, "MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-base">No expenses added for today yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Category</TableHead>
                <TableHead className="text-base">Sub-Category</TableHead>
                <TableHead className="text-right text-base">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-base">{expense.category}</TableCell>
                  <TableCell className="text-base">{expense.subCategory || "-"}</TableCell>
                  <TableCell className="text-right text-base">${expense.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-4 border-t">
        <p className="text-xl font-bold font-headline">
          Total: <span className="text-primary">${dailyTotal.toFixed(2)}</span>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ExpenseDisplayCard;
