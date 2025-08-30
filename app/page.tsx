"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, CheckCircle2, Circle } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  category: "Work" | "Personal" | "School"
  completed: boolean
  createdAt: Date
}

const CATEGORIES = ["Work", "Personal", "School"] as const

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Personal" as Task["category"],
  })

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("todo-tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
      }))
      setTasks(parsedTasks)
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      completed: false,
      createdAt: new Date(),
    }

    setTasks((prev) => [...prev, task])
    setNewTask({ title: "", description: "", category: "Personal" })
    setIsAddDialogOpen(false)
  }

  const updateTask = () => {
    if (!editingTask || !editingTask.title.trim()) return

    setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? editingTask : task)))
    setEditingTask(null)
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const toggleComplete = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const filteredTasks = tasks.filter((task) => selectedCategory === "All" || task.category === selectedCategory)

  const getCategoryColor = (category: Task["category"]) => {
    switch (category) {
      case "Work":
        return "bg-primary text-primary-foreground"
      case "Personal":
        return "bg-secondary text-secondary-foreground"
      case "School":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const byCategory = CATEGORIES.reduce(
      (acc, cat) => {
        acc[cat] = tasks.filter((t) => t.category === cat).length
        return acc
      },
      {} as Record<string, number>,
    )

    return { total, completed, byCategory }
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-sidebar border-r border-sidebar-border p-4">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-sidebar-foreground mb-1">TaskFlow</h1>
            <p className="text-xs text-muted-foreground">Organize your tasks</p>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-medium text-sidebar-foreground mb-2 uppercase tracking-wide">Categories</h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === "All" ? "default" : "ghost"}
                  className="w-full justify-start h-8 text-sm"
                  onClick={() => setSelectedCategory("All")}
                >
                  All Tasks
                  <Badge variant="secondary" className="ml-auto text-xs h-5">
                    {stats.total}
                  </Badge>
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start h-8 text-sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                    <Badge variant="secondary" className="ml-auto text-xs h-5">
                      {stats.byCategory[category] || 0}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Progress Section */}
            <div className="pt-3 border-t border-sidebar-border">
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>Progress</span>
                  <span>
                    {stats.completed}/{stats.total}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCategory === "All" ? "All Tasks" : selectedCategory}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
                </p>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter task title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter task description..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTask.category}
                        onValueChange={(value) =>
                          setNewTask((prev) => ({ ...prev, category: value as Task["category"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={addTask} className="flex-1">
                        Add Task
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tasks Grid */}
            <div className="grid gap-3">
              {filteredTasks.length === 0 ? (
                <Card className="p-6 text-center">
                  <div className="text-muted-foreground">
                    <Circle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <h3 className="text-base font-medium mb-1">No tasks yet</h3>
                    <p className="text-sm">Get started by adding your first task!</p>
                  </div>
                </Card>
              ) : (
                filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`transition-all duration-200 hover:shadow-sm ${task.completed ? "opacity-75" : ""}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-5 w-5 mt-0.5"
                          onClick={() => toggleComplete(task.id)}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                            >
                              {task.title}
                            </h3>
                            <Badge className={`${getCategoryColor(task.category)} text-xs h-5`}>{task.category}</Badge>
                          </div>
                          {task.description && (
                            <p
                              className={`text-xs ${task.completed ? "line-through text-muted-foreground" : "text-muted-foreground"} mb-1`}
                            >
                              {task.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground opacity-75">
                            {task.createdAt.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <Dialog
                            open={editingTask?.id === task.id}
                            onOpenChange={(open) => !open && setEditingTask(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingTask({ ...task })}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                              </DialogHeader>
                              {editingTask && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input
                                      id="edit-title"
                                      value={editingTask.title}
                                      onChange={(e) =>
                                        setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea
                                      id="edit-description"
                                      value={editingTask.description}
                                      onChange={(e) =>
                                        setEditingTask((prev) =>
                                          prev ? { ...prev, description: e.target.value } : null,
                                        )
                                      }
                                      rows={3}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select
                                      value={editingTask.category}
                                      onValueChange={(value) =>
                                        setEditingTask((prev) =>
                                          prev ? { ...prev, category: value as Task["category"] } : null,
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {CATEGORIES.map((category) => (
                                          <SelectItem key={category} value={category}>
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button onClick={updateTask} className="flex-1">
                                      Update Task
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditingTask(null)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
