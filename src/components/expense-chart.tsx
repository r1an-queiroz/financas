"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/app/page"
import { BarChart3 } from "lucide-react"

interface ExpenseChartProps {
  transactions: Transaction[]
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
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
  const maxAmount = Math.max(...Object.values(expensesByCategory))

  const categoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      height: maxAmount > 0 ? (amount / maxAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráfico de Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">Nenhuma despesa para exibir</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Gráfico de Despesas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-48 gap-2">
            {categoryData.map(({ category, amount, height }) => (
              <div key={category} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-h-[4px]"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${category}: R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  />
                </div>
                <div className="mt-2 text-xs text-center">
                  <div className="font-medium truncate w-full" title={category}>
                    {category.length > 8 ? `${category.substring(0, 8)}...` : category}
                  </div>
                  <div className="text-gray-600">R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-gray-600">
            Total de Despesas: R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
