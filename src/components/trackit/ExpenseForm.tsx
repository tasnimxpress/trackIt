"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  onAddExpense: (data: { category: string; subCategory: string; cost: number }) => void;
}

const ExpenseForm: FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }
    if (!cost.trim()) {
      setError("Cost is required.");
      return;
    }
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue <= 0) {
      setError("Cost must be a positive number.");
      return;
    }

    onAddExpense({ category, subCategory, cost: costValue });
    setCategory("");
    setSubCategory("");
    setCost("");
    toast({
      title: "Expense Added",
      description: `${category} - $${costValue.toFixed(2)} has been successfully added.`,
    });
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Add New Expense</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Food, Transport"
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subCategory" className="text-base">Sub-Category (Optional)</Label>
            <Input
              id="subCategory"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g., Groceries, Bus fare"
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost" className="text-base">Cost</Label>
            <Input
              id="cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g., 15.75"
              min="0.01"
              step="0.01"
              className="text-base"
            />
          </div>
          {error && (
            <div className="flex items-center p-3 text-sm rounded-md bg-destructive/10 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-base py-6">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExpenseForm;
