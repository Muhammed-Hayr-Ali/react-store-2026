"use client"

import * as React from "react"
import { toast } from "sonner"
import { UserCheckIcon, ShieldPlusIcon, XIcon, ShieldIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AssignRoleDialog from "./assign-role-dialog"
import { UserWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import { RoleRecord } from "@/lib/actions/role/mutations/create-role"
import { removeRoleFromUser } from "@/lib/actions/role/mutations/remove-user-role"

interface UsersClientProps {
  initialUsers: UserWithRoles[]
  availableRoles: RoleRecord[]
}

export default function UsersClient({
  initialUsers,
  availableRoles,
}: UsersClientProps) {
  const [users, setUsers] = React.useState<UserWithRoles[]>(initialUsers)
  const [selectedUser, setSelectedUser] = React.useState<UserWithRoles | null>(
    null
  )
  const [isAssignOpen, setIsAssignOpen] = React.useState(false)
  const [revokingMap, setRevokingMap] = React.useState<Record<string, boolean>>(
    {}
  )

  const handleRevokeRole = async (
    userId: string,
    roleId: number,
    roleName: string
  ) => {
    const key = `${userId}-${roleId}`
    setRevokingMap((prev) => ({ ...prev, [key]: true }))

    try {
      const res = await removeRoleFromUser({ userId, roleId })
      if (res.success) {
        toast.success(`Role "${roleName}" removed successfully.`)
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== userId) return u
            return {
              ...u,
              roles: u.roles.filter((r) => r.id !== roleId),
            }
          })
        )
      } else {
        toast.error(res.error || "Failed to remove role.")
      }
    } catch {
      toast.error("An unexpected error occurred.")
    } finally {
      setRevokingMap((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold">
          Platform Users: {users.length}
        </Badge>
      </div>

      <div className="w-full overflow-hidden rounded-lg border bg-card">
        <Table className="w-full">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-60">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Roles</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => {
                const fullName = [user.first_name, user.last_name]
                  .filter(Boolean)
                  .join(" ")

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground uppercase">
                          {user.first_name ? (
                            user.first_name[0]
                          ) : (
                            <UserCheckIcon className="size-3.5" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {fullName || "Anonymous User"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {user.email || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => {
                            const isRevoking = Boolean(
                              revokingMap[`${user.id}-${role.id}`]
                            )
                            return (
                              <Badge
                                key={role.id}
                                variant="secondary"
                                className="gap-1 py-0.5 ps-2 pe-1 text-[11px] font-semibold uppercase"
                              >
                                <ShieldIcon className="size-3 text-primary opacity-70" />
                                <span>{role.name}</span>
                                <button
                                  type="button"
                                  disabled={isRevoking}
                                  onClick={() =>
                                    handleRevokeRole(
                                      user.id,
                                      role.id,
                                      role.name
                                    )
                                  }
                                  className="ms-0.5 cursor-pointer rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title={`Remove ${role.name}`}
                                >
                                  <XIcon className="size-3" />
                                </button>
                              </Badge>
                            )
                          })
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            No roles assigned
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsAssignOpen(true)
                        }}
                        className="h-7 cursor-pointer gap-1 px-2.5 text-xs"
                      >
                        <ShieldPlusIcon className="size-3 text-primary" />
                        Assign Role
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AssignRoleDialog
        isOpen={isAssignOpen}
        onOpenChange={(open) => {
          setIsAssignOpen(open)
          if (!open) setSelectedUser(null)
        }}
        user={selectedUser}
        availableRoles={availableRoles}
        onSuccess={(userId, assignedRole) => {
          setUsers((prev) =>
            prev.map((u) => {
              if (u.id !== userId) return u
              return {
                ...u,
                roles: [...u.roles, assignedRole],
              }
            })
          )
        }}
      />
    </div>
  )
}
