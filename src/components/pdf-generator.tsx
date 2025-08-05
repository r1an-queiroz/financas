"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface ReportData {
  periodLabel: string
  currentStats: {
    income: number
    expenses: number
    balance: number
    transactionCount: number
  }
  previousStats: {
    income: number
    expenses: number
    balance: number
  }
  transactions: Array<{
    id: string
    type: "income" | "expense"
    amount: number
    category: string
    description: string
    date: string
  }>
  periodType: string
  selectedMonth: number
  selectedYear: number
}

export class PDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number

  constructor() {
    this.doc = new jsPDF("p", "mm", "a4")
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  private addHeader(title: string) {
    // Logo/Header background
    this.doc.setFillColor(59, 130, 246) // Blue
    this.doc.rect(0, 0, this.pageWidth, 30, "F")

    // Title
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Relatório Financeiro", this.margin, 15)

    // Subtitle
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(title, this.margin, 22)

    // Date
    const now = new Date()
    this.doc.text(
      `Gerado em: ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR")}`,
      this.pageWidth - this.margin - 50,
      22,
    )

    this.currentY = 40
    this.doc.setTextColor(0, 0, 0)
  }

  private addFooter(pageNumber: number) {
    this.doc.setFontSize(8)
    this.doc.setTextColor(128, 128, 128)
    this.doc.text(`Página ${pageNumber}`, this.pageWidth / 2, this.pageHeight - 10, { align: "center" })
    this.doc.text("Gerenciador Financeiro - Relatório Confidencial", this.margin, this.pageHeight - 10)
  }

  private checkPageBreak(height: number) {
    if (this.currentY + height > this.pageHeight - 30) {
      this.doc.addPage()
      this.currentY = this.margin
      return true
    }
    return false
  }

  private addSection(title: string) {
    this.checkPageBreak(15)
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(59, 130, 246)
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 10

    // Add underline
    this.doc.setDrawColor(59, 130, 246)
    this.doc.line(this.margin, this.currentY - 2, this.margin + 60, this.currentY - 2)
    this.currentY += 5
    this.doc.setTextColor(0, 0, 0)
  }

  private addSummaryCards(currentStats: ReportData["currentStats"], previousStats: ReportData["previousStats"]) {
    this.addSection("Resumo Executivo")

    const cardWidth = (this.pageWidth - 2 * this.margin - 20) / 3
    const cardHeight = 35

    // Income Card
    this.doc.setFillColor(220, 252, 231) // Light green
    this.doc.rect(this.margin, this.currentY, cardWidth, cardHeight, "F")
    this.doc.setDrawColor(34, 197, 94) // Green border
    this.doc.rect(this.margin, this.currentY, cardWidth, cardHeight)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(21, 128, 61)
    this.doc.text("RECEITAS", this.margin + 5, this.currentY + 8)

    this.doc.setFontSize(16)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text(
      `R$ ${currentStats.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      this.margin + 5,
      this.currentY + 18,
    )

    const incomeChange =
      previousStats.income > 0 ? ((currentStats.income - previousStats.income) / previousStats.income) * 100 : 0
    this.doc.setFontSize(8)
    this.doc.setTextColor(incomeChange >= 0 ? 21 : 185, incomeChange >= 0 ? 128 : 28, incomeChange >= 0 ? 61 : 28)
    this.doc.text(
      `${incomeChange >= 0 ? "+" : ""}${incomeChange.toFixed(1)}% vs anterior`,
      this.margin + 5,
      this.currentY + 28,
    )

    // Expenses Card
    const expenseX = this.margin + cardWidth + 10
    this.doc.setFillColor(254, 226, 226) // Light red
    this.doc.rect(expenseX, this.currentY, cardWidth, cardHeight, "F")
    this.doc.setDrawColor(239, 68, 68) // Red border
    this.doc.rect(expenseX, this.currentY, cardWidth, cardHeight)

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(185, 28, 28)
    this.doc.text("DESPESAS", expenseX + 5, this.currentY + 8)

    this.doc.setFontSize(16)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text(
      `R$ ${currentStats.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      expenseX + 5,
      this.currentY + 18,
    )

    const expenseChange =
      previousStats.expenses > 0 ? ((currentStats.expenses - previousStats.expenses) / previousStats.expenses) * 100 : 0
    this.doc.setFontSize(8)
    this.doc.setTextColor(expenseChange <= 0 ? 21 : 185, expenseChange <= 0 ? 128 : 28, expenseChange <= 0 ? 61 : 28)
    this.doc.text(
      `${expenseChange >= 0 ? "+" : ""}${expenseChange.toFixed(1)}% vs anterior`,
      expenseX + 5,
      this.currentY + 28,
    )

    // Balance Card
    const balanceX = this.margin + 2 * cardWidth + 20
    const balanceColor = currentStats.balance >= 0 ? [220, 252, 231] : [254, 226, 226]
    const balanceBorder = currentStats.balance >= 0 ? [34, 197, 94] : [239, 68, 68]



    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(
      currentStats.balance >= 0 ? 21 : 185,
      currentStats.balance >= 0 ? 128 : 28,
      currentStats.balance >= 0 ? 61 : 28,
    )
    this.doc.text("SALDO", balanceX + 5, this.currentY + 8)

    this.doc.setFontSize(16)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text(
      `R$ ${currentStats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      balanceX + 5,
      this.currentY + 18,
    )

    this.doc.setFontSize(8)
    this.doc.setTextColor(128, 128, 128)
    this.doc.text(`${currentStats.transactionCount} transações`, balanceX + 5, this.currentY + 28)

    this.currentY += cardHeight + 15
  }

  private addTransactionTable(transactions: ReportData["transactions"]) {
    this.addSection("Detalhamento de Transações")

    if (transactions.length === 0) {
      this.doc.setFontSize(10)
      this.doc.setTextColor(128, 128, 128)
      this.doc.text("Nenhuma transação encontrada para o período selecionado.", this.margin, this.currentY)
      this.currentY += 15
      return
    }

    // Table headers
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"]
    const colWidths = [25, 60, 35, 25, 25]
    const rowHeight = 8

    // Header background
    this.doc.setFillColor(243, 244, 246)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, rowHeight, "F")

    // Header text
    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(0, 0, 0)

    let currentX = this.margin + 2
    headers.forEach((header, index) => {
      this.doc.text(header, currentX, this.currentY + 5)
      currentX += colWidths[index]
    })

    this.currentY += rowHeight

    // Table rows
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(8)

    transactions.forEach((transaction, index) => {
      this.checkPageBreak(rowHeight)

      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(249, 250, 251)
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, rowHeight, "F")
      }

      currentX = this.margin + 2
      const rowData = [
        new Date(transaction.date).toLocaleDateString("pt-BR"),
        transaction.description.length > 25
          ? transaction.description.substring(0, 25) + "..."
          : transaction.description,
        transaction.category,
        transaction.type === "income" ? "Receita" : "Despesa",
        `R$ ${transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      ]

      rowData.forEach((data, colIndex) => {
        if (colIndex === 4) {
          // Amount column
          this.doc.setTextColor(
            transaction.type === "income" ? 21 : 185,
            transaction.type === "income" ? 128 : 28,
            transaction.type === "income" ? 61 : 28,
          )
        } else {
          this.doc.setTextColor(0, 0, 0)
        }
        this.doc.text(data, currentX, this.currentY + 5)
        currentX += colWidths[colIndex]
      })

      this.currentY += rowHeight
    })

    this.currentY += 10
  }

  private addCategoryBreakdown(transactions: ReportData["transactions"]) {
    this.addSection("Análise por Categoria")

    const expenses = transactions.filter((t) => t.type === "expense")
    const income = transactions.filter((t) => t.type === "income")

    if (expenses.length === 0 && income.length === 0) {
      this.doc.setFontSize(10)
      this.doc.setTextColor(128, 128, 128)
      this.doc.text("Nenhuma transação para análise.", this.margin, this.currentY)
      this.currentY += 15
      return
    }

    // Expenses by category
    if (expenses.length > 0) {
      this.doc.setFontSize(12)
      this.doc.setFont("helvetica", "bold")
      this.doc.setTextColor(185, 28, 28)
      this.doc.text("Despesas por Categoria", this.margin, this.currentY)
      this.currentY += 10

      const expensesByCategory = expenses.reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

      const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)

      Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, amount]) => {
          this.checkPageBreak(8)
          const percentage = ((amount / totalExpenses) * 100).toFixed(1)

          this.doc.setFontSize(9)
          this.doc.setFont("helvetica", "normal")
          this.doc.setTextColor(0, 0, 0)
          this.doc.text(`${category}:`, this.margin + 5, this.currentY)
          this.doc.text(
            `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${percentage}%)`,
            this.margin + 80,
            this.currentY,
          )

          // Progress bar
          const barWidth = 60
          const fillWidth = (amount / totalExpenses) * barWidth
          this.doc.setDrawColor(229, 231, 235)
          this.doc.rect(this.margin + 5, this.currentY + 2, barWidth, 3)
          this.doc.setFillColor(239, 68, 68)
          this.doc.rect(this.margin + 5, this.currentY + 2, fillWidth, 3, "F")

          this.currentY += 8
        })

      this.currentY += 10
    }

    // Income by category
    if (income.length > 0) {
      this.doc.setFontSize(12)
      this.doc.setFont("helvetica", "bold")
      this.doc.setTextColor(21, 128, 61)
      this.doc.text("Receitas por Categoria", this.margin, this.currentY)
      this.currentY += 10

      const incomeByCategory = income.reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

      const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0)

      Object.entries(incomeByCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, amount]) => {
          this.checkPageBreak(8)
          const percentage = ((amount / totalIncome) * 100).toFixed(1)

          this.doc.setFontSize(9)
          this.doc.setFont("helvetica", "normal")
          this.doc.setTextColor(0, 0, 0)
          this.doc.text(`${category}:`, this.margin + 5, this.currentY)
          this.doc.text(
            `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${percentage}%)`,
            this.margin + 80,
            this.currentY,
          )

          // Progress bar
          const barWidth = 60
          const fillWidth = (amount / totalIncome) * barWidth
          this.doc.setDrawColor(229, 231, 235)
          this.doc.rect(this.margin + 5, this.currentY + 2, barWidth, 3)
          this.doc.setFillColor(34, 197, 94)
          this.doc.rect(this.margin + 5, this.currentY + 2, fillWidth, 3, "F")

          this.currentY += 8
        })
    }
  }

  private async captureChart(elementId: string): Promise<string | null> {
    try {
      const element = document.getElementById(elementId)
      if (!element) return null

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      })

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Error capturing chart:", error)
      return null
    }
  }

  public async generateReport(data: ReportData) {
    // Page 1
    this.addHeader(data.periodLabel)
    this.addSummaryCards(data.currentStats, data.previousStats)

    // Add some insights
    this.addSection("Insights do Período")
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.setTextColor(0, 0, 0)

    const insights = []

    if (data.currentStats.balance > 0) {
      insights.push(
        `✓ Saldo positivo de R$ ${data.currentStats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      )
    } else {
      insights.push(
        `⚠ Saldo negativo de R$ ${Math.abs(data.currentStats.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      )
    }

    const savingsRate =
      data.currentStats.income > 0
        ? ((data.currentStats.income - data.currentStats.expenses) / data.currentStats.income) * 100
        : 0
    insights.push(`📊 Taxa de poupança: ${savingsRate.toFixed(1)}%`)

    if (data.previousStats.expenses > 0) {
      const expenseChange =
        ((data.currentStats.expenses - data.previousStats.expenses) / data.previousStats.expenses) * 100
      if (expenseChange > 10) {
        insights.push(`📈 Despesas aumentaram ${expenseChange.toFixed(1)}% em relação ao período anterior`)
      } else if (expenseChange < -10) {
        insights.push(`📉 Despesas reduziram ${Math.abs(expenseChange).toFixed(1)}% em relação ao período anterior`)
      }
    }

    insights.push(`📋 Total de ${data.currentStats.transactionCount} transações registradas`)

    insights.forEach((insight) => {
      this.checkPageBreak(8)
      this.doc.text(`• ${insight}`, this.margin + 5, this.currentY)
      this.currentY += 8
    })

    this.currentY += 10

    // Page 2 - Transactions
    this.doc.addPage()
    this.currentY = this.margin
    this.addTransactionTable(data.transactions)

    // Page 3 - Category Analysis
    this.doc.addPage()
    this.currentY = this.margin
    this.addCategoryBreakdown(data.transactions)



    // Save the PDF
    const fileName = `relatorio-financeiro-${data.periodLabel.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
    this.doc.save(fileName)
  }
}
