"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Edit,
  Plus,
  DollarSign,
  Target,
  CreditCard,
} from "lucide-react";

interface FinanceItem {
  id: string;
  title: string;
  amount: number;
  category: "divida" | "meta";
  description?: string;
}

type FilterType = "all" | "divida" | "meta";

export default function FinanceApp() {
  const [salary, setSalary] = useState(5000);
  const [items, setItems] = useState<FinanceItem[]>([
    {
      id: "1",
      title: "Cartão de Crédito",
      amount: 800,
      category: "divida",
      description: "Fatura mensal",
    },
    {
      id: "2",
      title: "Financiamento Carro",
      amount: 450,
      category: "divida",
      description: "24x restantes",
    },
    {
      id: "3",
      title: "Reserva de Emergência",
      amount: 1000,
      category: "meta",
      description: "Meta mensal",
    },
    {
      id: "4",
      title: "Viagem",
      amount: 300,
      category: "meta",
      description: "Férias de fim de ano",
    },
  ]);

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [tempSalary, setTempSalary] = useState(salary.toString());
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    amount: "",
    category: "divida" as "divida" | "meta",
    description: "",
  });

  const [filter, setFilter] = useState<FilterType>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // ===== Helper para "paginar" em blocos de 3 por slide =====
  const PAGE_SIZE = 3;
  const chunk = <T,>(arr: T[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  const totalDebts = items
    .filter((item) => item.category === "divida")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalGoals = items
    .filter((item) => item.category === "meta")
    .reduce((sum, item) => sum + item.amount, 0);
  const remaining = salary - totalDebts - totalGoals;

  const handleSalarySave = () => {
    setSalary(Number(tempSalary) || 0);
    setIsEditingSalary(false);
  };

  const handleAddItem = () => {
    if (newItem.title && newItem.amount) {
      const item: FinanceItem = {
        id: Date.now().toString(),
        title: newItem.title,
        amount: Number(newItem.amount),
        category: newItem.category,
        description: newItem.description,
      };

      setItems([...items, item]);
      setNewItem({
        title: "",
        amount: "",
        category: "divida",
        description: "",
      });
      setIsAddingItem(false);
    }
  };

  const handleEditItem = (item: FinanceItem) => {
    setNewItem({
      title: item.title,
      amount: item.amount.toString(),
      category: item.category,
      description: item.description || "",
    });
    setEditingItem(item);
  };

  const handleUpdateItem = () => {
    if (editingItem && newItem.title && newItem.amount) {
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: newItem.title,
                amount: Number(newItem.amount),
                category: newItem.category,
                description: newItem.description,
              }
            : item
        )
      );
      setEditingItem(null);
      setNewItem({
        title: "",
        amount: "",
        category: "divida",
        description: "",
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  // Páginas para o carrossel: cada slide tem até 3 itens
  const pages = chunk(filteredItems, PAGE_SIZE);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // agora o limite é baseado em "pages"
    if (isLeftSwipe && currentIndex < pages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter, items.length]);

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      <div className="space-y-6">
        {/* Salary Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <DollarSign className="h-5 w-5" />
              Salário do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingSalary ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={tempSalary}
                  onChange={(e) => setTempSalary(e.target.value)}
                  className="flex-1"
                  placeholder="Digite o salário"
                />
                <Button onClick={handleSalarySave} size="sm">
                  Salvar
                </Button>
                <Button
                  onClick={() => setIsEditingSalary(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {salary.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor mensal</p>
                </div>
                <Button
                  onClick={() => {
                    setIsEditingSalary(true);
                    setTempSalary(salary.toString());
                  }}
                  variant="default"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Dívidas</p>
                <p className="text-lg font-semibold text-destructive">
                  R$ {totalDebts.toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metas</p>
                <p className="text-lg font-semibold text-secondary">
                  R$ {totalGoals.toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Restante</p>
                <p
                  className={`text-lg font-semibold ${
                    remaining >= 0 ? "text-green-500" : "text-destructive"
                  }`}
                >
                  R$ {remaining.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Financeiro
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border p-1 bg-muted/50">
                  <Button
                    variant={filter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="h-7 px-2 text-xs"
                  >
                    Tudo
                  </Button>
                  <Button
                    variant={filter === "divida" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("divida")}
                    className="h-7 px-2 text-xs"
                  >
                    Dívidas
                  </Button>
                  <Button
                    variant={filter === "meta" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("meta")}
                    className="h-7 px-2 text-xs"
                  >
                    Metas
                  </Button>
                </div>
                <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90vw] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          value={newItem.title}
                          onChange={(e) =>
                            setNewItem({ ...newItem, title: e.target.value })
                          }
                          placeholder="Nome do item"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Valor</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newItem.amount}
                          onChange={(e) =>
                            setNewItem({ ...newItem, amount: e.target.value })
                          }
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value: "divida" | "meta") =>
                            setNewItem({ ...newItem, category: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="divida">Dívida</SelectItem>
                            <SelectItem value="meta">Meta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Descrição (opcional)
                        </Label>
                        <Input
                          id="description"
                          value={newItem.description}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              description: e.target.value,
                            })
                          }
                          placeholder="Detalhes adicionais"
                        />
                      </div>
                      <Button onClick={handleAddItem} className="w-full">
                        Adicionar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {filter === "all"
                  ? "Nenhum item cadastrado"
                  : filter === "divida"
                  ? "Nenhuma dívida cadastrada"
                  : "Nenhuma meta cadastrada"}
              </p>
            ) : (
              <div className="space-y-4">
                {/* Swipe container */}
                <div
                  ref={containerRef}
                  className="relative overflow-hidden"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                  >
                    {pages.map((page, pageIdx) => (
                      <div key={pageIdx} className="w-full flex-shrink-0 px-1">
                        <div className="space-y-3">
                          {page.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{item.title}</h4>
                                  <Badge
                                    variant={
                                      item.category === "divida"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {item.category === "divida" ? (
                                      <>
                                        <CreditCard className="h-3 w-3 mr-1" />
                                        Dívida
                                      </>
                                    ) : (
                                      <>
                                        <Target className="h-3 w-3 mr-1" />
                                        Meta
                                      </>
                                    )}
                                  </Badge>
                                </div>
                                <p className="text-lg font-semibold text-primary">
                                  R$ {item.amount.toLocaleString("pt-BR")}
                                </p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Dialog
                                  open={editingItem?.id === item.id}
                                  onOpenChange={(open) =>
                                    !open && setEditingItem(null)
                                  }
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="w-[90vw] max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Editar Item</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-title">
                                          Título
                                        </Label>
                                        <Input
                                          id="edit-title"
                                          value={newItem.title}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              title: e.target.value,
                                            })
                                          }
                                          placeholder="Nome do item"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-amount">
                                          Valor
                                        </Label>
                                        <Input
                                          id="edit-amount"
                                          type="number"
                                          value={newItem.amount}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              amount: e.target.value,
                                            })
                                          }
                                          placeholder="0,00"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-category">
                                          Categoria
                                        </Label>
                                        <Select
                                          value={newItem.category}
                                          onValueChange={(
                                            value: "divida" | "meta"
                                          ) =>
                                            setNewItem({
                                              ...newItem,
                                              category: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="divida">
                                              Dívida
                                            </SelectItem>
                                            <SelectItem value="meta">
                                              Meta
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-description">
                                          Descrição (opcional)
                                        </Label>
                                        <Input
                                          id="edit-description"
                                          value={newItem.description}
                                          onChange={(e) =>
                                            setNewItem({
                                              ...newItem,
                                              description: e.target.value,
                                            })
                                          }
                                          placeholder="Detalhes adicionais"
                                        />
                                      </div>
                                      <Button
                                        onClick={handleUpdateItem}
                                        className="w-full"
                                      >
                                        Atualizar
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation indicators (agora por página) */}
                {pages.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {pages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Swipe instruction */}
                {pages.length > 1 && (
                  <p className="text-center text-xs text-muted-foreground">
                    Deslize para navegar • {currentIndex + 1} de {pages.length}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
