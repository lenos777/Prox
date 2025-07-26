import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DatabaseContent() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to get JWT from cookies
  function getJwt() {
    return document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
  }

  useEffect(() => {
    setLoading(true);
    setError("");
    const jwt = getJwt();
    // Fetch all in parallel
    Promise.all([
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${jwt}` } })
        .then(r => r.json()),
      fetch("/api/admin/courses", { headers: { Authorization: `Bearer ${jwt}` } })
        .then(r => r.json()),
      fetch("/api/admin/payments", { headers: { Authorization: `Bearer ${jwt}` } })
        .then(r => r.json()),
    ]).then(([usersRes, coursesRes, paymentsRes]) => {
      if (usersRes.success) {
        setUsers(usersRes.users || []);
      } else {
        setError(usersRes.message || "Foydalanuvchilarni yuklashda xatolik");
      }
      if (coursesRes.success) {
        setCourses(coursesRes.courses || []);
      } else {
        setError(coursesRes.message || "Kurslarni yuklashda xatolik");
      }
      if (paymentsRes.success) {
        setPayments(paymentsRes.payments || []);
      } else {
        setError(paymentsRes.message || "To'lovlarni yuklashda xatolik");
      }
    }).catch(() => {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma'lumotlar bazasi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="courses">Kurslar</TabsTrigger>
            <TabsTrigger value="payments">To'lovlar</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ism</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Balans</TableHead>
                    <TableHead>Ro'yxatdan o'tgan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : error ? <div className="text-red-500">{error}</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ism</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Balans</TableHead>
                    <TableHead>Ro'yxatdan o'tgan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.fullName}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{(u.balance || 0).toLocaleString()} so'm</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleString("uz-UZ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="courses">
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomi</TableHead>
                    <TableHead>O'qituvchi</TableHead>
                    <TableHead>Narxi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Yaratilgan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : error ? <div className="text-red-500">{error}</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomi</TableHead>
                    <TableHead>O'qituvchi</TableHead>
                    <TableHead>Narxi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Yaratilgan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.instructor}</TableCell>
                      <TableCell>{c.price?.toLocaleString()} so'm</TableCell>
                      <TableCell>{c.status}</TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleString("uz-UZ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="payments">
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foydalanuvchi</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>To'lov usuli</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sana</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : error ? <div className="text-red-500">{error}</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foydalanuvchi</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>To'lov usuli</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sana</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p._id || p.id}>
                      <TableCell>{p.user?.fullName || p.userId || "-"}</TableCell>
                      <TableCell>{p.amount?.toLocaleString()} so'm</TableCell>
                      <TableCell>{p.paymentMethod}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>{new Date(p.createdAt).toLocaleString("uz-UZ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 