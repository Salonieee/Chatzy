"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import type { User as UserType } from "@/types/auth"

interface AuthPageProps {
  onLogin: (user: UserType) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const generateAvatar = (name: string) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500"]
    const colorIndex = name.length % colors.length
    return colors[colorIndex]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (isLogin) {
        // Login logic
        const users = JSON.parse(localStorage.getItem("chatzy-users") || "[]")
        const user = users.find((u: UserType) => u.email === formData.email)

        if (!user) {
          setError("User not found. Please sign up first.")
          return
        }

        // In a real app, you'd verify the password here
        const loggedInUser: UserType = {
          ...user,
          isOnline: true,
          lastSeen: new Date(),
        }

        // Update user status in localStorage
        const updatedUsers = users.map((u: UserType) => (u.id === user.id ? loggedInUser : u))
        localStorage.setItem("chatzy-users", JSON.stringify(updatedUsers))
        localStorage.setItem("chatzy-current-user", JSON.stringify(loggedInUser))

        onLogin(loggedInUser)
      } else {
        // Signup logic
        if (!formData.name || !formData.email || !formData.password) {
          setError("Please fill in all fields")
          return
        }

        const users = JSON.parse(localStorage.getItem("chatzy-users") || "[]")
        const existingUser = users.find((u: UserType) => u.email === formData.email)

        if (existingUser) {
          setError("User already exists. Please login instead.")
          return
        }

        const newUser: UserType = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          avatar: `/placeholder.svg?height=40&width=40`,
          isOnline: true,
          lastSeen: new Date(),
        }

        users.push(newUser)
        localStorage.setItem("chatzy-users", JSON.stringify(users))
        localStorage.setItem("chatzy-current-user", JSON.stringify(newUser))

        onLogin(newUser)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-600 p-2 rounded-full">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-blue-600">Chatzy</h1>
          </div>
          <CardTitle className="text-xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to continue chatting" : "Join Chatzy to start messaging"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 border-blue-200 focus:border-blue-400"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 border-blue-200 focus:border-blue-400"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setFormData({ name: "", email: "", password: "" })
                }}
                className="text-blue-600 hover:text-blue-700 p-0 ml-1"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
