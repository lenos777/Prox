import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PlayCircle, ChevronDown, ChevronRight, Menu, ChevronLeft, ChevronRight as ChevronRightNav, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUser";

const PRIMARY_COLOR = 'var(--primary, #4169E1)';
const MAIN_BG = 'var(--background, #0b1324)';

export default function Learning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [modules, setModules] = useState<any[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, any[]>>({});
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function getJwt() {
    return document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
  }

  // Navigation helper functions
  const getCurrentLessonIndex = () => {
    if (!selectedModuleId || !selectedLesson || !lessonsByModule[selectedModuleId]) {
      return -1;
    }
    const lessons = lessonsByModule[selectedModuleId];
    return lessons.findIndex(lesson =>
      (selectedLesson._id && lesson._id && selectedLesson._id === lesson._id) ||
      (selectedLesson.id && lesson.id && selectedLesson.id === lesson.id)
    );
  };

  const goToPreviousLesson = () => {
    if (!selectedModuleId || !lessonsByModule[selectedModuleId]) return;

    const lessons = lessonsByModule[selectedModuleId];
    const currentIndex = getCurrentLessonIndex();

    if (currentIndex > 0) {
      setSelectedLesson(lessons[currentIndex - 1]);
    }
  };

  const goToNextLesson = () => {
    if (!selectedModuleId || !lessonsByModule[selectedModuleId]) return;

    const lessons = lessonsByModule[selectedModuleId];
    const currentIndex = getCurrentLessonIndex();

    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      setSelectedLesson(lessons[currentIndex + 1]);
    }
  };

  const canGoPrevious = () => {
    const currentIndex = getCurrentLessonIndex();
    return currentIndex > 0;
  };

  const canGoNext = () => {
    if (!selectedModuleId || !lessonsByModule[selectedModuleId]) return false;
    const lessons = lessonsByModule[selectedModuleId];
    const currentIndex = getCurrentLessonIndex();
    return currentIndex >= 0 && currentIndex < lessons.length - 1;
  };

  useEffect(() => {
    async function fetchModules() {
      setLoadingModules(true);
      setError("");
      try {
        const token = getJwt();
        const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setModules(data.modules);
          if (data.modules.length > 0) {
            setOpenModuleId(data.modules[0]._id || data.modules[0].id);
            setSelectedModuleId(data.modules[0]._id || data.modules[0].id);
          }
        } else {
          setError(data.message || "Modullarni yuklashda xatolik");
        }
      } catch {
        setError("Modullarni yuklashda xatolik");
      } finally {
        setLoadingModules(false);
      }
    }
    fetchModules();
  }, [courseId]);

  useEffect(() => {
    if (!selectedModuleId) return;
    if (lessonsByModule[selectedModuleId]) return;
    async function fetchLessons() {
      setLoadingLessons(prev => ({ ...prev, [selectedModuleId]: true }));
      try {
        const token = getJwt();
        const res = await fetch(`/api/admin/modules/${selectedModuleId}/lessons`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLessonsByModule(prev => ({ ...prev, [selectedModuleId]: data.lessons }));
          if (data.lessons.length > 0) {
            setSelectedLesson(data.lessons[0]);
          } else {
            setSelectedLesson(null);
          }
        }
      } catch { }
      setLoadingLessons(prev => ({ ...prev, [selectedModuleId]: false }));
    }
    fetchLessons();
  }, [selectedModuleId]);

  return (
    <div className="flex w-full min-h-screen bg-background text-foreground">
      {/* Sidebar: DESKTOP */}
      <aside
        className="hidden md:flex flex-col w-64 h-full bg-slate-900 border-r border-slate-700 justify-between fixed top-0 left-0 bottom-0 z-30"
      >
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
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider">MODULLAR</h3>
            </div>
            <div className="space-y-1">
              {loadingModules ? (
                <div className="px-2 py-2 text-sm text-gray-400">Yuklanmoqda...</div>
              ) : error ? (
                <div className="px-2 py-2 text-sm text-red-400">{error}</div>
              ) : modules.length === 0 ? (
                <div className="px-2 py-2 text-sm text-gray-400">Modullar topilmadi</div>
              ) : (
                modules.map((mod, idx) => {
                  const modId = mod._id || mod.id;
                  const isOpen = openModuleId === modId;
                  return (
                    <div key={modId}>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-2 text-left font-medium rounded-lg transition-all duration-200 ${isOpen ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                        onClick={() => {
                          setOpenModuleId(isOpen ? null : modId);
                          setSelectedModuleId(modId);
                        }}
                        aria-expanded={isOpen}
                        aria-controls={`module-${modId}`}
                      >
                        <span>{idx + 1}-Modul. {mod.title}</span>
                        {isOpen ? <ChevronDown className="w-5 h-5 text-cyan-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </button>
                      {isOpen && (
                        <div className="pl-4 pt-0.5 pb-0.5 flex flex-col gap-1">
                          {(loadingLessons[modId]) ? (
                            <div className="text-xs px-2 text-gray-400">Yuklanmoqda...</div>
                          ) : lessonsByModule[modId] && lessonsByModule[modId].length > 0 ? (
                            lessonsByModule[modId].map((lesson) => {
                              const isActive = selectedLesson && ((selectedLesson._id && lesson._id && selectedLesson._id === lesson._id) || (selectedLesson.id && lesson.id && selectedLesson.id === lesson.id));
                              return (
                                <button
                                  key={lesson._id || lesson.id}
                                  className={`w-full flex flex-row items-center gap-2 py-1 px-2 text-base rounded-md transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-300 font-semibold' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                                  onClick={() => {
                                    setSelectedModuleId(modId);
                                    setSelectedLesson(lesson);
                                  }}
                                  aria-current={isActive ? 'true' : undefined}
                                >
                                  <PlayCircle className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-gray-400'}`} />
                                  <span>{lesson.title}</span>
                                </button>
                              );
                            })
                          ) : (
                            <div className="text-xs px-2 text-gray-400">Darslar topilmadi</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        {/* User Info - Bottom */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {userLoading ? "..." : user ? user.fullName.charAt(0).toUpperCase() : "P"}
                </span>
              </div>
              <div className="flex-1">
                {userLoading ? (
                  <>
                    <Skeleton className="h-3 w-16 mb-1 rounded" />
                    <Skeleton className="h-2 w-12 rounded" />
                  </>
                ) : user ? (
                  <>
                    <div className="text-white font-semibold text-xs truncate">{user.fullName}</div>
                    <div className="text-gray-400 text-xs">Online</div>
                  </>
                ) : (
                  <>
                    <div className="text-white font-semibold text-xs truncate">ProX Student</div>
                    <div className="text-gray-400 text-xs">Online</div>
                  </>
                )}
              </div>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </aside>
      {/* Sidebar: MOBILE OFFCANVAS */}
      <button
        className="fixed md:hidden top-4 left-4 z-50 bg-transparent text-[var(--primary)] p-3 rounded-full flex items-center justify-center transition-all hover:bg-[#4169e11a] focus:bg-[#4169e11a]"
        style={{ width: 48, height: 48 }}
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Modullarni ochish"
      >
        <Menu className="w-6 h-6 text-cyan-400" />
      </button>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)}></div>
          <aside className="fixed top-0 left-0 bottom-0 w-4/5 max-w-xs h-full bg-slate-900 border-r border-slate-700 flex flex-col justify-between py-4 shadow-2xl animate-slide-in-left z-50">
            <div>
              <div className="px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">P</span>
                </div>
                <span className="text-white font-bold text-lg">ProX</span>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-cyan-400 rounded-full"></div>
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider">MODULLAR</h3>
                </div>
                {loadingModules ? (
                  <div className="px-2 py-2 text-sm text-gray-400">Yuklanmoqda...</div>
                ) : error ? (
                  <div className="px-2 py-2 text-sm text-red-400">{error}</div>
                ) : modules.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-gray-400">Modullar topilmadi</div>
                ) : (
                  modules.map((mod, idx) => {
                    const modId = mod._id || mod.id;
                    const isOpen = openModuleId === modId;
                    return (
                      <div key={modId}>
                        <button
                          className={`w-full flex items-center justify-between px-3 py-2 text-left font-medium rounded-lg transition-all duration-200 ${isOpen ? 'bg-gradient-to-r from-slate-800 to-cyan-900 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                          onClick={() => {
                            setOpenModuleId(isOpen ? null : modId);
                            setSelectedModuleId(modId);
                          }}
                          aria-expanded={isOpen}
                          aria-controls={`module-${modId}`}
                        >
                          <span>{idx + 1}-Modul. {mod.title}</span>
                          {isOpen ? <ChevronDown className="w-5 h-5 text-cyan-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </button>
                        {isOpen && (
                          <div className="pl-4 pt-0.5 pb-0.5 flex flex-col gap-1">
                            {(loadingLessons[modId]) ? (
                              <div className="text-xs px-2 text-gray-400">Yuklanmoqda...</div>
                            ) : lessonsByModule[modId] && lessonsByModule[modId].length > 0 ? (
                              lessonsByModule[modId].map((lesson) => {
                                const isActive = selectedLesson && ((selectedLesson._id && lesson._id && selectedLesson._id === lesson._id) || (selectedLesson.id && lesson.id && selectedLesson.id === lesson.id));
                                return (
                                  <button
                                    key={lesson._id || lesson.id}
                                    className={`w-full flex flex-row items-center gap-2 py-1 px-2 text-base rounded-md transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-300 font-semibold' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                                    onClick={() => {
                                      setSelectedModuleId(modId);
                                      setSelectedLesson(lesson);
                                      setMobileSidebarOpen(false);
                                    }}
                                    aria-current={isActive ? 'true' : undefined}
                                  >
                                    <PlayCircle className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-gray-400'}`} />
                                    <span>{lesson.title}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="text-xs px-2 text-gray-400">Darslar topilmadi</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            {/* User Info - Bottom */}
            <div className="p-4 border-t border-slate-700">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {userLoading ? "..." : user ? user.fullName.charAt(0).toUpperCase() : "P"}
                    </span>
                  </div>
                  <div className="flex-1">
                    {userLoading ? (
                      <>
                        <Skeleton className="h-3 w-16 mb-1 rounded" />
                        <Skeleton className="h-2 w-12 rounded" />
                      </>
                    ) : user ? (
                      <>
                        <div className="text-white font-semibold text-xs truncate">{user.fullName}</div>
                        <div className="text-gray-400 text-xs">Online</div>
                      </>
                    ) : (
                      <>
                        <div className="text-white font-semibold text-xs truncate">ProX Student</div>
                        <div className="text-gray-400 text-xs">Online</div>
                      </>
                    )}
                  </div>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 bg-background">
        {/* Navbar - Only visible on mobile */}
        <nav className="flex md:hidden items-center justify-between w-full px-8 py-4 border-b bg-card border-border">
          {/* Empty space for balance */}
          <div className="w-10 h-10"></div>

          {/* User info - centered */}
          <div className="flex items-center justify-center h-full">
            {userLoading ? (
              <Skeleton className="h-8 w-32 rounded-lg" />
            ) : user ? (
              <div className="text-center">
                <h1 className="font-bold text-xl tracking-wide text-foreground">
                  {user.fullName}
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Online
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="font-bold text-xl tracking-wide text-foreground">
                  ProX Student
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Online
                </p>
              </div>
            )}
          </div>

          {/* Home button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label="Bosh sahifaga o'tish"
          >
            <Home className="w-5 h-5 text-white" />
          </button>
        </nav>
        {/* Video */}
        <div className="flex flex-col items-center justify-center w-full px-4 py-8">
          <div className="w-full max-w-3xl aspect-video rounded-2xl flex items-center justify-center mb-8 border shadow-2xl overflow-hidden bg-card border-border">
            {selectedModuleId && loadingLessons[selectedModuleId] ? (
              <Skeleton className="w-full h-full rounded-2xl" />
            ) : selectedLesson && selectedLesson.videoUrl ? (
              <video
                src={selectedLesson.videoUrl}
                controls
                className="w-full h-full rounded-2xl"
                poster={selectedLesson.posterUrl || undefined}
                style={{ background: MAIN_BG }}
                preload="metadata"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Video yuklashda xatolik:', e);
                  console.log('Video URL:', selectedLesson.videoUrl);
                }}
                onLoadStart={() => console.log('Video yuklash boshlandi')}
                onCanPlay={() => console.log('Video ijro qilishga tayyor')}
              >
                <source src={selectedLesson.videoUrl} type="video/mp4" />
                <source src={selectedLesson.videoUrl} type="video/webm" />
                <source src={selectedLesson.videoUrl} type="video/ogg" />
                Sizning brauzeringiz video formatini qo'llab-quvvatlamaydi.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg text-muted-foreground">Video mavjud emas</div>
            )}
          </div>
          {/* Video ma'lumotlari */}
          <div className="w-full max-w-3xl rounded-xl p-6 border shadow-md bg-card border-border mb-6">
            {selectedModuleId && loadingLessons[selectedModuleId] ? (
              <>
                <Skeleton className="h-8 w-1/2 mb-2 rounded" />
                <Skeleton className="h-4 w-full mb-2 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 text-primary">{selectedLesson ? selectedLesson.title : "Dars nomi"}</h2>
                <p className="text-base text-muted-foreground">{selectedLesson && selectedLesson.description ? selectedLesson.description : "Dars haqida ma'lumotlar bu yerda ko'rsatiladi."}</p>
              </>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="w-full max-w-3xl flex justify-between items-center gap-4">
            <button
              onClick={goToPreviousLesson}
              disabled={!canGoPrevious()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${canGoPrevious()
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Oldingi</span>
            </button>

            <button
              onClick={goToNextLesson}
              disabled={!canGoNext()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${canGoNext()
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              <span>Keyingi</span>
              <ChevronRightNav className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 