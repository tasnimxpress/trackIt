
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

const ADD_NEW_VALUE = "__add_new__";

const ExpenseForm: FC<ExpenseFormProps> = ({ onAddExpense, expenses }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [manualCategoryInput, setManualCategoryInput] = useState<string>("");

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [manualSubCategoryInput, setManualSubCategoryInput] = useState<string>("");

  const [cost, setCost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map(exp => exp.category).filter(cat => cat && cat.trim() !== ""))).sort();
  }, [expenses]);

  const currentCategoryForSuggestions = useMemo(() => {
    return selectedCategory === ADD_NEW_VALUE ? "" : selectedCategory;
  }, [selectedCategory]);

  const subCategorySuggestions = useMemo(() => {
    if (!currentCategoryForSuggestions) return [];
    return Array.from(new Set(
      expenses
        .filter(exp => exp.category === currentCategoryForSuggestions)
        .map(exp => exp.subCategory)
        .filter(sub => sub && sub.trim() !== "")
    )).sort();
  }, [expenses, currentCategoryForSuggestions]);

  const handleCategorySelectChange = (value: string) => {
    setSelectedCategory(value);
    setManualCategoryInput(""); 
    // Reset sub-category when category changes
    setSelectedSubCategory("");
    setManualSubCategoryInput("");
  };

  const handleSubCategorySelectChange = (value: string) => {
    setSelectedSubCategory(value);
    setManualSubCategoryInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const categoryToSubmit = (selectedCategory === ADD_NEW_VALUE ? manualCategoryInput : selectedCategory).trim();
    const subCategoryToSubmit = (selectedSubCategory === ADD_NEW_VALUE ? manualSubCategoryInput : selectedSubCategory).trim();

    if (!categoryToSubmit) {
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

    onAddExpense({ category: categoryToSubmit, subCategory: subCategoryToSubmit, cost: costValue });
    
    // Reset form fields
    setSelectedCategory("");
    setManualCategoryInput("");
    setSelectedSubCategory("");
    setManualSubCategoryInput("");
    setCost("");

    toast({
      title: "Expense Added",
      description: `${categoryToSubmit} - $${costValue.toFixed(2)} has been successfully added.`,
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
            <Label htmlFor="category-select" className="text-base">Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategorySelectChange}>
              <SelectTrigger id="category-select" className="text-base">
                <SelectValue placeholder="Select or add a category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-base">{cat}</SelectItem>
                ))}
                <SelectItem value={ADD_NEW_VALUE} className="text-base">Add new category...</SelectItem>
              </SelectContent>
            </Select>
            {selectedCategory === ADD_NEW_VALUE && (
              <Input
                id="manual-category"
                value={manualCategoryInput}
                onChange={(e) => setManualCategoryInput(e.target.value)}
                placeholder="Enter new category name"
                className="mt-2 text-base"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory-select" className="text-base">Sub-Category (Optional)</Label>
            <Select
              value={selectedSubCategory}
              onValueChange={handleSubCategorySelectChange}
              disabled={!selectedCategory || selectedCategory === ADD_NEW_VALUE}
            >
              <SelectTrigger id="subcategory-select" className="text-base">
                <SelectValue placeholder="Select or add a sub-category" />
              </SelectTrigger>
              <SelectContent>
                {subCategorySuggestions.map(sub => (
                  <SelectItem key={sub} value={sub} className="text-base">{sub}</SelectItem>
                ))}
                {/* Allow adding new sub-category if a category is selected and it's not the "add_new" placeholder */}
                {selectedCategory && selectedCategory !== ADD_NEW_VALUE && (
                  <SelectItem value={ADD_NEW_VALUE} className="text-base">Add new sub-category...</SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedSubCategory === ADD_NEW_VALUE && selectedCategory && selectedCategory !== ADD_NEW_VALUE && (
              <Input
                id="manual-subcategory"
                value={manualSubCategoryInput}
                onChange={(e) => setManualSubCategoryInput(e.target.value)}
                placeholder="Enter new sub-category name"
                className="mt-2 text-base"
              />
            )}
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
