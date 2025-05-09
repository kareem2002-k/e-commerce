'use client'

import { useState } from "react"
import { useUsers, User } from "@/hooks/useUsers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Trash2, UserCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/AuthContext"
export default function UsersPage() {
  const { users, loading, error, promoteToAdmin, deleteUser } = useUsers()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  const { user: currentUser } = useAuth();
  const handlePromoteUser = async () => {
    if (!selectedUser) return
    
    try {
      setProcessingAction(true)
      await promoteToAdmin(selectedUser.id)
      setIsPromoteDialogOpen(false)
    } catch (error) {
      console.error("Error promoting user:", error)
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      setProcessingAction(true)
      await deleteUser(selectedUser.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setProcessingAction(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage user accounts and permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage all user accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-4">
              {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                            {user.name || "Unnamed User"}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline">Customer</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!user.isAdmin && (
                              <ConfirmDialog 
                                open={isPromoteDialogOpen}
                                onOpenChange={setIsPromoteDialogOpen}
                                title="Promote to Admin"
                                description={`Are you sure you want to promote ${user.name || user.email} to admin? They will have full access to all admin features.`}
                                onConfirm={handlePromoteUser}
                                confirmText={processingAction ? "Processing..." : "Promote"}
                                variant="default"
                              >
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex items-center gap-1"
                                    onClick={() => setSelectedUser(user)}
                                    disabled={processingAction}
                                  >
                                    <Shield className="h-4 w-4" />
                                    <span>Promote</span>
                                  </Button>
                                </AlertDialogTrigger>
                              </ConfirmDialog>
                            )}
                            
                            <ConfirmDialog 
                              open={isDeleteDialogOpen}
                              onOpenChange={setIsDeleteDialogOpen}
                              title="Delete User"
                              description={`Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`}
                              onConfirm={handleDeleteUser}
                              confirmText={processingAction ? "Processing..." : "Delete"}
                              variant="destructive"
                            >
                              {user.email !== currentUser?.email && (   
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-destructive border-destructive hover:bg-destructive/10 flex items-center gap-1"
                                    onClick={() => setSelectedUser(user)}
                                    disabled={processingAction}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                              )}
                            </ConfirmDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 