"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Camera, Plus, X } from "lucide-react"
import type { Contact, GroupChat } from "@/types/chat"
import type { User } from "@/types/auth"

interface GroupCreatorProps {
  contacts: Contact[]
  currentUser: User
  onCreateGroup: (group: GroupChat) => void
  onClose: () => void
}

export function GroupCreator({ contacts, currentUser, onCreateGroup, onClose }: GroupCreatorProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar: "/placeholder.svg?height=40&width=40",
  })
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleMemberToggle = (contactId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }

  const handleAvatarChange = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData({
            ...formData,
            avatar: e.target?.result as string,
          })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || selectedMembers.length === 0) return

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newGroup: GroupChat = {
        id: `group_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        avatar: formData.avatar,
        members: [currentUser.id, ...selectedMembers],
        admins: [currentUser.id],
        createdBy: currentUser.id,
        createdAt: new Date(),
      }

      onCreateGroup(newGroup)
    } catch (error) {
      console.error("Failed to create group:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create Group
              </CardTitle>
              <CardDescription>Create a new group chat</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Group Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Group" />
                  <AvatarFallback className="bg-blue-500 text-white">
                    <Users className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAvatarChange}
                  className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-1"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Group Name */}
            <Input
              type="text"
              name="name"
              placeholder="Group Name"
              value={formData.name}
              onChange={handleInputChange}
              className="border-blue-200 focus:border-blue-400"
              required
            />

            {/* Group Description */}
            <Textarea
              name="description"
              placeholder="Group Description (optional)"
              value={formData.description}
              onChange={handleInputChange}
              className="border-blue-200 focus:border-blue-400 resize-none"
              rows={2}
            />

            {/* Member Selection */}
            <div>
              <h4 className="font-medium mb-3">Add Members ({selectedMembers.length} selected)</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {contacts
                  .filter((contact) => !contact.isGroup)
                  .map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded">
                      <Checkbox
                        id={contact.id}
                        checked={selectedMembers.includes(contact.id)}
                        onCheckedChange={() => handleMemberToggle(contact.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.status}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !formData.name.trim() || selectedMembers.length === 0}
              >
                {isLoading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
