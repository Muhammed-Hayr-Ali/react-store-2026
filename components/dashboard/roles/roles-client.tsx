"use client"

import * as React from "react"
import {
  ShieldIcon,
  PlusIcon,
  PencilIcon,
  LayersIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  const [searchQuery, setSearchQuery] = React.useState("")
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

  const filteredRoles = React.useMemo(() => {
    if (!searchQuery.trim()) return roles
    const q = searchQuery.toLowerCase().trim()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
    )
  }, [roles, searchQuery])

  return (
    <div className="flex w-full flex-col justify-start gap-4">
      {/* Controls Bar الموحد */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 ps-8 pe-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-e-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-9 px-3 text-xs font-semibold">
            Total Roles: {roles.length}
          </Badge>

          <Button
            onClick={() => setRoleModal({ isOpen: true, data: null })}
            className="h-9 cursor-pointer gap-1.5 text-xs font-medium"
            size="sm"
          >
            <PlusIcon className="size-3.5" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[180px] text-xs font-medium text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="text-center text-xs font-medium text-muted-foreground">
                  Permissions
                </TableHead>
                <TableHead className="text-end text-xs font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => (
                  <TableRow
                    key={role.id}
                    className="transition-colors hover:bg-muted/20"
                  >
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
                        onClick={() =>
                          setRoleModal({ isOpen: true, data: role })
                        }
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
                    No roles found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Role Sheet */}
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
