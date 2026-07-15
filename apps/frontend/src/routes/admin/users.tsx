import { useEffect, useState, useCallback } from 'react'
import { authClient } from '@/lib/auth'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Trash2, ShieldCheck, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserRow {
  id: string
  name: string
  email: string
  role?: string | null
  banned?: boolean | null
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'PETUGAS_LOKET' as string,
}

export function UsersAdminPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await authClient.admin.listUsers({
      query: { limit: 100 },
    })
    if (error) {
      toast.error('Gagal memuat pengguna')
    } else if (data) {
      setUsers(data.users as UserRow[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
const { error } = await authClient.admin.createUser({
      email: form.email,
      password: form.password,
      name: form.name,
      role: form.role as 'SUPER_ADMIN' | 'PETUGAS_LOKET' | 'PETUGAS_KEGIATAN',
    })
    setSaving(false)
    if (error) {
      toast.error(error.message ?? 'Gagal membuat pengguna')
      return
    }
    toast.success('Pengguna dibuat')
    setDialogOpen(false)
    setForm(emptyForm)
    fetch()
  }

  const handleSetRole = async (userId: string, role: string) => {
    const { error } = await authClient.admin.setRole({
      userId,
      role: role as 'SUPER_ADMIN' | 'PETUGAS_LOKET' | 'PETUGAS_KEGIATAN',
    })
    if (error) {
      toast.error(error.message ?? 'Gagal mengubah role')
      return
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u)),
    )
    toast.success('Role diperbarui')
  }

  const handleDelete = async (userId: string) => {
    const { error } = await authClient.admin.removeUser({ userId })
    if (error) {
      toast.error(error.message ?? 'Gagal menghapus pengguna')
      return
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    toast.success('Pengguna dihapus')
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengguna</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola akun petugas loket dan admin
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4" />
          Tambah
        </Button>
      </div>

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-32">Role</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              : users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.role === 'SUPER_ADMIN' ? (
                        <Badge variant="destructive">
                          <ShieldCheck className="mr-1 size-3" />
                          Super Admin
                        </Badge>
                      ) : user.role === 'PETUGAS_KEGIATAN' ? (
                        <Badge variant="secondary">
                          <Calendar className="mr-1 size-3" />
                          Petugas Kegiatan
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <User className="mr-1 size-3" />
                          Petugas
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role !== 'SUPER_ADMIN' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleSetRole(user.id, 'SUPER_ADMIN')
                              }
                            >
                              <ShieldCheck className="size-4" />
                              Jadikan Super Admin
                            </DropdownMenuItem>
                          )}
                          {user.role !== 'PETUGAS_KEGIATAN' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleSetRole(user.id, 'PETUGAS_KEGIATAN')
                              }
                            >
                              <Calendar className="size-4" />
                              Jadikan Petugas Kegiatan
                            </DropdownMenuItem>
                          )}
                          {user.role !== 'PETUGAS_LOKET' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleSetRole(user.id, 'PETUGAS_LOKET')
                              }
                            >
                              <User className="size-4" />
                              Jadikan Petugas
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="size-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna</DialogTitle>
            <DialogDescription>
              Buat akun petugas loket atau admin baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PETUGAS_LOKET">Petugas Loket</SelectItem>
                  <SelectItem value="PETUGAS_KEGIATAN">Petugas Kegiatan</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
