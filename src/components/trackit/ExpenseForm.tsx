
"use client";

import type { FC } from 'react';
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from '@/types';

interface ExpenseFormProps {
  onAddExpense: (data: { category: string; subCategory: string; cost: number }) => void;
  expenses: Expense[];
}

const ExpenseForm: FC<ExpenseFormProps> = ({ onAddExpense, expenses }) => {
  const [selectedCategoryValue, setSelectedCategoryValue] = useState<string>("");
  const [newCategoryInputValue, setNewCategoryInputValue] = useState<string>("");

  const [selectedSubCategoryValue, setSelectedSubCategoryValue] = useState<string>("");
  const [newSubCategoryInputValue, setNewSubCategoryInputValue] = useState<string>("");
  
  const [cost, setCost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map(exp => exp.category).filter(cat => cat && cat.trim() !== ""))).sort();
  }, [expenses]);

  const subCategorySuggestions = useMemo(() => {
    // Suggestions are only based on a category selected from the dropdown,
    // not if a new category is being typed.
    if (!selectedCategoryValue || newCategoryInputValue.trim() !== "") return [];
    return Array.from(new Set(
      expenses
        .filter(exp => exp.category === selectedCategoryValue)
        .map(exp => exp.subCategory)
        .filter(sub => sub && sub.trim() !== "")
    )).sort();
  }, [expenses, selectedCategoryValue, newCategoryInputValue]);

  const handleCategorySelectChange = (value: string) => {
    setSelectedCategoryValue(value);
    setNewCategoryInputValue(""); // Clear manual input if dropdown is used
    // Reset sub-category when category changes
    setSelectedSubCategoryValue("");
    setNewSubCategoryInputValue("");
  };

  const handleNewCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryInputValue(e.target.value);
    setSelectedCategoryValue(""); // Clear dropdown if manual input is used
    // Reset sub-category when category changes
    setSelectedSubCategoryValue("");
    setNewSubCategoryInputValue("");
  };

  const handleSubCategorySelectChange = (value: string) => {
    setSelectedSubCategoryValue(value);
    setNewSubCategoryInputValue(""); // Clear manual input if dropdown is used
  };

  const handleNewSubCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSubCategoryInputValue(e.target.value);
    setSelectedSubCategoryValue(""); // Clear dropdown if manual input is used
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const categoryToSubmit = newCategoryInputValue.trim() || selectedCategoryValue;
    const subCategoryToSubmit = newSubCategoryInputValue.trim() || selectedSubCategoryValue;

    if (!categoryToSubmit) {
      setError("Category is required (either select an existing one or enter a new one).");
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

    onAddExpense({ category: categoryToSubmit, subCategory: subCategoryToSubmit, cost: costValue });
    
    setSelectedCategoryValue("");
    setNewCategoryInputValue("");
    setSelectedSubCategoryValue("");
    setNewSubCategoryInputValue("");
    setCost("");

    toast({
      title: "Expense Added",
      description: `${categoryToSubmit}${subCategoryToSubmit ? ` (${subCategoryToSubmit})` : ''} - $${costValue.toFixed(2)} has been successfully added.`,
    });
  };
  
  const isNewCategoryTyped = newCategoryInputValue.trim() !== "";
  const isCategorySelected = selectedCategoryValue !== "";
  const isCategoryChosen = isNewCategoryTyped || isCategorySelected;

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Add New Expense</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category-select" className="text-base">Category</Label>
            <Select 
              value={selectedCategoryValue} 
              onValueChange={handleCategorySelectChange}
              disabled={isNewCategoryTyped}
            >
              <SelectTrigger id="category-select" className="text-base">
                <SelectValue placeholder="Select an existing category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-base">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 my-1">
              <div className="flex-grow border-t border-muted"></div>
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>
            <Input
              id="new-category-input"
              value={newCategoryInputValue}
              onChange={handleNewCategoryInputChange}
              placeholder="Enter new category name"
              className="text-base"
              disabled={isCategorySelected && !isNewCategoryTyped}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory-select" className="text-base">Sub-Category (Optional)</Label>
            <Select
              value={selectedSubCategoryValue}
              onValueChange={handleSubCategorySelectChange}
              disabled={!isCategoryChosen || isNewCategoryTyped || newSubCategoryInputValue.trim() !== ""}
            >
              <SelectTrigger id="subcategory-select" className="text-base">
                <SelectValue placeholder={isNewCategoryTyped ? "Enter new sub-category below" : "Select existing sub-category"} />
              </SelectTrigger>
              <SelectContent>
                {subCategorySuggestions.map(sub => (
                  <SelectItem key={sub} value={sub} className="text-base">{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 my-1">
              <div className="flex-grow border-t border-muted"></div>
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>
            <Input
              id="new-subcategory-input"
              value={newSubCategoryInputValue}
              onChange={handleNewSubCategoryInputChange}
              placeholder="Enter new sub-category name"
              className="text-base"
              disabled={!isCategoryChosen || (selectedSubCategoryValue !== "" && newSubCategoryInputValue.trim() === "")}
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
