"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Transaction } from "@/app/page"
import { PieChart, ArrowUp, ArrowDown, Minus } from "lucide-react"

interface CategoryComparisonProps {
  currentTransactions: Transaction[]
  previousTransactions: Transaction[]
  periodLabel: string
}

export function CategoryComparison({
  currentTransactions,
  previousTransactions,
  periodLabel,
}: CategoryComparisonProps) {
  const getCurrentCategoryData = () => {
    return currentTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )
  }

  const getPreviousCategoryData = () => {
    return previousTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )
  }

  const currentData = getCurrentCategoryData()
  const previousData = getPreviousCategoryData()

  const allCategories = new Set([...Object.keys(currentData), ...Object.keys(previousData)])
  const totalCurrent = Object.values(currentData).reduce((sum, amount) => sum + amount, 0)

  const comparisonData = Array.from(allCategories)
    .map((category) => {
      const current = currentData[category] || 0
      const previous = previousData[category] || 0
      const percentage = totalCurrent > 0 ? (current / totalCurrent) * 100 : 0
      const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0

      return {
        category,
        current,
        previous,
        percentage,
        change,
      }
    })
    .sort((a, b) => b.current - a.current)

  const getChangeIcon = (change: number) => {
    if (change > 5) return <ArrowUp className="h-3 w-3 text-red-600" />
    if (change < -5) return <ArrowDown className="h-3 w-3 text-green-600" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const getChangeColor = (change: number) => {
    if (change > 5) return "text-red-600"
    if (change < -5) return "text-green-600"
    return "text-gray-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Comparação de Categorias
        </CardTitle>
        <p className="text-sm text-gray-600">{periodLabel} vs período anterior</p>
      </CardHeader>
      <CardContent>
        {comparisonData.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhuma despesa para comparar</p>
        ) : (
          <div className="space-y-4">
            {comparisonData.map(({ category, current, previous, percentage, change }) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    {getChangeIcon(change)}
                    <span className={`text-xs ${getChangeColor(change)}`}>
                      {change > 0 ? "+" : ""}
                      {change.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Atual: R$ {current.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  <span>Anterior: R$ {previous.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="text-xs text-gray-500">{percentage.toFixed(1)}% do total de despesas</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
