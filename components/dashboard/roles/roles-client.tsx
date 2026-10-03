"use client"

import * as React from "react"
import { ShieldIcon, PlusIcon, PencilIcon, LayersIcon } from "lucide-react"

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
import RoleSheet from "./role-sheet"
import { RoleRecord } from "@/lib/actions/role/mutations/create-role"

interface RolesClientProps {
  initialRoles: RoleRecord[]
}

export default function RolesClient({ initialRoles }: RolesClientProps) {
  const [roles, setRoles] = React.useState<RoleRecord[]>(initialRoles)
  const [roleModal, setRoleModal] = React.useState<{
    isOpen: boolean
    data: RoleRecord | null
  }>({
    isOpen: false,
    data: null,
  })

  const handleSuccess = (savedRole: RoleRecord) => {
    setRoles((prev) => {
      const exists = prev.some((r) => r.id === savedRole.id)
      if (exists) {
        return prev.map((r) => (r.id === savedRole.id ? savedRole : r))
      }
      return [...prev, savedRole]
    })
  }

  return (
    <div className="space-y-4">
      {/* شريط الإجراءات العلوي للجدول */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold">
          Total Roles: {roles.length}
        </Badge>

        <Button
          onClick={() => setRoleModal({ isOpen: true, data: null })}
          className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
          size="sm"
        >
          <PlusIcon className="size-3.5" />
          Add Role
        </Button>
      </div>

      {/* جدول عرض الأدوار */}
      <div className="w-full overflow-hidden rounded-lg border bg-card">
        <Table className="w-full">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[180px]">Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Permissions</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length > 0 ? (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-semibold text-foreground capitalize">
                    <div className="flex items-center gap-2">
                      <ShieldIcon className="size-3.5 text-primary" />
                      <span>{role.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {role.description || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className="gap-1 px-2 py-0.5 text-xs tabular-nums"
                    >
                      <LayersIcon className="size-3 opacity-60" />
                      {role.permissions?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRoleModal({ isOpen: true, data: role })}
                      className="h-8 cursor-pointer gap-1 px-2.5 text-xs"
                    >
                      <PencilIcon className="size-3.5" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* شيت إضافة / تعديل الدور */}
      <RoleSheet
        isOpen={roleModal.isOpen}
        onOpenChange={(open) => {
          if (!open) setRoleModal({ isOpen: false, data: null })
        }}
        item={roleModal.data}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
