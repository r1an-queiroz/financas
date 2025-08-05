"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/app/page"
import { Trash2, TrendingUp, TrendingDown } from "lucide-react"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  showActions?: boolean
}

export function TransactionList({ transactions, onDelete, showActions = true }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma transação encontrada</p>
        <p className="text-sm">Adicione sua primeira transação para começar</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
              {transaction.type === "income" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{transaction.description}</h3>
                <Badge variant="secondary" className="text-xs">
                  {transaction.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`font-bold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
              {transaction.type === "income" ? "+" : "-"}R${" "}
              {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>

            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(transaction.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
