"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Transaction } from "@/app/page"

interface FinancialSummaryProps {
  transactions: Transaction[]
}

export function FinancialSummary({ transactions }: FinancialSummaryProps) {
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)

  const categoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">Nenhuma despesa registrada ainda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryData.map(({ category, amount, percentage }) => (
          <div key={category} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{category}</span>
              <span className="text-sm text-gray-600">
                R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
