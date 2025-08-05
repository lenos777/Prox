import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { saveJwtToken, getJwtToken, removeJwtToken } from "@/lib/cookie";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  FolderOpen,
  User,
  Settings,
  Monitor,
  Lightbulb,
  Code,
  Database,
  Menu,
  Phone,
  Bell,
  CreditCard,
  X,
  Download,
  ChartBar,
  BarChart2,
  TrendingDown,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const menuItems = [
  { title: "Bosh sahifa", icon: Home },
  { title: "Kurslar", icon: BookOpen },
  { title: "Loyihalar", icon: FolderOpen },
];

export const userMenuItems = [
  { title: "Kurslarim", icon: BookOpen },
];

const projects = [
  {
    title: "Blog Platforma",
    icon: BookOpen,
    description: "Markdown asosida bloglar yaratish va boshqarish.",
    badge: "Open Source",
  },
  {
    title: "Resume Builder",
    icon: User,
    description: "Oson va tez professional rezyume tayyorlash.",
    badge: "Tez orada",
  },
  {
    title: "Beautiful Code",
    icon: Code,
    description: "Kodlarni chiroyli va o'qiladigan formatda ko'rsatish.",
    badge: "Beta",
  },
];

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadCourses();
    loadEnrolledCourses();
  }, []);

  useEffect(() => {
    console.log('Courses state updated:', courses);
  }, [courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      

      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        setError("Kurslarni yuklashda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const token = getJwtToken();
      if (!token) return;
      const response = await fetch('/api/user/enrolled-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses || []);
      }
    } catch {}
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleEnrollCourse = (course) => {
    setSelectedCourse(course);
    setShowEnrollmentModal(true);
    setEnrollmentError("");
    setEnrollmentSuccess("");
  };

  const confirmEnrollment = async () => {
    if (!selectedCourse) return;

    try {
      setEnrolling(true);
      setEnrollmentError("");
      setEnrollmentSuccess("");

      const token = getJwtToken();
      
      const response = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setEnrollmentSuccess(data.message);
        setShowEnrollmentModal(false);
        setSelectedCourse(null);
        
        // Reload courses to update enrolled students count
        loadCourses();
        
        // Show success message for 3 seconds
        setTimeout(() => {
          setEnrollmentSuccess("");
        }, 3000);
      } else {
        setEnrollmentError(data.message);
      }
    } catch (error) {
      setEnrollmentError("Server bilan bog'lanishda xatolik");
    } finally {
      setEnrolling(false);
    }
  };

  const cancelEnrollment = () => {
    setShowEnrollmentModal(false);
    setSelectedCourse(null);
    setEnrollmentError("");
    setEnrollmentSuccess("");
  };

  if (loading) {
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4">
                <Skeleton className="w-full h-48 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
            </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          {error}
        </div>
        <Button variant="outline" onClick={loadCourses}>
          Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
                <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Kurslar
          </h2>
          {/* <Button variant="ghost" size="sm" className="text-primary">
            Barchasini ko'rish →
          </Button> */}
                </div>
        </div>
      

      
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledCourses.some((c) => c.id === course.id);
            return (
              <Card
                key={course.id}
                className="relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
              >
                <CardContent className="p-0">
                  {course.imageUrl ? (
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                      className="w-full h-40 object-cover object-center rounded-t-2xl"
                      />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center rounded-t-2xl">
                      <BookOpen className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="p-6">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">O'qituvchi:</span>
                      <span className="font-medium">{course.instructor}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Narxi:</span>
                      <span className="font-medium text-primary">{formatCurrency(course.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Davomiyligi:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">O'quvchilar:</span>
                      <span className="font-medium">{course.enrolledStudents}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">★</span>
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {course.level}
                    </Badge>
                    {isEnrolled ? (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => window.open(`/learning/${course.id}`, '_blank')}
                      >
                        Davom etish
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Check if user is logged in (has JWT token)
                          const token = getJwtToken();
                          if (!token) {
                            // No JWT token found, redirect to Profile page
                            window.location.href = '/#profile';
                            return;
                          }
                          // User is logged in, show enrollment modal
                          handleEnrollCourse(course);
                        }}
                      >
                        Kursni boshlash
                      </Button>
                    )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Hali hech qanday kurs mavjud emas</p>
        </div>
      )}

      {/* Enrollment Confirmation Modal */}
      {showEnrollmentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Kursga a'zo bo'lish</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelEnrollment}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-medium mb-2">{selectedCourse.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedCourse.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">Kurs narxi:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(selectedCourse.price)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">O'qituvchi:</span>
                  <span className="text-sm">{selectedCourse.instructor}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm font-medium">Davomiyligi:</span>
                  <span className="text-sm">{selectedCourse.duration}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Eslatma:</strong> Kursga a'zo bo'lgandan so'ng, siz barcha darslarni ko'rishingiz va 
                  amaliy mashg'ulotlarni bajarishingiz mumkin. Progress 0% dan boshlanadi.
                </p>
              </div>
              
              {enrollmentError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                  {enrollmentError}
                </div>
              )}
              
              {enrollmentSuccess && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md border border-green-200">
                  {enrollmentSuccess}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={cancelEnrollment}
                  className="flex-1"
                  disabled={enrolling}
                >
                  Bekor qilish
                </Button>
                <Button
                  onClick={confirmEnrollment}
                  className="flex-1"
                  disabled={enrolling}
                >
                  {enrolling ? "Jarayonda..." : "A'zo bo'lish"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {enrollmentSuccess && !showEnrollmentModal && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
            <p className="font-medium">{enrollmentSuccess}</p>
          </div>
        </div>
      )}

      {/* Kurslar haqida ma'lumot */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Kurslar haqida</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Nima o'rganasiz?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground">Zamonaviy dasturlash texnologiyalari</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground">Real loyihalar orqali amaliy tajriba</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground">Professional dasturchi bo'lish yo'li</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <p className="text-sm text-muted-foreground">Ish topish va karyera rivojlanishi</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Kurslar tuzilishi</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nazariya darslari</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Praktik mashg'ulotlar</span>
                <span className="text-sm font-medium">50%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loyihalar</span>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kurslar afzalliklari */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Kurslar afzalliklari</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">To'liq materiallar</h3>
            <p className="text-sm text-muted-foreground">
              Har bir kurs uchun to'liq video darslar, hujjatlar va qo'llanmalar
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Praktik loyihalar</h3>
            <p className="text-sm text-muted-foreground">
              Real loyihalar orqali amaliy tajriba va portfolio yaratish
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mentorlik</h3>
            <p className="text-sm text-muted-foreground">
              Tajribali dasturchilar bilan individual maslahat va yo'riqlik
            </p>
          </Card>
        </div>
      </div>

      {/* Kurslar statistikasi */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-foreground mb-6">Kurslar statistikasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary mb-2">{courses.length}+</div>
            <div className="text-sm text-muted-foreground">Kurslar</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary mb-2">200+</div>
            <div className="text-sm text-muted-foreground">Video darslar</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Praktik loyihalar</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Mamnuniyat</div>
          </Card>
        </div>
      </div>
    </>
  );
}

function ProjectsList() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
                Loyihalar
          </h2>
          </div>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card
            key={index}
            className="relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
          >
            <CardContent className="p-6">
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow">
                <project.icon className="w-7 h-7 text-primary" />
        </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {project.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {project.description}
            </p>
              <Badge variant="secondary" className="text-xs">
                {project.badge}
              </Badge>
            </CardContent>
          </Card>
        ))}
            </div>
      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium text-muted-foreground mb-4">
          Ko'proq loyihalar tez orada...
        </h3>
      </div>
    </>
  );
}

function HomeContent({ setActiveTab, onProxOfflineClick }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Hero Section - Rasmdagidek dizayn */}
      <div className="relative min-h-[60vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden rounded-2xl mb-12">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/60 to-slate-900/80"></div>
        
        {/* Content container */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl">
            {/* Sarlavha */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              ProX -{" "}
              <span className="text-cyan-300">
                dasturlash kurslari
              </span>
            </h1>
            
            {/* Tavsif */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              ProX turli texnologiyalarni o'rganishda yordam beradigan platforma. Praktik darslar, loyihalar va ko'plab imkoniyatlar sizni kutmoqda!
            </p>
            
            {/* Tugmalar */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setActiveTab("Kurslar")}
              >
                Kurslarni ko'rish
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 transition-all duration-300 px-8 py-3 text-lg font-semibold rounded-full"
                onClick={onProxOfflineClick}
              >
                proX offline
              </Button>
          </div>
        </div>
      </div>

        {/* Grafik element - yuqori o'ng burchakda */}
        <div className="absolute top-8 right-8 w-32 h-32 opacity-20">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <g fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300">
              <circle cx="100" cy="100" r="80" strokeOpacity="0.3" />
              <circle cx="100" cy="100" r="60" strokeOpacity="0.4" />
              <circle cx="100" cy="100" r="40" strokeOpacity="0.5" />
            </g>
            <circle cx="100" cy="100" r="6" fill="currentColor" className="text-cyan-300" />
          </svg>
        </div>
      </div>

      {/* KURSLAR PREVIEW */}
      <CoursesPreview onShowAll={() => setActiveTab("Kurslar")}/>

      {/* Statistika bo'limi - OLIB TASHLANDI */}
      {/* Xizmatlar bo'limi */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Bizning xizmatlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Online kurslar */}
          <div className="group rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-blue-500 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Online kurslar</h3>
            <p className="text-base opacity-80">Zamonaviy texnologiyalar bo'yicha to'liq kurslar va praktik mashg'ulotlar</p>
            </div>
          {/* Loyihalar */}
          <div className="group rounded-2xl p-8 bg-gradient-to-br from-blue-900 via-cyan-500 to-blue-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-tr hover:from-blue-500 hover:to-cyan-500 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              <Code className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Loyihalar</h3>
            <p className="text-base opacity-80">Real loyihalar orqali amaliy tajriba va portfolio yaratish</p>
        </div>
          {/* Mentorlik */}
          <div className="group rounded-2xl p-8 bg-gradient-to-br from-cyan-500 via-blue-900 to-slate-900 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-tr hover:from-blue-500 hover:to-slate-900 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <User className="w-8 h-8" />
      </div>
            <h3 className="text-xl font-bold mb-2">Mentorlik</h3>
            <p className="text-base opacity-80">Tajribali dasturchilar bilan individual maslahat va yo'riqlik</p>
              </div>
              </div>
            </div>

      {/* Afzalliklar bo'limi */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-12 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Nima uchun ProX?</h2>
          <p className="text-xl text-white/80">ProX akademiyasining afzalliklari va imkoniyatlari</p>
              </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Praktik yondashuv */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-white" />
              </div>
            <h3 className="text-xl font-bold text-white mb-2">Praktik yondashuv</h3>
            <p className="text-gray-300">Nazariya emas, real loyihalar orqali o'rganish</p>
            </div>
          {/* Qulay o'rganish */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
          </div>
            <h3 className="text-xl font-bold text-white mb-2">Qulay o'rganish</h3>
            <p className="text-gray-300">O'z tezoringizda va istalgan joydan o'rganish</p>
              </div>
          {/* Zamonaviy texnologiyalar */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-white" />
              </div>
            <h3 className="text-xl font-bold text-white mb-2">Zamonaviy texnologiyalar</h3>
            <p className="text-gray-300">Eng so'nggi va talabgir texnologiyalar</p>
            </div>
          {/* Karyera yordami */}
          <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 transition-colors duration-300">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
              </div>
            <h3 className="text-xl font-bold text-white mb-2">Karyera yordami</h3>
            <p className="text-gray-300">Ish topish va karyera rivojlanishida yordam</p>
          </div>
        </div>
      </div>
    </>
  );
}

function BlogsContent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">Blogs</h2>
      <p className="text-muted-foreground max-w-2xl">
        Markdown asosida bloglar yaratish, o'qish va boshqarish imkoniyati. Tez orada ko'proq bloglar va funksiyalar qo'shiladi!
      </p>
      <div className="rounded-lg border bg-card p-6 text-muted-foreground">
        <span>Bloglar tez orada...</span>
      </div>
    </div>
  );
}

function ResumeBuilderContent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">Resume Builder</h2>
      <p className="text-muted-foreground max-w-2xl">
        Oson va tez professional rezyume tayyorlash uchun qulay vosita. Tez orada ishga tushadi!
      </p>
      <div className="rounded-lg border bg-card p-6 text-muted-foreground">
        <span>Resume builder funksiyasi tez orada...</span>
      </div>
    </div>
  );
}

function MyCoursesContent() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = getJwtToken();
      if (!token) {
        setError("Tizimga kirish kerak");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/enrolled-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses);
      } else {
        setError("Kurslarni yuklashda xatolik yuz berdi");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4">
                <Skeleton className="w-full h-48 rounded-lg" />
        </div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
        </div>
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 mb-4">
          {error}
        </div>
        <Button variant="outline" onClick={loadEnrolledCourses}>
          Qayta urinish
              </Button>
            </div>
    );
  }

  return (
    <>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
            Kurslarim
                </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary"
            onClick={() => {
              // Navigate to courses page
              window.location.href = '/#courses';
            }}
          >
            Barcha kurslar →
                </Button>
              </div>
            </div>

      {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
                <Card
              key={course.id}
                  className="relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-primary/10"
                >
                  <CardContent className="p-0">
                {course.imageUrl ? (
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                        className="w-full h-40 object-cover object-center rounded-t-2xl"
                    />
                ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center rounded-t-2xl">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
                    <div className="p-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">O'qituvchi:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Narxi:</span>
                    <span className="font-medium text-primary">{formatCurrency(course.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Davomiyligi:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                </div>
                
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">O'quvchilar:</span>
                          <span className="font-medium">{course.enrolledStudents}</span>
                  </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">★</span>
                          <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                    {course.level}
                    </Badge>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      window.open(`/learning/${course.id}`, '_blank');
                    }}
                  >
                    Davom etish
                  </Button>
                  </div>
                </div>
                  </CardContent>
                </Card>
              ))}
            </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Hali hech qanday kursga a'zo bo'lmagansiz</p>
          <Button 
            variant="outline" 
            onClick={() => {
              // Navigate to courses page
              window.location.href = '/#courses';
            }}
          >
            Kurslarni ko'rish
          </Button>
        </div>
      )}
    </>
  );
}

function BeautifulCodeContent() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">Beautiful Code</h2>
      <p className="text-muted-foreground max-w-2xl">
        Kodlarni chiroyli va o'qiladigan formatda ko'rsatish uchun maxsus vosita. Tez orada ishga tushadi!
      </p>
      <div className="rounded-lg border bg-card p-6 text-muted-foreground">
        <span>Beautiful code funksiyasi tez orada...</span>
      </div>
    </div>
  );
}

function ProfileContent({ setIsLoggedIn, setActiveTab, setActiveProject }) {
  const [isLoggedIn, setIsLoggedInLocal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "+998",
    password: "",
    confirmPassword: ""
  });


  // Format date function
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

  const loadEnrolledCourses = async () => {
    try {
      const token = getJwtToken();
      if (!token) return;

      const response = await fetch('/api/user/enrolled-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses);
      }
    } catch (error) {
      // Error loading enrolled courses handled silently
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = getJwtToken();
    if (token) {
      checkAuthStatus();
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getJwtToken();
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedInLocal(true);
        setIsLoggedIn(true);
        setUserData(data.user);
        
        // Load enrolled courses
        await loadEnrolledCourses();
        
        // Redirect admin users to admin panel
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
          return;
        }
      } else {
        // Tokenni o'chirmaymiz, faqat foydalanuvchiga xabar chiqamiz
        setIsLoggedInLocal(false);
        setIsLoggedIn(false);
        setUserData(null);
        // Masalan, toast yoki alert bilan xabar berish mumkin
        // toast({ title: "Avtorizatsiya xatosi", description: "Token yaroqsiz yoki foydalanuvchi topilmadi." });
      }
    } catch (error) {
      setIsLoggedInLocal(false);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Format phone number as user types
      let formattedValue = value.replace(/\D/g, ''); // Remove all non-digits
      
      if (formattedValue.startsWith('998')) {
        formattedValue = '+' + formattedValue;
      } else if (formattedValue.startsWith('7')) {
        formattedValue = '+998' + formattedValue;
      } else if (formattedValue.length > 0 && !formattedValue.startsWith('998')) {
        formattedValue = '+998' + formattedValue;
      }
      
      // Add spaces for better readability
      if (formattedValue.length > 4) {
        formattedValue = formattedValue.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
      }
      

      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError("");
  };

  const validateForm = () => {
    // Remove spaces and check if phone number is complete
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 13) {
      setError("Telefon raqam to'liq emas");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Parol kamida 6 ta belgi bo'lishi kerak");
      return false;
    }
    if (!isLoginMode) {
      if (!formData.fullName.trim()) {
        setError("To'liq ism kiritilmagan");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Parollar mos kelmadi");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }



    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const body = isLoginMode 
        ? { phone: formData.phone, password: formData.password }
        : { 
            fullName: formData.fullName, 
            phone: formData.phone, 
            password: formData.password,
            role: "student"
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        // Set JWT token in cookie
        saveJwtToken(data.token);
        setSuccess(data.message);
        setIsLoggedInLocal(true);
        setIsLoggedIn(true);
        setUserData(data.user);
        
        // Redirect admin users to admin panel
        if (data.user.role === 'admin') {
          window.location.href = '/admin';
          return;
        }
        
        // Redirect to profile page
        window.location.hash = '#profile';
        
        // Reset form
        setFormData({
          fullName: "",
          phone: "+998",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeJwtToken();
    setIsLoggedInLocal(false);
    setIsLoggedIn(false);
    setUserData(null);
    setSuccess("");
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <Card>
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

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isLoginMode ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
            </h2>
            <p className="text-muted-foreground">
              {isLoginMode 
                ? "Akkauntingizga kirish uchun ma'lumotlaringizni kiriting"
                : "Yangi akkaunt yaratish uchun ma'lumotlaringizni kiriting"
              }
            </p>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    To'liq ism
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="To'liq ismingiz"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+998"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Parol
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isLoginMode ? "Parolingizni kiriting" : "Parol yarating"}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {!isLoginMode && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Parolni tasdiqlang
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Parolni qayta kiriting"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
              </div>
              )}
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
            </div>
              )}
              
              {success && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <Button
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Kutilmoqda..." : (isLoginMode ? "Tizimga kirish" : "Ro'yxatdan o'tish")}
              </Button>
            </form>

          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              {isLoginMode ? "Sizda hali akkaunt yo'qmi?" : "Akkauntingiz bormi?"}{" "}
              <Button
                variant="link" 
                className="p-0 h-auto text-primary"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError("");
                  setSuccess("");
                  setFormData({
                    fullName: "",
                    phone: "+998",
                    password: "",
                    confirmPassword: ""
                  });
                }}
              >
                {isLoginMode ? "Ro'yxatdan o'ting" : "Tizimga kirish"}
              </Button>
            </p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
              <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Profil</h2>
          <p className="text-muted-foreground max-w-2xl">
            Bu bo'limda siz o'z profil ma'lumotlaringizni ko'rish va tahrirlashingiz mumkin.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Chiqish
                </Button>
              </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Shaxsiy ma'lumotlar</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">To'liq ism:</span>
              <p className="font-medium">{userData?.fullName || "Ma'lumot yo'q"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Telefon:</span>
              <p className="font-medium">{userData?.phone || "Ma'lumot yo'q"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Balans:</span>
              <p className="font-medium text-primary">{userData?.balance || 0} so'm</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Ro'yxatdan o'tgan sana:</span>
              <p className="font-medium text-sm text-muted-foreground">
                {formatDate(userData?.createdAt)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">A'zo bo'lgan kurslar</h3>
          <div className="space-y-2">
            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((course, index) => (
                  <div key={course.id} className="p-3 bg-muted rounded-md">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{course.title}</h4>
                        <p className="text-xs text-muted-foreground">{course.instructor}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-muted-foreground">{course.duration}</span>
                      <span className="text-primary font-medium">
                        {new Intl.NumberFormat('uz-UZ', {
                          style: 'currency',
                          currency: 'UZS',
                          minimumFractionDigits: 0
                        }).format(course.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Hali hech qanday kursga a'zo bo'lmagansiz
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setActiveTab("Kurslar");
                    setActiveProject("");
                  }}
                >
                  Kurslarni ko'rish
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SecurityContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check if user is logged in and load data
  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setDataLoading(true);
    try {
      const token = getJwtToken();
      if (!token) {
        setDataLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData(data.user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setDataLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Yangi parollar mos kelmadi");
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Yangi parol kamida 6 ta belgi bo'lishi kerak");
      setLoading(false);
      return;
    }

    try {
      const token = getJwtToken();
      
      if (!token) {
        setError("Tizimga kirish kerak");
        setLoading(false);
        return;
      }

      console.log('Sending password change request...');
      console.log('Token:', token);
      console.log('Request body:', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setSuccess("Parol muvaffaqiyatli o'zgartirildi");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setShowChangePassword(false);
      } else {
        setError(data.message || "Parol o'zgartirishda xatolik");
      }
    } catch (error) {
      setError("Server bilan bog'lanishda xatolik. Iltimos, serverni ishga tushiring.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while data is being fetched
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Xavfsizlik ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Xavfsizlik</h2>
          <p className="text-muted-foreground">
            Xavfsizlik sozlamalariga kirish uchun tizimga kiring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Xavfsizlik</h2>
          <p className="text-muted-foreground max-w-2xl">
            Bu bo'limda siz o'z akkauntingiz xavfsizligini boshqarishingiz mumkin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parol o'zgartirish */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Parol o'zgartirish</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              {showChangePassword ? "Bekor qilish" : "O'zgartirish"}
            </Button>
          </div>
          
          {showChangePassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Joriy parol
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Joriy parolingizni kiriting"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Yangi parol
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Yangi parol yarating"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Yangi parolni tasdiqlang
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Yangi parolni qayta kiriting"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="text-green-500 text-sm bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <div className="flex gap-2">
              <Button
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Kutilmoqda..." : "Parolni o'zgartirish"}
              </Button>
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                    setError("");
                    setSuccess("");
                  }}
                >
                  Bekor qilish
              </Button>
            </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Parolingizni xavfsiz saqlash uchun muntazam o'zgartiring
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Parol faol</span>
              </div>
            </div>
          )}
                </Card>

        {/* Boshqa qurilmalar */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Boshqa qurilmalar</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Windows 10 - Chrome</p>
                  <p className="text-xs text-muted-foreground">Toshkent, O'zbekiston</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Joriy</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">iPhone 14 - Safari</p>
                  <p className="text-xs text-muted-foreground">Toshkent, O'zbekiston</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                Chiqarish
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">MacBook Pro - Safari</p>
                  <p className="text-xs text-muted-foreground">Toshkent, O'zbekiston</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                Chiqarish
              </Button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="w-full">
              Barcha qurilmalardan chiqish
            </Button>
          </div>
        </Card>
      </div>

      {/* Xavfsizlik maslahatlari */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Xavfsizlik maslahatlari</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-green-600 text-xs font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Kuchli parol ishlatish</h4>
              <p className="text-sm text-muted-foreground">Harflar, raqamlar va belgilar bilan</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-green-600 text-xs font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Ikki bosqichli autentifikatsiya</h4>
              <p className="text-sm text-muted-foreground">Qo'shimcha xavfsizlik uchun</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-1">
              <span className="text-yellow-600 text-xs font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Noma'lum qurilmalarni tekshirish</h4>
              <p className="text-sm text-muted-foreground">Tanish bo'lmagan qurilmalarni chiqarib tashlang</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Muntazam yangilanish</h4>
              <p className="text-sm text-muted-foreground">Parolingizni 3 oyda bir marta o'zgartiring</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PaymentsContent() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'card',
    description: ''
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [monthlyPayments, setMonthlyPayments] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check user authentication and load payment data
  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setDataLoading(true);
    try {
      const token = getJwtToken();
      if (!token) {
        setDataLoading(false);
        return;
      }

      // Load user profile and balance
      const profileResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserBalance(profileData.user.balance || 0);
      }

      // Load payment statistics
      const statsResponse = await fetch('/api/payments/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setTotalPayments(statsData.stats.totalPayments);
        setMonthlyPayments(statsData.stats.monthlyPayments);
      }

      // Load payment history
      const historyResponse = await fetch('/api/payments/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setPaymentHistory(historyData.payments);
      }
    } catch (error) {
      // Error loading payment data handled silently
    } finally {
      setDataLoading(false);
    }
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getJwtToken();
      if (!token) {
        alert('Iltimos, avval tizimga kiring');
        return;
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          description: paymentForm.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('To\'lov muvaffaqiyatli amalga oshirildi!');
        setPaymentForm({
          amount: '',
          paymentMethod: 'card',
          description: ''
        });
        setShowPaymentForm(false);
        loadPaymentData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'To\'lovda xatolik yuz berdi');
      }
    } catch (error) {
      alert('To\'lovda xatolik yuz berdi');
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

  if (dataLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
        </div>
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
              <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">To'lovlar</h2>
          <p className="text-muted-foreground max-w-2xl">
            Bu bo'limda siz to'lovlar tarixini ko'rish va yangi to'lovlar qilishingiz mumkin.
          </p>
        </div>
        <Button 
          variant="default" 
          onClick={() => setShowPaymentForm(true)}
        >
          Yangi to'lov
                </Button>
              </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="secondary">Joriy</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">Joriy balans</h3>
          <p className="text-3xl font-bold text-primary mb-2">{formatCurrency(userBalance)}</p>
          <p className="text-sm text-muted-foreground">Oxirgi yangilanish: bugun</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="outline">Umumiy</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">Umumiy to'lovlar</h3>
          <p className="text-3xl font-bold text-primary mb-2">{formatCurrency(totalPayments)}</p>
          <p className="text-sm text-muted-foreground">Barcha vaqtlar bo'yicha</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <Badge variant="outline">Bu oy</Badge>
          </div>
          <h3 className="text-lg font-semibold mb-2">Bu oy to'lovlar</h3>
          <p className="text-3xl font-bold text-primary mb-2">{formatCurrency(monthlyPayments)}</p>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })}</p>
        </Card>
      </div>

      {/* Enhanced Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-ultra-thin">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Yangi to'lov</h3>
                  <p className="text-sm text-white/70">Hisobni to'ldirish</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group"
              >
                <X className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors duration-300" />
              </button>
            </div>

            {/* Card Information Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">To'lov kartasi</h4>
                  <p className="text-sm text-white/70">Quyidagi kartaga to'lov qiling</p>
                </div>
              </div>
              
              {/* Card Number Display */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Karta raqami</p>
                    <p className="text-lg font-mono font-bold text-white tracking-wider">
                      8600 1234 5678 9012
                    </p>
                  </div>
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">UZCARD</span>
                  </div>
                </div>
              </div>

              {/* Admin Contact Button */}
              <a
                href="https://t.me/proxacademy_admin"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.268 8.368-1.268 8.368-.159.708-.534.708-.534.708s-2.697-.217-3.613-.217c0 0-1.604-.217-1.604-.217-.534-.159-.534-.708-.534-.708s.159-1.066.159-1.066l3.059-2.697s.217-.159.217-.375c0-.217-.217-.217-.217-.217l-3.613 2.055s-.708.375-1.066.375c-.375 0-.708-.375-.708-.375s-.375-1.066-.375-1.066 3.059-13.456 3.059-13.456c.159-.708.708-.708.708-.708s1.066.217 1.066.217 8.368 3.059 8.368 3.059c.708.217.708.708.708.708z"/>
                </svg>
                Admin bilan bog'lanish
              </a>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                To'lov qilish tartibi
              </h5>
              <ol className="text-sm text-white/80 space-y-1 list-decimal list-inside">
                <li>Yuqoridagi karta raqamiga kerakli miqdorda to'lov qiling</li>
                <li>To'lov chekini surat qilib oling</li>
                <li>"Admin bilan bog'lanish" tugmasini bosing</li>
                <li>Telegramda chekni adminga yuboring</li>
                <li>Admin tasdiqlashidan keyin hisobingiz to'ldiriladi</li>
              </ol>
            </div>
            
            {/* Payment Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-6">

              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading || !paymentForm.amount}
                  className={`flex-1 px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                    loading || !paymentForm.amount
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                  }`}
                >
                  {loading ? 'Jarayonda...' : 'To\'lovni tasdiqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">To'lovlar tarixi</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Hisobot yuklash
          </Button>
        </div>
        
        <div className="space-y-4">
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.description || 'To\'lov'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{formatCurrency(payment.amount)}</p>
                    <Badge variant="outline" className="text-xs">
                      {payment.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Hali hech qanday to'lov qilmagansiz</p>
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentForm(true)}
              >
                Birinchi to'lovni qiling
              </Button>
            </div>
          )}
        </div>
                </Card>
    </div>
  );
}

export function MobileNavbar({ activeTab, setActiveTab, activeProject, setActiveProject, isLoggedIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = (title) => {
    setActiveTab(title);
    setActiveProject("");
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProjectClick = (project) => {
    setActiveTab("Loyihalar");
    setActiveProject(project);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden">
      {/* Mobile Navbar - Enhanced */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-700 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo Section - Enhanced */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white tracking-tight">
                ProX
              </span>
              <span className="text-xs text-cyan-300 font-medium">
                Academy
              </span>
            </div>
          </div>

          {/* Menu Button - Enhanced */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative w-12 h-12 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group"
          >
            <Menu className={`w-6 h-6 text-white transition-all duration-300 ${isMenuOpen ? 'rotate-90 text-cyan-400' : 'group-hover:text-cyan-400'}`} />
          </button>
        </div>
      </div>

      {/* Overlay - Background dimming when drawer is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer - Enhanced */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Drawer Header - Enhanced */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white tracking-tight">ProX</span>
              <span className="text-xs text-cyan-300 font-medium">Academy</span>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-600/50 hover:border-cyan-500/50 group"
          >
            <X className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors duration-300" />
          </button>
        </div>

        {/* Drawer Content - Enhanced */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Asosiy menyu */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-cyan-400 rounded-full"></div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                ASOSIY
              </h3>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === item.title && !activeProject
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                  onClick={() => handleMenuClick(item.title)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                  {activeTab === item.title && !activeProject && (
                    <div className="w-2 h-2 bg-cyan-300 rounded-full ml-auto"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

            {/* User specific menu items - only show when logged in */}
            {isLoggedIn && (
            <div className="space-y-2 pt-4 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Mening kurslarim
                </h3>
                {userMenuItems.map((item) => (
                  <Button
                    key={item.title}
                    variant={activeTab === item.title && !activeProject ? "secondary" : "ghost"}
                  className="w-full justify-start h-12"
                    onClick={() => handleMenuClick(item.title)}
                  >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="text-base">{item.title}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Sozlamalar */}
          <div className="space-y-2 pt-4 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Sozlamalar
              </h3>
              <Button
                variant={activeProject === "Blogs" ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
                onClick={() => handleProjectClick("Blogs")}
              >
              <User className="w-5 h-5 mr-3" />
              <span className="text-base">Profil</span>
              </Button>
              <Button
                variant={activeProject === "Resume Builder" ? "secondary" : "ghost"}
              className="w-full justify-start h-12"
                onClick={() => handleProjectClick("Resume Builder")}
              >
              <Settings className="w-5 h-5 mr-3" />
              <span className="text-base">Xavfsizlik</span>
              </Button>
              {isLoggedIn && (
                <Button
                  variant={activeProject === "Payments" ? "secondary" : "ghost"}
                className="w-full justify-start h-12"
                  onClick={() => handleProjectClick("Payments")}
                >
                <CreditCard className="w-5 h-5 mr-3" />
                <span className="text-base">To'lovlar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}

function ProxOffline() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch('/api/offline-students');
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

  // Helper to get current week dates
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

  return (
    <div className="w-full animate-fade-in pb-16">
      {!selectedUser ? (
        <>
          {/* Modern Hero Section */}
          <div className="relative min-h-[70vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/60 to-slate-900/80"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-32 h-32 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300">
                  <circle cx="100" cy="100" r="80" strokeOpacity="0.3" />
                  <circle cx="100" cy="100" r="60" strokeOpacity="0.4" />
                  <circle cx="100" cy="100" r="40" strokeOpacity="0.5" />
                </g>
                <circle cx="100" cy="100" r="6" fill="currentColor" className="text-cyan-300" />
              </svg>
            </div>
            
            {/* Content container */}
            <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[70vh]">
              <div className="max-w-4xl text-center">
                {/* Main heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                  ProX -{" "}
                  <span className="text-cyan-300">
                    offline filiallari
                  </span>
                </h1>
                
                {/* Description */}
                <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-3xl leading-relaxed">
                  ProX offline filiallarida zamonaviy va sifatli ta'lim, qulay joylashuv va do'stona muhit kutmoqda! 
                  Barcha offline o'quvchilar ro'yxati quyida keltirilgan.
                </p>
                
                {/* Search section */}
                <div className="mb-8 w-full max-w-md mx-auto relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <Input
                    placeholder="O'quvchini qidirish..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-cyan-400 transition-all duration-300"
                  />
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            </div>
                ) : error ? (
                  <div className="text-center text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">
                    {error}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center text-white/80 bg-white/10 p-8 rounded-xl backdrop-blur-sm">
                    Offline o'quvchilar topilmadi
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Students List Section - Modern Design */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="bg-background py-16">
              <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Offline O'quvchilar
                    </h2>
                    <p className="text-muted-foreground">
                      Bizning offline filiallarimizda o'qiyotgan talabalar ro'yxati
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="group bg-card border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-bold text-lg">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                              {user.fullName}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="w-3 h-3" /> {user.phone}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                            Offline Student
                          </span>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full animate-fade-in pb-16">
          {/* Student Detail Hero Section */}
          <div className="relative min-h-[60vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/60 to-slate-900/80"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-20 right-20 w-32 h-32 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300">
                  <circle cx="100" cy="100" r="80" strokeOpacity="0.3" />
                  <circle cx="100" cy="100" r="60" strokeOpacity="0.4" />
                  <circle cx="100" cy="100" r="40" strokeOpacity="0.5" />
                </g>
                <circle cx="100" cy="100" r="6" fill="currentColor" className="text-cyan-300" />
              </svg>
            </div>
            
            {/* Back button */}
            <div className="absolute top-8 left-8 z-20">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedUser(null)}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Orqaga</span>
              </button>
            </div>
            
            {/* Content container */}
            <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
              <div className="max-w-4xl text-center mb-12">
                {/* Student Avatar */}
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-4xl">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Student Name */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                  {selectedUser.fullName}
                </h1>
                
                {/* Phone */}
                <p className="text-lg sm:text-xl text-white/90 mb-8 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  {selectedUser.phone}
                </p>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  {/* Step Card */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <BarChart2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{selectedUser.step ?? 1}</div>
                    <div className="text-white/80 font-medium">Qadam</div>
                  </div>

                  {/* Weekly Score Card */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {getCurrentWeekDates().reduce((sum, day) => {
                        const found = (selectedUser.todayScores || []).find(s => s.date === day.date);
                        return sum + (found ? found.score : 0);
                      }, 0)}
                    </div>
                    <div className="text-white/80 font-medium">Haftalik ball</div>
                  </div>

                  {/* Total Score Card */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <ChartBar className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {(selectedUser.todayScores || []).reduce((sum, s) => sum + (s.score || 0), 0)}
                    </div>
                    <div className="text-white/80 font-medium">Jami ball</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Chart Section */}
          <div className="bg-background py-16">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Haftalik Statistika
                  </h2>
                  <p className="text-muted-foreground">
                    O'quvchining haftalik ball dinamikasi
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-foreground mb-6">Haftalik ballar</h3>
                  <div className="flex items-end justify-center gap-4 h-40 w-full bg-muted/20 rounded-xl p-6">
                    {getCurrentWeekDates().map((day, idx) => {
                      const found = (selectedUser.todayScores || []).find(s => s.date === day.date);
                      const point = found ? found.score : 0;
                      const max = Math.max(...getCurrentWeekDates().map(d => {
                        const f = (selectedUser.todayScores || []).find(s => s.date === d.date);
                        return f ? f.score : 0;
                      }));
                      
                      const today = new Date();
                      const dayDate = new Date(day.iso);
                      today.setHours(0,0,0,0);
                      dayDate.setHours(0,0,0,0);
                      const isPastOrToday = dayDate.getTime() <= today.getTime();
                      const isBadDay = isPastOrToday && point < 7;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1">
                          <div className="text-sm font-semibold text-foreground mb-2">{point}</div>
                          <div
                            className={`w-8 rounded-t-xl transition-all duration-300 hover:scale-110 ${
                              isBadDay 
                                ? 'bg-gradient-to-t from-red-500 to-red-400 shadow-lg shadow-red-500/30' 
                                : point === max && point > 0 
                                  ? 'bg-gradient-to-t from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30' 
                                  : 'bg-gradient-to-t from-slate-400 to-slate-300'
                            }`}
                            style={{ height: `${Math.max(point * 8, 8)}px` }}
                          ></div>
                          <span className="text-sm font-medium text-foreground mt-3">{day.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Bad Days Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Weekly Bad Days */}
                    <div className="bg-gradient-to-r from-red-500/10 to-red-400/10 border border-red-500/20 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-500 to-red-400 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {getCurrentWeekDates().filter(day => {
                          const found = (selectedUser.todayScores || []).find(s => s.date === day.date);
                          const point = found ? found.score : 0;
                          const today = new Date();
                          const dayDate = new Date(day.iso);
                          today.setHours(0,0,0,0);
                          dayDate.setHours(0,0,0,0);
                          const isPastOrToday = dayDate.getTime() <= today.getTime();
                          return isPastOrToday && point < 7;
                        }).length}
                      </div>
                      <div className="text-sm font-medium text-red-700">Haftalik yomon kunlar soni</div>
                    </div>

                    {/* Monthly Bad Days */}
                    <div className="bg-gradient-to-r from-orange-500/10 to-orange-400/10 border border-orange-500/20 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-2">
                        {(() => {
                          const now = new Date();
                          const currentMonth = now.getMonth();
                          const currentYear = now.getFullYear();
                          const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
                          const currentMonthName = months[currentMonth];
                          
                          return (selectedUser.todayScores || []).filter(scoreEntry => {
                            const score = scoreEntry.score || 0;
                            if (score >= 7) return false;
                            
                            // Parse the date from scoreEntry.date (format: "day-month")
                            const dateParts = scoreEntry.date.split('-');
                            if (dateParts.length !== 2) return false;
                            
                            const day = parseInt(dateParts[0]);
                            const monthName = dateParts[1];
                            
                            // Check if this entry is from current month
                            if (monthName !== currentMonthName) return false;
                            
                            // Check if this date is past or today
                            const scoreDate = new Date(currentYear, currentMonth, day);
                            scoreDate.setHours(0,0,0,0);
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            
                            return scoreDate.getTime() <= today.getTime();
                          }).length;
                        })()}
                      </div>
                      <div className="text-sm font-medium text-orange-700">Oylik yomon kunlar soni</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesPreview({ onShowAll }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('/api/courses?limit=3')
      .then(res => res.json())
      .then(data => setCourses(data.courses || []))
      .catch(() => setError("Kurslarni yuklashda xatolik yuz berdi"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-12">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
                  <CardContent className="p-6">
              <Skeleton className="w-full h-40 rounded-t-2xl mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
                  </CardContent>
          </Card>
        ))}
        </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-500 my-12">{error}</div>;
  }
    return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Kurslar</h2>
            <Button
              variant="link"
          className="text-cyan-300 text-lg p-0 h-auto hover:text-cyan-200 transition-colors duration-200" 
          onClick={onShowAll}
            >
          Barchasini ko'rish →
            </Button>
          </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-105"
          >
                    {course.imageUrl ? (
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                className="w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-20 h-20 text-white" />
                      </div>
                    )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-200">
                {course.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2 group-hover:text-gray-200 transition-colors duration-200">
                {course.description}
                    </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-cyan-300 text-sm font-medium">Kursni ko'rish</span>
                        </div>
                <div 
                  className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowAll();
                  }}
                        >
                  <span className="text-white text-xs">→</span>
                      </div>
                    </div>
              </div>
          </div>
        ))}
            </div>
      </div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Bosh sahifa");
  const [activeProject, setActiveProject] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Check if user is logged in and handle URL hash
  useEffect(() => {
    const token = getJwtToken();
    if (token) {
      setIsLoggedIn(true);
      // Get user data from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserData({
          fullName: payload.fullName || 'Foydalanuvchi',
          phone: payload.phone || ''
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        setUserData({
          fullName: 'Foydalanuvchi',
          phone: ''
        });
      }
    }
    
    // Handle URL hash or path for profile/login redirect
    const handleHashOrPathChange = () => {
      if (window.location.hash === '#profile') {
        setActiveTab("Loyihalar");
        setActiveProject("Blogs");
        // Clear the hash
        window.history.replaceState(null, '', window.location.pathname);
      } else if (window.location.hash === '#courses') {
        setActiveTab("Kurslar");
        setActiveProject("");
        window.history.replaceState(null, '', window.location.pathname);
      } else if (
        window.location.hash === '#login' ||
        window.location.pathname.endsWith('/login')
      ) {
        setActiveTab("Loyihalar");
        setActiveProject("Blogs");
        // Clear the hash or path if needed
        if (window.location.hash === '#login') {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };
    
    // Check hash/path on initial load
    handleHashOrPathChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashOrPathChange);
    // Listen for path changes (popstate)
    window.addEventListener('popstate', handleHashOrPathChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashOrPathChange);
      window.removeEventListener('popstate', handleHashOrPathChange);
    };
  }, []);

  // Scroll to top when activeTab changes
  useEffect(() => {
    scrollToTop();
  }, [activeTab, activeProject]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSidebarMenuClick = (title) => {
    setActiveTab(title);
    setActiveProject("");
    scrollToTop();
  };

  const handleProjectMenuClick = (project) => {
    setActiveTab("Loyihalar");
    setActiveProject(project);
    scrollToTop();
  };

  const handleProxOfflineClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab("proX offline");
      setIsLoading(false);
    }, 700);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        {/* Mobile Navbar */}
        <MobileNavbar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          isLoggedIn={isLoggedIn}
        />

        {/* Desktop Sidebar - Rasmdagidek dizayn */}
        <div className="hidden md:block">
          <div className="w-64 h-full bg-slate-900 border-r border-slate-700 flex flex-col">
            {/* Logo Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
              </div>
                <span className="text-white font-bold text-lg">ProX</span>
              </div>
            </div>

            {/* Menu Content */}
            <div className="flex-1 p-4 space-y-6">
              {/* MENU Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider">MENU</h3>
                </div>
                <div className="space-y-1">
                {menuItems.map((item) => (
                    <button
                      key={item.title}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        activeTab === item.title && !activeProject
                          ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white'
                          : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      onClick={() => handleSidebarMenuClick(item.title)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.title}</span>
                      {activeTab === item.title && !activeProject && (
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full ml-auto"></div>
                      )}
                    </button>
                ))}
                </div>
              </div>

              {/* User specific menu items - only show when logged in */}
              {isLoggedIn && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                    <h3 className="text-white font-semibold text-xs uppercase tracking-wider">Mening kurslarim</h3>
                  </div>
                  <div className="space-y-1">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.title}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          activeTab === item.title && !activeProject
                            ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white'
                            : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}
                          onClick={() => handleSidebarMenuClick(item.title)}
                        >
                          <item.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SOZLAMALAR Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider">SOZLAMALAR</h3>
                </div>
                <div className="space-y-1">
                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeProject === "Blogs"
                        ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                      onClick={() => handleProjectMenuClick("Blogs")}
                    >
                      <User className="w-4 h-4" />
                    <span className="font-medium text-sm">Profil</span>
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeProject === "Resume Builder"
                        ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                      onClick={() => handleProjectMenuClick("Resume Builder")}
                    >
                      <Settings className="w-4 h-4" />
                    <span className="font-medium text-sm">Xavfsizlik</span>
                  </button>
                  {isLoggedIn && (
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        activeProject === "Payments"
                          ? 'bg-gradient-to-r from-slate-800 to-purple-900 text-white'
                          : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                      }`}
                        onClick={() => handleProjectMenuClick("Payments")}
                      >
                        <CreditCard className="w-4 h-4" />
                      <span className="font-medium text-sm">To'lovlar</span>
                    </button>
                  )}
              </div>
              </div>
        </div>

            {/* User Profile - Bottom */}
            {isLoggedIn && userData && (
              <div className="p-4 border-t border-slate-700">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-xs truncate">
                        {userData.fullName}
                      </div>
                      <div className="text-gray-400 text-xs">Online</div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <SidebarInset className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 md:pt-4 pt-28 pb-16">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            {!isLoading && activeTab === "Bosh sahifa" && <HomeContent setActiveTab={setActiveTab} onProxOfflineClick={handleProxOfflineClick} />}
            {activeTab === "Kurslar" && <CoursesList />}
            {activeTab === "Kurslarim" && <MyCoursesContent />}
            {activeTab === "Loyihalar" && !activeProject && <ProjectsList />}
            {activeTab === "Loyihalar" && activeProject === "Blogs" && <ProfileContent setIsLoggedIn={setIsLoggedIn} setActiveTab={setActiveTab} setActiveProject={setActiveProject} />}
            {activeTab === "Loyihalar" && activeProject === "Resume Builder" && <SecurityContent />}
            {activeTab === "Loyihalar" && activeProject === "Payments" && <PaymentsContent />}
            {!isLoading && activeTab === "proX offline" && <ProxOffline />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}