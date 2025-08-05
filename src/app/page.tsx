"use client"

import { useState } from "react"
import { AddTransactionForm } from "@/components/add-transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { FinancialSummary } from "@/components/financial-summary"
import { ExpenseChart } from "@/components/expense-chart"
import { DetailedReports } from "@/components/detailed-reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react"

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

const initialTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 5000,
    category: "Salário",
    description: "Salário mensal",
    date: "2024-01-01",
  },
  {
    id: "2",
    type: "expense",
    amount: 1200,
    category: "Moradia",
    description: "Aluguel",
    date: "2024-01-02",
  },
  {
    id: "3",
    type: "expense",
    amount: 300,
    category: "Alimentação",
    description: "Supermercado",
    date: "2024-01-03",
  },
  {
    id: "4",
    type: "expense",
    amount: 150,
    category: "Transporte",
    description: "Combustível",
    date: "2024-01-04",
  },
]

export default function FinanceManager() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions([newTransaction, ...transactions])
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Gerenciador Financeiro</h1>
          <p className="text-gray-600">Controle suas finanças pessoais de forma simples e eficiente</p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{balance >= 0 ? "Saldo positivo" : "Saldo negativo"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter((t) => t.type === "income").length} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter((t) => t.type === "expense").length} transações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialSummary transactions={transactions} />
              <ExpenseChart transactions={transactions} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Suas últimas 5 transações</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onDelete={deleteTransaction}
                  showActions={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>Gerencie todas as suas transações financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={transactions} onDelete={deleteTransaction} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Transação</CardTitle>
                <CardDescription>Registre uma nova receita ou despesa</CardDescription>
              </CardHeader>
              <CardContent>
                <AddTransactionForm onAddTransaction={addTransaction} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart transactions={transactions} />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Resumo por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FinancialSummary transactions={transactions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <DetailedReports transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
