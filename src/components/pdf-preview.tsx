"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/app/page"
import { FileText } from "lucide-react"

interface PDFPreviewProps {
  periodLabel: string
  currentStats: {
    income: number
    expenses: number
    balance: number
    transactionCount: number
  }
  transactions: Transaction[]
}

export function PDFPreview({ periodLabel, currentStats, transactions }: PDFPreviewProps) {
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const incomeByCategory = transactions
    .filter((t) => t.type === "income")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Prévia do Relatório PDF
        </CardTitle>
        <p className="text-sm text-gray-600">Visualização do conteúdo que será incluído no relatório PDF</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Preview */}
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <h2 className="text-lg font-bold">Relatório Financeiro</h2>
          <p className="text-sm opacity-90">{periodLabel}</p>
          <p className="text-xs opacity-75">Gerado em: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        {/* Summary Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <div className="text-xs font-medium text-green-700">RECEITAS</div>
            <div className="text-lg font-bold">
              R$ {currentStats.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded">
            <div className="text-xs font-medium text-red-700">DESPESAS</div>
            <div className="text-lg font-bold">
              R$ {currentStats.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div
            className={`${currentStats.balance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border p-3 rounded`}
          >
            <div className={`text-xs font-medium ${currentStats.balance >= 0 ? "text-green-700" : "text-red-700"}`}>
              SALDO
            </div>
            <div className="text-lg font-bold">
              R$ {currentStats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-600">{currentStats.transactionCount} transações</div>
          </div>
        </div>

        {/* Table Preview */}
        <div>
          <h3 className="font-medium text-blue-600 mb-2">Tabela de Transações</h3>
          <div className="bg-gray-50 p-3 rounded text-xs">
            <div className="grid grid-cols-5 gap-2 font-medium mb-2 pb-2 border-b">
              <div>Data</div>
              <div>Descrição</div>
              <div>Categoria</div>
              <div>Tipo</div>
              <div>Valor</div>
            </div>
            {transactions.slice(0, 3).map((transaction, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 py-1">
                <div>{new Date(transaction.date).toLocaleDateString("pt-BR")}</div>
                <div className="truncate">
                  {transaction.description.length > 15
                    ? transaction.description.substring(0, 15) + "..."
                    : transaction.description}
                </div>
                <div>{transaction.category}</div>
                <div>
                  <Badge variant={transaction.type === "income" ? "default" : "destructive"} className="text-xs">
                    {transaction.type === "income" ? "Receita" : "Despesa"}
                  </Badge>
                </div>
                <div className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                  R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
            {transactions.length > 3 && (
              <div className="text-center text-gray-500 mt-2">... e mais {transactions.length - 3} transações</div>
            )}
          </div>
        </div>

        {/* Category Analysis Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(expensesByCategory).length > 0 && (
            <div>
              <h3 className="font-medium text-red-600 mb-2">Despesas por Categoria</h3>
              <div className="space-y-2">
                {Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="text-red-600">
                        R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {Object.keys(incomeByCategory).length > 0 && (
            <div>
              <h3 className="font-medium text-green-600 mb-2">Receitas por Categoria</h3>
              <div className="space-y-2">
                {Object.entries(incomeByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="text-green-600">
                        R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Conteúdo do PDF:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Cabeçalho profissional com logo e data</li>
            <li>• Resumo executivo com cards coloridos</li>
            <li>• Insights automáticos do período</li>
            <li>• Tabela completa de transações</li>
            <li>• Análise detalhada por categoria com gráficos</li>
            <li>• Rodapé com numeração de páginas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
