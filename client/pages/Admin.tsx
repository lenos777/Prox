import { useState, useEffect, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Settings, 
  BarChart3, 
  CreditCard, 
  BookOpen,
  LogOut,
  User,
  Phone,
  Calendar,
  DollarSign,
  Database,
  FileText,
  MessageSquare,
  Bell,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  X,
  RefreshCw,
  Menu,
  Wifi,
  BarChart2,
  TrendingUp,
  TrendingDown,
  ChartBar,
  Pencil,
  Check,
} from "lucide-react";
import AdminNotifications from "./AdminNotifications";
import DatabaseContent from "./DatabaseContent";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CourseModule, Lesson } from "@shared/api";
import CourseDetailsModal from "./CourseDetailsModal";

const adminMenuItems = [
  { title: "Dashboard", icon: BarChart3, path: "dashboard" },
  { title: "Foydalanuvchilar", icon: Users, path: "users" },
  { title: "Kurslar", icon: BookOpen, path: "courses" },
  { title: "To'lovlar", icon: CreditCard, path: "payments" },
  { title: "ProX Offline", icon: Wifi, path: "offline" },
  { title: "Ma'lumotlar bazasi", icon: Database, path: "database" },
  { title: "Sozlamalar", icon: Settings, path: "settings" },
];

// Place this at the top-level (outside AdminProxOffline)
const fullUzbekDays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

function DashboardContent() {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalPayments: 0,
    monthlyRevenue: 0,
    recentUsers: [],
    recentPayments: [],
    recentCourses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='));
      if (!token) {
        setError("Avtorizatsiya talab qilinadi");
        setLoading(false);
        return;
      }

      const jwt = token.split('=')[1];
      
      // Parallel data fetching for better performance
      const [usersRes, coursesRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${jwt}` }
        }),
        fetch('/api/admin/courses', {
          headers: { 'Authorization': `Bearer ${jwt}` }
        }),
        fetch('/api/admin/payments', {
          headers: { 'Authorization': `Bearer ${jwt}` }
        })
      ]);

      if (!usersRes.ok || !coursesRes.ok || !paymentsRes.ok) {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
        setLoading(false);
        return;
      }

      const [usersData, coursesData, paymentsData] = await Promise.all([
        usersRes.json(),
        coursesRes.json(),
        paymentsRes.json()
      ]);

      // Extract data from MongoDB response format
      const users = usersData.success ? usersData.users : [];
      const courses = coursesData.success ? coursesData.courses : [];
      const payments = paymentsData.success ? paymentsData.payments : [];

      // Calculate dashboard metrics
      const totalUsers = users.length;
      const totalCourses = courses.length;
      const totalPayments = payments.length;
      const monthlyRevenue = payments
        .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const recentPayments = payments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const recentCourses = courses
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setDashboardData({
        totalUsers,
        totalCourses,
        totalPayments,
        monthlyRevenue,
        recentUsers,
        recentPayments,
        recentCourses,
      });
    } catch (err) {
      setError("Server bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "hozirgina";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} daqiqa oldin`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} soat oldin`;
    return `${Math.floor(diffInSeconds / 86400)} kun oldin`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Tizim statistikasi va so'nggi faollik
            </p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" disabled>
            Yangilash
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Tizim statistikasi va so'nggi faollik
            </p>
          </div>
          <Button onClick={loadDashboardData} variant="outline">
            Yangilash
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Xatolik yuz berdi</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboardData} variant="outline">
              Qayta urinish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Tizim statistikasi va so'nggi faollik
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          Yangilash
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jami foydalanuvchilar
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.recentUsers.length} oxirgi 24 soatda
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jami kurslar
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.recentCourses.length} oxirgi 24 soatda
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jami to'lovlar
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.recentPayments.length} oxirgi 24 soatda
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Oylik daromad
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Bu oy uchun
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>So'nggi to'lovlar</CardTitle>
            <CardDescription>
              Oxirgi 5 ta to'lov ma'lumotlari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentPayments.map((payment) => (
                <div key={payment._id || payment.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {payment.user?.fullName || "Noma'lum foydalanuvchi"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.course?.title || "Noma'lum kurs"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(payment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>So'nggi foydalanuvchilar</CardTitle>
            <CardDescription>
              Yangi ro'yxatdan o'tgan foydalanuvchilar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentUsers.map((user) => (
                <div key={user._id || user.id} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {user.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.phone}
                    </p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {formatTimeAgo(user.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", role: "student", balance: 0 });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        if (usersData.success) {
        setUsers(usersData.users);
        }
      }
    } catch (error) {
      // Users loading error handled silently
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Ma'lumot yo'q";
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    const months = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
    ];
    
    return `${year}-yil ${day}-${months[month]} ${hours}:${minutes}`;
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      role: user.role || "student",
      balance: user.balance || 0
    });
    setEditError("");
    setEditSuccess("");
    setShowPassword(false);
    setShowPhone(false);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      role: user.role || "student",
      balance: user.balance || 0
    });
    setEditError("");
    setEditSuccess("");
    setShowPassword(false);
    setShowPhone(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (!editForm.fullName || !editForm.phone) {
      setEditError("Ism va telefon raqami to'ldirilishi shart");
      return;
    }
    try {
      setEditLoading(true);
      setEditError("");
      setEditSuccess("");
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      // Agar 204 yoki content-type JSON emas bo'lsa, xatolik chiqmasin
      const contentType = response.headers.get('content-type');
      if (response.ok && (response.status === 204 || !contentType || !contentType.includes('application/json'))) {
        setEditSuccess("Foydalanuvchi ma'lumotlari yangilandi");
        setEditingUser(null);
        loadUsers();
        return;
      }
      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        setEditError("Server noto'g'ri javob qaytardi. Keyinroq urinib ko'ring.");
        return;
      }
      if (response.ok) {
        setEditSuccess("Foydalanuvchi ma'lumotlari yangilandi");
        setEditingUser(null);
        loadUsers();
      } else {
        setEditError((data && typeof data === 'object' && 'message' in data) ? String(data.message) : "Xatolik yuz berdi");
      }
    } catch (error) {
      setEditError("Server yoki internet bilan bog'lanishda xatolik. Internetga ulanishingizni tekshiring yoki keyinroq urinib ko'ring.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Foydalanuvchini o'chirishga ishonchingiz komilmi?\n${user.fullName} (${user.phone})`)) return;
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== user.id));
        window.alert('Foydalanuvchi muvaffaqiyatli o\'chirildi!');
      } else {
        window.alert('O\'chirishda xatolik yuz berdi!');
      }
    } catch (e) {
      window.alert('Server bilan bog\'lanishda xatolik!');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Foydalanuvchilar</h2>
            <p className="text-muted-foreground max-w-2xl">
              Barcha ro'yxatdan o'tgan foydalanuvchilarni boshqarish
            </p>
        </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Download className="w-4 h-4 mr-2" />
              Eksport
            </Button>
          </div>
        </div>
        {/* Search and Filters Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-24" />
        </div>
        {/* Users Skeleton List */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20 rounded" />
                    <div className="text-right">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Foydalanuvchilar</h2>
          <p className="text-muted-foreground max-w-2xl">
            Barcha ro'yxatdan o'tgan foydalanuvchilarni boshqarish
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Eksport
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Foydalanuvchilarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtr
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'student_offline' ? 'outline' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'student_offline' ? 'Student Offline' : 'Student'}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </p>
                        <p className="text-sm font-medium">
                          Balans: {formatCurrency(user.balance || 0)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Foydalanuvchilar topilmadi</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View/Edit User Modal */}
      {(viewingUser || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                {editingUser ? "Foydalanuvchini tahrirlash" : "Foydalanuvchi ma'lumotlari"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => { setEditingUser(null); setViewingUser(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Avatar and info faqat view mode-da */}
            {viewingUser && !editingUser && (
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-lg">{editForm.fullName}</p>
                <p className="text-sm text-muted-foreground">{editForm.phone}</p>
                <Badge variant={editForm.role === 'admin' ? 'destructive' : editForm.role === 'student_offline' ? 'outline' : 'secondary'} className="mt-1">
                  {editForm.role === 'admin' ? 'Admin' : editForm.role === 'student_offline' ? 'Student Offline' : 'Student'}
                </Badge>
              </div>
            )}
            {editError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{editError}</p>
              </div>
            )}
            {editSuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600">{editSuccess}</p>
              </div>
            )}
            {/* Only show info as text in view mode */}
            {viewingUser && !editingUser ? (
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">Ism</span>
                  <span className="font-medium">{viewingUser.fullName}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">Telefon raqami</span>
                  <span className="font-medium">{viewingUser.phone}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">Rol</span>
                  <span className="font-medium">
                    {viewingUser.role === 'admin' ? 'Admin' : viewingUser.role === 'student_offline' ? 'Student Offline' : 'Student'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">Balans</span>
                  <span className="font-medium">{formatCurrency(viewingUser.balance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ro'yxatdan o'tgan sana</span>
                  <span className="font-medium">{formatDate(viewingUser.createdAt)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ism</label>
                  <Input
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditFormChange}
                    placeholder="Foydalanuvchi ismi"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon raqami</label>
                  <div className="relative">
                    <Input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      placeholder="+998 XX XXX XX XX"
                      className="w-full pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowPhone(!showPhone)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  {showPhone && (
                    <p className="text-xs text-muted-foreground mt-1">Telefon: {editForm.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rol</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="student">Student</option>
                    <option value="student_offline">Student Offline</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Balans</label>
                  <Input
                    name="balance"
                    type="number"
                    value={editForm.balance}
                    onChange={handleEditFormChange}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ro'yxatdan o'tgan sana</label>
                  <Input
                    value={formatDate((viewingUser || editingUser)?.createdAt)}
                    readOnly
                    className="w-full"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              {viewingUser && !editingUser && (
                <Button onClick={() => { setEditingUser(viewingUser); setViewingUser(null); }}>
                  Tahrirlash
                </Button>
              )}
              {(editingUser && !viewingUser) && (
                <>
                  <Button variant="outline" onClick={() => setEditingUser(null)} disabled={editLoading}>
                    Bekor qilish
                  </Button>
                  <Button onClick={handleSaveUser} disabled={editLoading}>
                    {editLoading ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesContent() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    instructor: "",
    price: "",
    duration: "",
    level: "Boshlang'ich",
    category: "",
    tags: []
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [modulesByCourse, setModulesByCourse] = useState<Record<string, { loading: boolean; modules: CourseModule[] }>>({});
  const [addModuleCourseId, setAddModuleCourseId] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order: 0 });
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleError, setModuleError] = useState("");
  const [moduleSuccess, setModuleSuccess] = useState("");
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<CourseModule | null>(null);
  const [editModuleForm, setEditModuleForm] = useState({ title: "", description: "", order: 0 });
  const [editModuleLoading, setEditModuleLoading] = useState(false);
  const [editModuleError, setEditModuleError] = useState("");
  const [editModuleSuccess, setEditModuleSuccess] = useState("");
  const [deleteModuleLoading, setDeleteModuleLoading] = useState(false);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, { loading: boolean; lessons: Lesson[] }>>({});
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", videoUrl: "", codeSourceUrl: "", order: 0 });
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState("");
  const [lessonSuccess, setLessonSuccess] = useState("");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editLessonForm, setEditLessonForm] = useState({ title: "", description: "", videoUrl: "", codeSourceUrl: "", order: 0 });
  const [editLessonLoading, setEditLessonLoading] = useState(false);
  const [editLessonError, setEditLessonError] = useState("");
  const [editLessonSuccess, setEditLessonSuccess] = useState("");
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseDetailsLoading, setCourseDetailsLoading] = useState(false);
  const [courseDetailsError, setCourseDetailsError] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  // Clear error and success messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      
      const response = await fetch('/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
        setCourses(data.courses);
        } else {
          setError("Kurslarni yuklashda xatolik yuz berdi");
        }
      } else {
        setError("Kurslarni yuklashda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Kurslarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Ma'lumot yo'q";
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const months = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
    ];
    
    return `${year}-yil ${day}-${months[month]}`;
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = async () => {
    if (!courseForm.title || !courseForm.description || !courseForm.instructor || !courseForm.price || !courseForm.duration) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('instructor', courseForm.instructor);
      formData.append('price', courseForm.price);
      formData.append('duration', courseForm.duration);
      formData.append('level', courseForm.level);
      formData.append('category', courseForm.category);
      formData.append('tags', JSON.stringify(courseForm.tags));
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Kurs muvaffaqiyatli qo'shildi");
        setCourseForm({
          title: "",
          description: "",
          instructor: "",
          price: "",
          duration: "",
          level: "Boshlang'ich",
          category: "",
          tags: []
        });
        setSelectedImage(null);
        setImagePreview("");
        setShowAddCourse(false);
        loadCourses(); // Reload courses from server
      } else {
        setError(data.message || "Kurs qo'shishda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price.toString(),
      duration: course.duration,
      level: course.level,
      category: course.category || "",
      tags: course.tags || []
    });
    setSelectedImage(null);
    setImagePreview(course.imageUrl || "");
    setShowAddCourse(true);
  };

  const handleUpdateCourse = async () => {
    if (!courseForm.title || !courseForm.description || !courseForm.instructor || !courseForm.price || !courseForm.duration) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('instructor', courseForm.instructor);
      formData.append('price', courseForm.price);
      formData.append('duration', courseForm.duration);
      formData.append('level', courseForm.level);
      formData.append('category', courseForm.category);
      formData.append('tags', JSON.stringify(courseForm.tags));
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Kurs muvaffaqiyatli yangilandi");
        setCourseForm({
          title: "",
          description: "",
          instructor: "",
          price: "",
          duration: "",
          level: "Boshlang'ich",
          category: "",
          tags: []
        });
        setSelectedImage(null);
        setImagePreview("");
        setEditingCourse(null);
        setShowAddCourse(false);
        loadCourses(); // Reload courses from server
      } else {
        setError(data.message || "Kurs yangilashda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (confirm("Bu kursni o'chirishni xohlaysizmi?")) {
      try {
        setLoading(true);
        setError("");
        const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
        
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess("Kurs muvaffaqiyatli o'chirildi");
          loadCourses(); // Reload courses from server
        } else {
          setError(data.message || "Kurs o'chirishda xatolik yuz berdi");
        }
          } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
    }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      setLoading(true);
      setError("");
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      
      const response = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Kurs holati muvaffaqiyatli o'zgartirildi");
        loadCourses(); // Reload courses from server
      } else {
        setError(data.message || "Kurs holatini o'zgartirishda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = async (courseId: string | null) => {
    setOpenCourseId(courseId);
    if (courseId && !modulesByCourse[courseId]) {
      setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: true, modules: [] } }));
      try {
        const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
        const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.success) {
          setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: false, modules: data.modules.map((m: any) => ({
            id: m._id || m.id,
            title: m.title,
            description: m.description,
            order: m.order,
            courseId: m.courseId,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          })) } }));
        } else {
          setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: false, modules: [] } }));
        }
      } catch {
        setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: false, modules: [] } }));
      }
    }
  };

  const handleAddModule = async (courseId: string) => {
    if (!moduleForm.title) {
      setModuleError("Modul nomi majburiy");
      return;
    }
    setModuleLoading(true);
    setModuleError("");
    setModuleSuccess("");
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      
      // Get current modules to determine the next order number
      const currentModules = modulesByCourse[courseId]?.modules || [];
      const nextOrder = currentModules.length > 0 ? Math.max(...currentModules.map(m => m.order)) + 1 : 0;
      
      const moduleData = {
        ...moduleForm,
        order: moduleForm.order || nextOrder
      };
      
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(moduleData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setModuleSuccess("Modul muvaffaqiyatli qo'shildi");
        setModuleForm({ title: "", description: "", order: 0 });
        // Reload modules for this course
        setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: true, modules: [] } }));
        const res2 = await fetch(`/api/admin/courses/${courseId}/modules`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data2 = await res2.json();
        setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: false, modules: data2.modules.map((m: any) => ({
          id: m._id || m.id,
          title: m.title,
          description: m.description,
          order: m.order,
          courseId: m.courseId,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        })) } }));
        setAddModuleCourseId(null);
      } else {
        setModuleError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setModuleError("Server bilan bog'lanishda xatolik");
    } finally {
      setModuleLoading(false);
      setTimeout(() => { setModuleError(""); setModuleSuccess(""); }, 3000);
    }
  };

  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setEditModuleForm({
      title: module.title,
      description: module.description,
      order: module.order
    });
    setEditModuleError("");
    setEditModuleSuccess("");
  };

  const handleUpdateModule = async () => {
    if (!editingModule || !editModuleForm.title) {
      setEditModuleError("Modul nomi majburiy");
      return;
    }
    setEditModuleLoading(true);
    setEditModuleError("");
    setEditModuleSuccess("");
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/courses/${editingModule.courseId}/modules/${editingModule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editModuleForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditModuleSuccess("Modul muvaffaqiyatli yangilandi");
        // Reload modules for this course
        const courseId = editingModule.courseId;
        setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: true, modules: [] } }));
        const res2 = await fetch(`/api/admin/courses/${courseId}/modules`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data2 = await res2.json();
        setModulesByCourse((prev) => ({ ...prev, [courseId]: { loading: false, modules: data2.modules.map((m: any) => ({
          id: m._id || m.id,
          title: m.title,
          description: m.description,
          order: m.order,
          courseId: m.courseId,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        })) } }));
        setEditingModule(null);
      } else {
        setEditModuleError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setEditModuleError("Server bilan bog'lanishda xatolik");
    } finally {
      setEditModuleLoading(false);
      setTimeout(() => { setEditModuleError(""); setEditModuleSuccess(""); }, 3000);
    }
  };

  const handleDeleteModule = async () => {
    if (!deletingModule) return;
    setDeleteModuleLoading(true);
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/courses/${deletingModule.courseId}/modules/${deletingModule.id}`, {
        method: "DELETE",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Remove module from state
        const courseId = deletingModule.courseId;
        setModulesByCourse((prev) => ({ 
          ...prev, 
          [courseId]: { 
            ...prev[courseId], 
            modules: prev[courseId].modules.filter(m => m.id !== deletingModule.id) 
          } 
        }));
        setDeletingModule(null);
      } else {
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch {
      alert("Server bilan bog'lanishda xatolik");
    } finally {
      setDeleteModuleLoading(false);
    }
  };

  const loadLessons = async (moduleId: string) => {
    setLessonsByModule((prev) => ({ ...prev, [moduleId]: { loading: true, lessons: [] } }));
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setLessonsByModule((prev) => ({ ...prev, [moduleId]: { loading: false, lessons: data.lessons.map((l: any) => ({
          id: l._id || l.id,
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          codeSourceUrl: l.codeSourceUrl,
          order: l.order,
          moduleId: l.moduleId,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })) } }));
      } else {
        setLessonsByModule((prev) => ({ ...prev, [moduleId]: { loading: false, lessons: [] } }));
      }
    } catch {
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: { loading: false, lessons: [] } }));
    }
  };

  // Move lesson CRUD handlers above their first usage
  const handleAddLesson = async (moduleId: string) => {
    if (!lessonForm.title) {
      setLessonError("Dars nomi majburiy");
      return;
    }
    setLessonLoading(true);
    setLessonError("");
    setLessonSuccess("");
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(lessonForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLessonSuccess("Dars muvaffaqiyatli qo'shildi");
        setLessonForm({ title: "", description: "", videoUrl: "", codeSourceUrl: "", order: (lessonsByModule[moduleId]?.lessons.length || 0) + 1 });
        setAddLessonModuleId(null);
        loadLessons(moduleId);
      } else {
        setLessonError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setLessonError("Server bilan bog'lanishda xatolik");
    } finally {
      setLessonLoading(false);
      setTimeout(() => { setLessonError(""); setLessonSuccess(""); }, 3000);
    }
  };
  const handleUpdateLesson = async () => {
    if (!editingLesson || !editLessonForm.title) {
      setEditLessonError("Dars nomi majburiy");
      return;
    }
    setEditLessonLoading(true);
    setEditLessonError("");
    setEditLessonSuccess("");
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/modules/${editingLesson.moduleId}/lessons/${editingLesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editLessonForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditLessonSuccess("Dars muvaffaqiyatli yangilandi");
        loadLessons(editingLesson.moduleId);
        setEditingLesson(null);
      } else {
        setEditLessonError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setEditLessonError("Server bilan bog'lanishda xatolik");
    } finally {
      setEditLessonLoading(false);
      setTimeout(() => { setEditLessonError(""); setEditLessonSuccess(""); }, 3000);
    }
  };
  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    setDeleteLessonLoading(true);
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/modules/${deletingLesson.moduleId}/lessons/${deletingLesson.id}`, {
        method: "DELETE",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadLessons(deletingLesson.moduleId);
        setDeletingLesson(null);
      } else {
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch {
      alert("Server bilan bog'lanishda xatolik");
    } finally {
      setDeleteLessonLoading(false);
    }
  };

  const handleShowCourseDetails = async (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
    setCourseDetails(null);
    setCourseDetailsLoading(true);
    setCourseDetailsError("");
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch(`/api/admin/courses/${course.id}/details`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setCourseDetails(data.course);
      } else {
        setCourseDetailsError("Kurs tafsilotlarini yuklashda xatolik");
      }
    } catch (e) {
      setCourseDetailsError("Server bilan bog'lanishda xatolik");
    } finally {
      setCourseDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Kurslar</h2>
        <Button variant="default" onClick={() => setShowAddCourse(true)}>
          + Yangi kurs
        </Button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4">
                  <Skeleton className="w-full h-32 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="flex items-center justify-between mt-4">
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 mb-4">{error}</div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center text-muted-foreground">Kurslar topilmadi</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEditCourse(course)}>
                      <Edit className="w-5 h-5 text-blue-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {course.status === 'active' ? 'Faol' : 'Qoralama'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{course.modulesCount || 0} ta modul</span>
                </div>
                <Button
                  variant="default"
                  className="w-full mt-2"
                  onClick={() => handleShowCourseDetails(course)}
                >
                  Batafsil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add/Edit Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCourse ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddCourse(false);
                  setEditingCourse(null);
                  setCourseForm({
                    title: "",
                    description: "",
                    instructor: "",
                    price: "",
                    duration: "",
                    level: "Boshlang'ich",
                    category: "",
                    tags: []
                  });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              editingCourse ? handleUpdateCourse() : handleAddCourse();
            }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Kurs nomi
                </label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  placeholder="Kurs nomini kiriting"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tavsif
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  placeholder="Kurs haqida ma'lumot"
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  O'qituvchi
                </label>
                <input
                  type="text"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                  placeholder="O'qituvchi ismi"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Narxi (so'm)
                  </label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                    placeholder="500000"
                    min="0"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Davomiyligi
                  </label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                    placeholder="8 hafta"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Darajasi
                </label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Boshlang'ich">Boshlang'ich</option>
                  <option value="O'rta">O'rta</option>
                  <option value="Yuqori">Yuqori</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Kurs rasmi
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedImage(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setImagePreview(e.target.result as string); 
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {(imagePreview || selectedImage) && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddCourse(false);
                    setEditingCourse(null);
                    setCourseForm({
                      title: "",
                      description: "",
                      instructor: "",
                      price: "",
                      duration: "",
                      level: "Boshlang'ich",
                      category: "",
                      tags: []
                    });
                  }}
                  className="flex-1"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  {editingCourse ? 'Yangilash' : 'Qo\'shish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Modulni tahrirlash
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingModule(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleUpdateModule(); }}>
              <div>
                <label className="block text-sm font-medium mb-1">Modul nomi</label>
                <Input 
                  value={editModuleForm.title} 
                  onChange={e => setEditModuleForm(f => ({ ...f, title: e.target.value }))} 
                  required 
                  placeholder="Modul nomi" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tavsif (ixtiyoriy)</label>
                <Input 
                  value={editModuleForm.description} 
                  onChange={e => setEditModuleForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="Tavsif" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tartib raqami</label>
                <Input 
                  type="number" 
                  value={editModuleForm.order} 
                  onChange={e => setEditModuleForm(f => ({ ...f, order: Number(e.target.value) }))} 
                  min={0} 
                />
              </div>
              {editModuleError && <div className="text-red-500 text-sm">{editModuleError}</div>}
              {editModuleSuccess && <div className="text-green-600 text-sm">{editModuleSuccess}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingModule(null)} disabled={editModuleLoading}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={editModuleLoading}>
                  {editModuleLoading ? "Yangilanmoqda..." : "Yangilash"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Module Confirmation */}
      {deletingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Modulni o'chirish
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setDeletingModule(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">"<strong>{deletingModule.title}</strong>" modulini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeletingModule(null)} disabled={deleteModuleLoading}>Bekor qilish</Button>
                <Button variant="destructive" onClick={handleDeleteModule} disabled={deleteModuleLoading}>{deleteModuleLoading ? "O'chirilmoqda..." : "O'chirish"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Darsni tahrirlash</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingLesson(null)}><X className="w-4 h-4" /></Button>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleUpdateLesson(); }}>
              <Input value={editLessonForm.title} onChange={e => setEditLessonForm(f => ({ ...f, title: e.target.value }))} required placeholder="Dars nomi" />
              <Input value={editLessonForm.description} onChange={e => setEditLessonForm(f => ({ ...f, description: e.target.value }))} placeholder="Tavsif" />
              <Input value={editLessonForm.videoUrl} onChange={e => setEditLessonForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="Video URL" />
              <Input value={editLessonForm.codeSourceUrl} onChange={e => setEditLessonForm(f => ({ ...f, codeSourceUrl: e.target.value }))} placeholder="Kod manbasi (URL)" />
              <Input type="number" value={editLessonForm.order} onChange={e => setEditLessonForm(f => ({ ...f, order: Number(e.target.value) }))} min={0} placeholder="Tartib raqami" />
              {editLessonError && <div className="text-red-500 text-xs">{editLessonError}</div>}
              {editLessonSuccess && <div className="text-green-600 text-xs">{editLessonSuccess}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingLesson(null)} disabled={editLessonLoading}>Bekor qilish</Button>
                <Button type="submit" disabled={editLessonLoading}>{editLessonLoading ? "Yangilanmoqda..." : "Yangilash"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Darsni o'chirish</h3>
              <Button variant="ghost" size="sm" onClick={() => setDeletingLesson(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">"<strong>{deletingLesson.title}</strong>" darsini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeletingLesson(null)} disabled={deleteLessonLoading}>Bekor qilish</Button>
                <Button variant="destructive" onClick={handleDeleteLesson} disabled={deleteLessonLoading}>{deleteLessonLoading ? "O'chirilmoqda..." : "O'chirish"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && selectedCourse && (
        <CourseDetailsModal
          course={courseDetails}
          loading={courseDetailsLoading}
          error={courseDetailsError}
          onClose={() => setShowCourseModal(false)}
          onReloadCourses={loadCourses}
        />
      )}
    </div>
  );
}

function PaymentsContent() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const response = await fetch('/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
        setPayments(data.payments || []);
        } else {
          setError("To'lovlarni yuklashda xatolik yuz berdi");
        }
      } else {
        setError("To'lovlarni yuklashda xatolik yuz berdi");
      }
    } catch {
      setError("Server yoki internet bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p =>
    (p.user?.fullName?.toLowerCase() || p.userId?.toLowerCase() || "").includes(search.toLowerCase()) ||
    p.status?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.amount).includes(search) ||
    (p.transactionId || "").toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  // Export CSV
  const handleExportCSV = () => {
    const header = 'Foydalanuvchi,Sana,Summasi,To\'lov usuli,Status,Transaction ID\n';
    const rows = payments.map(p =>
      [
        p.user?.fullName || p.userId || '',
        new Date(p.createdAt).toLocaleString("uz-UZ"),
        p.amount,
        p.paymentMethod,
        p.status,
        p.transactionId
      ].join(',')
    ).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">To'lovlar</h2>
          <p className="text-muted-foreground max-w-2xl">Barcha foydalanuvchilarning to'lovlari va ularni boshqarish</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={loadPayments}>
            <RefreshCw className="w-4 h-4 mr-2" /> Yangilash
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            Eksport (CSV)
          </Button>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Foydalanuvchi, status, summa yoki transaction ID bo'yicha qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs"
        />
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Foydalanuvchi</th>
                    <th className="p-3 text-left">Sana</th>
                    <th className="p-3 text-left">Summasi</th>
                    <th className="p-3 text-left">To'lov usuli</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Transaction ID</th>
                    <th className="p-3 text-left">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b hover:bg-muted/50">
                      <td className="p-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-8 rounded" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : paginatedPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">To'lovlar topilmadi</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Foydalanuvchi</th>
                    <th className="p-3 text-left">Sana</th>
                    <th className="p-3 text-left">Summasi</th>
                    <th className="p-3 text-left">To'lov usuli</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Transaction ID</th>
                    <th className="p-3 text-left">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map(payment => (
                    <tr key={payment._id || payment.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{payment.user?.fullName || payment.userId || "Noma'lum"}</td>
                      <td className="p-3">{new Date(payment.createdAt).toLocaleString("uz-UZ")}</td>
                      <td className="p-3">{payment.amount?.toLocaleString()} so'm</td>
                      <td className="p-3">{payment.paymentMethod || "—"}</td>
                      <td className="p-3">
                        <Badge variant={
                          payment.status === "pending" ? "secondary" :
                          payment.status === "completed" || payment.status === "success" ? "outline" :
                          payment.status === "rejected" ? "destructive" : "secondary"
                        }>
                          {payment.status === "pending" ? "Kutilmoqda" :
                           payment.status === "completed" || payment.status === "success" ? "Tasdiqlangan" :
                           payment.status === "rejected" ? "Rad etilgan" : payment.status}
                        </Badge>
                      </td>
                      <td className="p-3">{payment.transactionId || "—"}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>&lt;</Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>&gt;</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background border rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3" onClick={() => setSelectedPayment(null)}>
              <X className="w-6 h-6 text-muted-foreground hover:text-foreground transition" />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-primary">To'lov tafsilotlari</h3>
            <div className="space-y-4 text-base">
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Foydalanuvchi:</span>
                <span className="font-semibold text-foreground">{selectedPayment.user?.fullName || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Telefon:</span>
                <span>{selectedPayment.user?.phone || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Sana:</span>
                <span>{new Date(selectedPayment.createdAt).toLocaleString("uz-UZ")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Summasi:</span>
                <span className="font-semibold">{selectedPayment.amount?.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">To'lov usuli:</span>
                <span>{selectedPayment.paymentMethod || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Status:</span>
                <span>{selectedPayment.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Transaction ID:</span>
                <span>{selectedPayment.transactionId || "-"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="font-medium text-muted-foreground">Izoh:</span>
                <span>{selectedPayment.description || selectedPayment.comment || "-"}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
              {selectedPayment.status === "pending" && (
                <>
                  <Button
                    variant="default"
                    disabled={actionLoading}
                    onClick={async () => {
                      setActionLoading(true);
                      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
                      await fetch(`/api/admin/payments/${selectedPayment._id || selectedPayment.id}/approve`, {
                        method: "POST",
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      setActionLoading(false);
                      setSelectedPayment(null);
                      loadPayments();
                    }}
                  >
                    Tasdiqlash
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={async () => {
                      setActionLoading(true);
                      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
                      await fetch(`/api/admin/payments/${selectedPayment._id || selectedPayment.id}/reject`, {
                        method: "POST",
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      setActionLoading(false);
                      setSelectedPayment(null);
                      loadPayments();
                    }}
                  >
                    Rad etish
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsContent({ userData, reloadUserData }) {
  const [form, setForm] = useState({
    fullName: userData?.fullName || "",
    phone: userData?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const phoneInputRef = useRef(null);

  // Always update form when userData changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: userData?.fullName || "",
      phone: userData?.phone || "",
    }));
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      // Update profile
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch("/api/admin/users/" + userData.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Xatolik");
      setSuccess("Profil yangilandi");
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Barcha parol maydonlari to'ldirilishi shart");
      setLoading(false);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Yangi parollar mos emas");
      setLoading(false);
      return;
    }
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Xatolik");
      setSuccess("Parol muvaffaqiyatli o'zgartirildi");
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profil ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ism</label>
              <Input name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon raqami</label>
              <Input name="phone" value={form.phone} onChange={handleChange} ref={phoneInputRef} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? "Saqlanmoqda..." : "Saqlash"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Parolni o'zgartirish</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Joriy parol</label>
              <Input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yangi parol</label>
              <Input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yangi parol (takroran)</label>
              <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {(success || error) && (
        <div className={`p-3 rounded-md text-sm ${success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{success || error}</div>
      )}
    </div>
  );
}

function AdminProxOffline() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', balance: 0, step: 1, todayScore: 0 });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [weekScores, setWeekScores] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='));
        const res = await fetch('/api/offline-students', {
          headers: token ? { 'Authorization': `Bearer ${token.split('=')[1]}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        } else {
          setError("Foydalanuvchilarni yuklashda xatolik");
        }
      } catch {
        setError("Server bilan bog'lanishda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.phone.includes(search)
  );

  // Dummy stats generator (for demo)
  function getUserStats(user) {
    const weekPoints = Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
    const monthPoints = Array.from({ length: 4 }, () => Math.floor(Math.random() * 300));
    const avg = Math.round(weekPoints.reduce((a, b) => a + b, 0) / weekPoints.length);
    const worstDayIdx = weekPoints.indexOf(Math.min(...weekPoints));
    const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    return {
      step: Math.floor(Math.random() * 10) + 1,
      weekPoints,
      monthPoints,
      avg,
      worstDay: days[worstDayIdx],
      worstDayValue: weekPoints[worstDayIdx],
    };
  }

  // Place this at the top-level (outside AdminProxOffline)
  function getCurrentWeekDates() {
    const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const now = new Date();
    const week = [];
    // Find Monday of this week
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const day = d.getDate();
      const month = months[d.getMonth()];
      week.push({
        label: days[i],
        date: `${day}-${month}`,
        iso: d.toISOString().slice(0, 10)
      });
    }
    return week;
  }

  // Edit button handler
  const handleEditUser = (user) => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const todayScoreObj = (user.todayScores || []).find(s => s.date === todayISO);
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      balance: user.balance || 0,
      step: user.step || 1,
      todayScore: todayScoreObj ? todayScoreObj.score : 0,
    });
    setEditError("");
    setEditSuccess("");
    // Haftalik ballarni to'g'ri yuklash
    const weekDates = getCurrentWeekDates();
    const weekScoresInit = {};
    if (user.todayScores && Array.isArray(user.todayScores)) {
      for (const day of weekDates) {
        const found = user.todayScores.find(s => s.date === day.date);
        weekScoresInit[day.date] = found ? found.score : '';
      }
    }
    setWeekScores(weekScoresInit);
  };

  // Edit form change handler
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === 'balance' || name === 'step' || name === 'todayScore' ? Number(value) : value }));
  };

  // Edit form submit handler
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='));
      // Faqat bugungi sana uchun weekScores arrayini tayyorlash
      const weekScoresArr = Object.entries(weekScores)
        .filter(([_, v]) => v !== '' && !isNaN(Number(v)))
        .map(([date, score]) => ({ date, score: Number(score) }));
      const body = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        balance: editForm.balance,
        step: editForm.step,
        weekScores: weekScoresArr // Faqat bugungi sana bo'ladi
      };
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token.split('=')[1]}` } : {})
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Xatolik");
      setEditSuccess("O'quvchi ma'lumotlari yangilandi");
      // Update user in list with new todayScores if available
      setUsers((prev) => prev.map(u =>
        u.id === editingUser.id
          ? { ...u, ...editForm, todayScores: data.user?.todayScores ?? u.todayScores }
          : u
      ));
      setTimeout(() => {
        setEditingUser(null);
        setEditSuccess("");
      }, 1000);
    } catch (e) {
      setEditError(e.message || "Xatolik yuz berdi");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[70vh] flex flex-col items-center justify-center px-2 py-8 animate-fade-in">
      {!selectedUser ? (
        <>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 text-center">
            ProX offline o'quvchilari
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-8 text-center">
            Barcha offline o'quvchilar ro'yxati va qidiruvi.
          </p>
          <div className="mb-6 w-full max-w-md mx-auto relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <Input
              placeholder="O'quvchini qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mb-4">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-muted-foreground">Offline o'quvchilar topilmadi</div>
          ) : (
            <div className="space-y-3 w-full">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg bg-muted/50 transition-colors hover:bg-primary/10 hover:border-primary/60`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3 h-3" /> {user.phone}
                    </p>
                  </div>
                  <button
                    className="ml-2 p-2 rounded hover:bg-primary/10 transition-colors"
                    onClick={() => handleEditUser(user)}
                    title="Tahrirlash"
                    type="button"
                  >
                    <Pencil className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Edit Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
              <div className="bg-background border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground">O'quvchini tahrirlash</h3>
                  <button onClick={() => setEditingUser(null)} className="p-2 rounded hover:bg-muted transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditFormSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ism</label>
                    <Input name="fullName" value={editForm.fullName} onChange={handleEditFormChange} required className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefon raqami</label>
                    <Input name="phone" value={editForm.phone} onChange={handleEditFormChange} required className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Balans</label>
                    <Input name="balance" type="number" value={editForm.balance} onChange={handleEditFormChange} required className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Qadam (step)</label>
                    <Input name="step" type="number" min={1} value={editForm.step} onChange={handleEditFormChange} required className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bugungi ball</label>
                    {getCurrentWeekDates().map((day, idx) => {
                      const isToday = (() => {
                        const now = new Date();
                        const d = new Date(day.iso);
                        return now.getFullYear() === d.getFullYear() && now.getMonth() === d.getMonth() && now.getDate() === d.getDate();
                      })();
                      if (!isToday) return null;
                      return (
                        <div key={day.date} className="mb-2">
                          <div className="font-semibold mb-1 text-primary text-lg flex items-center gap-2">
                            {fullUzbekDays[idx]}
                            <span className="text-xs text-muted-foreground">({day.date})</span>
                            <span className="ml-2 px-2 py-0.5 rounded bg-primary text-white text-xs">Bugun</span>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            name={day.date}
                            value={weekScores[day.date] ?? ''}
                            onChange={e => setWeekScores(ws => ({ ...ws, [day.date]: e.target.value }))}
                            placeholder="Ball kiriting"
                            className="w-full text-lg px-4 py-2 border rounded focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                  {editError && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded text-sm">
                      <X className="w-4 h-4" /> {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded text-sm">
                      <Check className="w-4 h-4" /> {editSuccess}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={editLoading}>
                      Bekor qilish
                    </Button>
                    <Button type="submit" disabled={editLoading}>
                      {editLoading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            className="mb-6 self-start flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setSelectedUser(null)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Orqaga
          </button>
          <div className="w-full max-w-3xl mx-auto bg-background border border-muted rounded-3xl shadow-xl p-0 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-background p-6 md:p-8 pb-4 md:pb-6 border-b border-muted">
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted flex items-center justify-center shadow-lg border-4 border-background">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <div className="text-foreground text-xl md:text-2xl font-bold text-center md:text-left">{selectedUser.fullName}</div>
                <div className="text-muted-foreground text-base flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" /> {selectedUser.phone}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-0 w-full">
                <div className="bg-white/10 rounded-xl p-3 md:p-4 flex flex-col items-center shadow">
                  <BarChart2 className="w-5 h-5 md:w-6 md:h-6 text-white mb-1" />
                  <div className="text-base md:text-lg font-semibold text-primary rounded px-2 py-1">{getUserStats(selectedUser).step}</div>
                  <div className="text-xs text-white/80 mt-1">Qadam</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 md:p-4 flex flex-col items-center shadow">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-200 mb-1" />
                  <div className="text-base md:text-lg font-semibold text-green-600 rounded px-2 py-1">{getUserStats(selectedUser).weekPoints.reduce((a,b)=>a+b,0)}</div>
                  <div className="text-xs text-white/80 mt-1">Haftalik ball</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 md:p-4 flex flex-col items-center shadow">
                  <ChartBar className="w-5 h-5 md:w-6 md:h-6 text-blue-200 mb-1" />
                  <div className="text-base md:text-lg font-semibold text-blue-600 rounded px-2 py-1">{getUserStats(selectedUser).monthPoints.reduce((a,b)=>a+b,0)}</div>
                  <div className="text-xs text-white/80 mt-1">Oylik ball</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 md:p-4 flex flex-col items-center shadow">
                  <BarChart2 className="w-5 h-5 md:w-6 md:h-6 text-orange-200 mb-1" />
                  <div className="text-base md:text-lg font-semibold text-orange-500 rounded px-2 py-1">{getUserStats(selectedUser).avg}</div>
                  <div className="text-xs text-white/80 mt-1">O'rtacha ball</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 md:p-4 flex flex-col items-center shadow col-span-2 sm:col-span-1">
                  <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-200 mb-1" />
                  <div className="text-base md:text-lg font-semibold text-red-500 rounded px-2 py-1">{getUserStats(selectedUser).worstDay}</div>
                  <div className="text-xs text-white/80 mt-1">Yomon kun</div>
                  <div className="text-xs text-white/80">({getUserStats(selectedUser).worstDayValue} ball)</div>
                </div>
              </div>
            </div>
            {/* Chart - week points */}
            <div className="p-4 md:p-8 pt-4">
              <h4 className="font-semibold text-base mb-4 text-foreground">Haftalik ballar</h4>
              <div className="flex items-end gap-2 md:gap-3 h-24 md:h-32 w-full">
                {getUserStats(selectedUser).weekPoints.map((point, idx, arr) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div className={`w-6 md:w-8 rounded-t-xl ${point === Math.max(...arr) ? 'bg-primary' : 'bg-muted-foreground/40'} transition-all shadow-md`} style={{ height: `${point/1.5+20}px` }}></div>
                    <span className="text-xs text-muted-foreground mt-2">{['Du','Se','Ch','Pa','Ju','Sh','Ya'][idx]}</span>
                    <span className="text-xs font-semibold text-foreground mt-1">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='));
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token.split('=')[1]}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user.role === 'admin') {
          setIsAuthenticated(true);
          setUserData(data.user);
        } else {
          // Redirect to main site if not admin
          window.location.href = '/';
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  };

  const handleSidebarMenuClick = (path) => {
    setActiveTab(path);
  };

  // Add a function to reload user data
  const reloadUserData = async () => {
    try {
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='));
      if (!token) return;
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token.split('=')[1]}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user.role === 'admin') {
          setUserData(data.user);
        }
      }
    } catch {}
  };

  // When switching to settings tab, reload user data
  useEffect(() => {
    if (activeTab === "settings") {
      reloadUserData();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Admin panel yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">
            Admin huquqlariga ega emassiz
          </p>
          <Button onClick={() => window.location.href = '/'} className="mt-4">
            Bosh sahifaga qaytish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Mobile Navbar for Admin */}
        <div className="md:hidden">
          <div className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between border-b border-border bg-background px-4 py-3">
            <span className="font-bold text-xl text-foreground">Admin Panel</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(v => !v)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          {mobileMenuOpen && (
            <div className="fixed top-14 left-0 right-0 z-40 bg-background border-b border-border shadow-lg">
              <div className="p-4 space-y-2">
                {adminMenuItems.map(item => (
                  <Button
                    key={item.title}
                    variant={activeTab === item.path ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => { setActiveTab(item.path); setMobileMenuOpen(false); }}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.title}
                  </Button>
                ))}
                <Button className="w-full justify-start mt-2" variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-3" /> Chiqish
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Admin Sidebar */}
        <div className="hidden md:block">
          <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center justify-center">
                <span className="font-bold text-2xl text-sidebar-foreground">
                  Admin Panel
                </span>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={activeTab === item.path}
                      className="w-full justify-start"
                      onClick={() => handleSidebarMenuClick(item.path)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              {/* Admin Info */}
              <div className="mt-8 pt-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{userData?.fullName}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </SidebarContent>
          </Sidebar>
        </div>

        <SidebarInset className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8 md:pt-0 pt-16">
            {activeTab === "dashboard" && <DashboardContent />}
            {activeTab === "users" && <UsersContent />}
            {activeTab === "courses" && <CoursesContent />}
            {activeTab === "payments" && <PaymentsContent />}
            {activeTab === "offline" && <AdminProxOffline />}
            {activeTab === "database" && <DatabaseContent />}
            {activeTab === "settings" && <SettingsContent userData={userData} reloadUserData={reloadUserData} />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default AdminPanel; 