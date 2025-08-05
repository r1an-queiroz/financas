"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/app/page"
import { TrendingUp } from "lucide-react"

interface MonthlyChartProps {
  transactions: Transaction[]
  selectedYear: number
}

export function MonthlyChart({ transactions, selectedYear }: MonthlyChartProps) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

  const monthlyData = months.map((month, index) => {
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === index && date.getFullYear() === selectedYear
    })

    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const balance = income - expenses

    return { month, income, expenses, balance }
  })

  const maxValue = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expenses)),
    1000, // minimum scale
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução Mensal {selectedYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-48 gap-1">
            {monthlyData.map(({ month, income, expenses }) => (
              <div key={month} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center gap-1">
                  {/* Income bar */}
                  <div
                    className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600 min-h-[2px]"
                    style={{ height: `${Math.max((income / maxValue) * 100, 2)}%` }}
                    title={`Receitas ${month}: R$ ${income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-full bg-red-500 rounded-b transition-all duration-300 hover:bg-red-600 min-h-[2px]"
                    style={{ height: `${Math.max((expenses / maxValue) * 100, 2)}%` }}
                    title={`Despesas ${month}: R$ ${expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  />
                </div>
                <div className="mt-2 text-xs text-center font-medium">{month}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Despesas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
