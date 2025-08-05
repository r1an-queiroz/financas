"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Transaction } from "@/app/page"
import { Calendar, Download, BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { MonthlyChart } from "@/components/monthly-chart"
import { CategoryComparison } from "@/components/category-comparison"
// Adicionar import para o componente de PDF
import { PDFGenerator } from "@/components/pdf-generator"
// Adicionar import para PDFPreview
import { PDFPreview } from "@/components/pdf-preview"

interface DetailedReportsProps {
  transactions: Transaction[]
}

type PeriodType = "month" | "quarter" | "year" | "custom"

export function DetailedReports({ transactions }: DetailedReportsProps) {
  const [periodType, setPeriodType] = useState<PeriodType>("month")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const transactionMonth = transactionDate.getMonth()
      const transactionYear = transactionDate.getFullYear()

      switch (periodType) {
        case "month":
          return transactionMonth === selectedMonth && transactionYear === selectedYear
        case "quarter":
          const quarter = Math.floor(selectedMonth / 3)
          const transactionQuarter = Math.floor(transactionMonth / 3)
          return transactionQuarter === quarter && transactionYear === selectedYear
        case "year":
          return transactionYear === selectedYear
        default:
          return true
      }
    })
  }, [transactions, periodType, selectedMonth, selectedYear])

  const previousPeriodTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const transactionMonth = transactionDate.getMonth()
      const transactionYear = transactionDate.getFullYear()

      switch (periodType) {
        case "month":
          const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
          const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
          return transactionMonth === prevMonth && transactionYear === prevYear
        case "quarter":
          const quarter = Math.floor(selectedMonth / 3)
          const prevQuarter = quarter === 0 ? 3 : quarter - 1
          const prevQuarterYear = quarter === 0 ? selectedYear - 1 : selectedYear
          const transactionQuarter = Math.floor(transactionMonth / 3)
          return transactionQuarter === prevQuarter && transactionYear === prevQuarterYear
        case "year":
          return transactionYear === selectedYear - 1
        default:
          return false
      }
    })
  }, [transactions, periodType, selectedMonth, selectedYear])

  const currentPeriodStats = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const balance = income - expenses
    const transactionCount = filteredTransactions.length

    return { income, expenses, balance, transactionCount }
  }, [filteredTransactions])

  const previousPeriodStats = useMemo(() => {
    const income = previousPeriodTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = previousPeriodTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    const balance = income - expenses

    return { income, expenses, balance }
  }, [previousPeriodTransactions])

  const getComparisonIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getComparisonColor = (current: number, previous: number, isExpense = false) => {
    if (current > previous) return isExpense ? "text-red-600" : "text-green-600"
    if (current < previous) return isExpense ? "text-green-600" : "text-red-600"
    return "text-gray-600"
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const getPeriodLabel = () => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]

    switch (periodType) {
      case "month":
        return `${months[selectedMonth]} ${selectedYear}`
      case "quarter":
        const quarter = Math.floor(selectedMonth / 3) + 1
        return `${quarter}º Trimestre ${selectedYear}`
      case "year":
        return `Ano ${selectedYear}`
      default:
        return "Período Personalizado"
    }
  }

  // Substituir a função exportReport existente por:
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const pdfGenerator = new PDFGenerator()
      await pdfGenerator.generateReport({
        periodLabel: getPeriodLabel(),
        currentStats: currentPeriodStats,
        previousStats: previousPeriodStats,
        transactions: filteredTransactions,
        periodType,
        selectedMonth,
        selectedYear,
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar relatório PDF. Tente novamente.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const exportReport = () => {
    const reportData = {
      periodo: getPeriodLabel(),
      resumo: currentPeriodStats,
      transacoes: filteredTransactions,
      geradoEm: new Date().toLocaleString("pt-BR"),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-${getPeriodLabel().toLowerCase().replace(/\s+/g, "-")}.json`
    link.click()
  }

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Relatórios Detalhados
              </CardTitle>
              <CardDescription>Análise completa das suas finanças por período</CardDescription>
            </div>
            {/* Substituir o botão de exportar por: */}
            <div className="flex gap-2">
              <Button onClick={exportReport} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar JSON
              </Button>
              <Button onClick={generatePDF} disabled={isGeneratingPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? "Gerando PDF..." : "Gerar PDF"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Período</label>
              <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="quarter">Trimestral</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(periodType === "month" || periodType === "quarter") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Período: {getPeriodLabel()}</CardTitle>
          <CardDescription>{currentPeriodStats.transactionCount} transações registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Receitas</span>
                {getComparisonIcon(currentPeriodStats.income, previousPeriodStats.income)}
              </div>
              <div className="text-2xl font-bold text-green-600">
                R$ {currentPeriodStats.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-sm ${getComparisonColor(currentPeriodStats.income, previousPeriodStats.income)}`}>
                {getPercentageChange(currentPeriodStats.income, previousPeriodStats.income).toFixed(1)}% vs período
                anterior
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Despesas</span>
                {getComparisonIcon(currentPeriodStats.expenses, previousPeriodStats.expenses)}
              </div>
              <div className="text-2xl font-bold text-red-600">
                R$ {currentPeriodStats.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`text-sm ${getComparisonColor(currentPeriodStats.expenses, previousPeriodStats.expenses, true)}`}
              >
                {getPercentageChange(currentPeriodStats.expenses, previousPeriodStats.expenses).toFixed(1)}% vs período
                anterior
              </div>
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Saldo</span>
                {getComparisonIcon(currentPeriodStats.balance, previousPeriodStats.balance)}
              </div>
              <div
                className={`text-2xl font-bold ${currentPeriodStats.balance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                R$ {currentPeriodStats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-sm ${getComparisonColor(currentPeriodStats.balance, previousPeriodStats.balance)}`}>
                {previousPeriodStats.balance !== 0
                  ? `${getPercentageChange(currentPeriodStats.balance, previousPeriodStats.balance).toFixed(1)}% vs período anterior`
                  : "Primeiro período com dados"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      <PDFPreview
        periodLabel={getPeriodLabel()}
        currentStats={currentPeriodStats}
        transactions={filteredTransactions}
      />

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart transactions={transactions} selectedYear={selectedYear} />
        <CategoryComparison
          currentTransactions={filteredTransactions}
          previousTransactions={previousPeriodTransactions}
          periodLabel={getPeriodLabel()}
        />
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Detalhada por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhuma transação encontrada para o período selecionado</p>
            ) : (
              <>
                {/* Expenses by Category */}
                <div>
                  <h4 className="font-medium text-red-600 mb-3">Despesas por Categoria</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      filteredTransactions
                        .filter((t) => t.type === "expense")
                        .reduce(
                          (acc, t) => {
                            acc[t.category] = (acc[t.category] || 0) + t.amount
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span className="font-medium">{category}</span>
                          <Badge variant="destructive">
                            R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                {/* Income by Category */}
                <div>
                  <h4 className="font-medium text-green-600 mb-3">Receitas por Categoria</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      filteredTransactions
                        .filter((t) => t.type === "income")
                        .reduce(
                          (acc, t) => {
                            acc[t.category] = (acc[t.category] || 0) + t.amount
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="font-medium">{category}</span>
                          <Badge className="bg-green-600">
                            R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
