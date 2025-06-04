
"use client";

import type { FC } from 'react';
import React, { useState, useMemo, useEffect } from 'react';
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

const ADD_NEW_CATEGORY_VALUE = "___ADD_NEW_CATEGORY___";
const ADD_NEW_SUBCATEGORY_VALUE = "___ADD_NEW_SUBCATEGORY___";

const ExpenseForm: FC<ExpenseFormProps> = ({ onAddExpense, expenses }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [newSubCategoryName, setNewSubCategoryName] = useState<string>("");
  
  const [cost, setCost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(expenses.map(exp => exp.category).filter(cat => cat && cat.trim() !== ""))).sort();
  }, [expenses]);

  const subCategorySuggestions = useMemo(() => {
    if (!selectedCategory || selectedCategory === ADD_NEW_CATEGORY_VALUE) {
      return [];
    }
    return Array.from(new Set(
      expenses
        .filter(exp => exp.category === selectedCategory)
        .map(exp => exp.subCategory)
        .filter(sub => sub && sub.trim() !== "")
    )).sort();
  }, [expenses, selectedCategory]);

  useEffect(() => {
    setSelectedSubCategory("");
    setNewSubCategoryName("");
  }, [selectedCategory]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let categoryToSubmit = selectedCategory === ADD_NEW_CATEGORY_VALUE ? newCategoryName.trim() : selectedCategory;
    let subCategoryToSubmit = "";

    if (selectedCategory === ADD_NEW_CATEGORY_VALUE) {
      subCategoryToSubmit = newSubCategoryName.trim(); 
    } else {
      subCategoryToSubmit = selectedSubCategory === ADD_NEW_SUBCATEGORY_VALUE ? newSubCategoryName.trim() : selectedSubCategory;
    }

    if (!categoryToSubmit) {
      setError("Category is required.");
      return;
    }
    // Sub-category is now implicitly required if we remove optional tag, but can be empty string if not provided
    // For this app, let's assume an empty string is fine if not explicitly filled.
    // If it needs to be strictly non-empty, add validation:
    // if (!subCategoryToSubmit && selectedCategory !== ADD_NEW_CATEGORY_VALUE && subCategorySuggestions.length > 0) {
    //   setError("Sub-Category is required when available or adding new.");
    //   return;
    // }
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
    
    setSelectedCategory("");
    setNewCategoryName("");
    setSelectedSubCategory("");
    setNewSubCategoryName("");
    setCost("");

    toast({
      title: "Expense Added",
      description: `${categoryToSubmit}${subCategoryToSubmit ? ` (${subCategoryToSubmit})` : ''} - $${costValue.toFixed(2)} has been successfully added.`,
    });
  };
  
  const showNewCategoryInput = selectedCategory === ADD_NEW_CATEGORY_VALUE;
  const showSubCategorySection = selectedCategory && selectedCategory !== ""; // Show if a category is selected or "add new" is chosen for category
  
  // Show sub-category select only if an *existing* category is selected
  const showSubCategorySelect = showSubCategorySection && selectedCategory !== ADD_NEW_CATEGORY_VALUE;
  
  // Show new sub-category input if:
  // 1. A new main category is being added (selectedCategory === ADD_NEW_CATEGORY_VALUE)
  // OR
  // 2. An existing main category is selected AND "Add new sub-category..." is chosen for sub-category
  const showNewSubCategoryInput = 
    (selectedCategory === ADD_NEW_CATEGORY_VALUE) || 
    (selectedCategory !== ADD_NEW_CATEGORY_VALUE && selectedSubCategory === ADD_NEW_SUBCATEGORY_VALUE);


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
              value={selectedCategory} 
              onValueChange={(value) => {
                setSelectedCategory(value);
                if (value !== ADD_NEW_CATEGORY_VALUE) {
                  setNewCategoryName(""); 
                }
                 // Reset sub-category when main category changes
                setSelectedSubCategory("");
                setNewSubCategoryName("");
              }}
            >
              <SelectTrigger id="category-select" className="text-base">
                <SelectValue placeholder="Select or add a category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-base">{cat}</SelectItem>
                ))}
                <SelectItem value={ADD_NEW_CATEGORY_VALUE} className="text-base text-primary">Add new category...</SelectItem>
              </SelectContent>
            </Select>
            {showNewCategoryInput && (
              <Input
                id="new-category-input"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name"
                className="text-base mt-2"
                aria-label="New category name"
              />
            )}
          </div>

          {showSubCategorySection && (
            <div className="space-y-2">
              <Label htmlFor={showSubCategorySelect ? "subcategory-select" : "new-subcategory-input"} className="text-base">Sub-Category</Label>
              {showSubCategorySelect && (
                <Select
                  value={selectedSubCategory}
                  onValueChange={(value) => {
                    setSelectedSubCategory(value);
                    if (value !== ADD_NEW_SUBCATEGORY_VALUE) {
                      setNewSubCategoryName(""); 
                    }
                  }}
                >
                  <SelectTrigger id="subcategory-select" className="text-base">
                    <SelectValue placeholder="Select or add a sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategorySuggestions.map(sub => (
                      <SelectItem key={sub} value={sub} className="text-base">{sub}</SelectItem>
                    ))}
                     <SelectItem value={ADD_NEW_SUBCATEGORY_VALUE} className="text-base text-primary">Add new sub-category...</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {showNewSubCategoryInput && (
                 <Input
                    id="new-subcategory-input"
                    value={newSubCategoryName}
                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                    placeholder={selectedCategory === ADD_NEW_CATEGORY_VALUE ? "Enter sub-category name" : "Enter new sub-category name"}
                    className="text-base mt-2"
                    aria-label="New sub-category name"
                  />
              )}
            </div>
          )}

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
