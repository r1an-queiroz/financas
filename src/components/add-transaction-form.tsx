"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Transaction } from "@/app/page"
import { Plus } from "lucide-react"

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void
}

const incomeCategories = ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"]

const expenseCategories = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Entretenimento",
  "Roupas",
  "Tecnologia",
  "Outros",
]

export function AddTransactionForm({ onAddTransaction }: AddTransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !description) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    onAddTransaction({
      type,
      amount: Number.parseFloat(amount),
      category,
      description,
      date,
    })

    // Reset form
    setAmount("")
    setCategory("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
  }

  const categories = type === "income" ? incomeCategories : expenseCategories

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>Tipo de Transação</Label>
        <RadioGroup value={type} onValueChange={(value) => setType(value as "income" | "expense")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income" className="text-green-600 font-medium">
              Receita
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense" className="text-red-600 font-medium">
              Despesa
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          placeholder="Descreva a transação..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Transação
      </Button>
    </form>
  )
}
