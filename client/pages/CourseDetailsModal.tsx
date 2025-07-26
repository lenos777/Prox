import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJwtToken } from "@/lib/cookie";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function CourseDetailsModal({ course, loading, error, onClose, onReloadCourses }) {
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState("");
  const [editModule, setEditModule] = useState(null);
  const [editModuleForm, setEditModuleForm] = useState({ title: "", description: "", order: 0 });
  const [editModuleLoading, setEditModuleLoading] = useState(false);
  const [editModuleError, setEditModuleError] = useState("");
  const [editLesson, setEditLesson] = useState(null);
  const [editLessonForm, setEditLessonForm] = useState({ title: "", description: "", videoUrl: "", codeSourceUrl: "", order: 0 });
  const [editLessonLoading, setEditLessonLoading] = useState(false);
  const [editLessonError, setEditLessonError] = useState("");
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [localStatus, setLocalStatus] = useState(course?.status || "draft");
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [addModuleLoading, setAddModuleLoading] = useState(false);
  const [addModuleError, setAddModuleError] = useState("");
  const [addLessonModuleId, setAddLessonModuleId] = useState(null);
  const [newLesson, setNewLesson] = useState({ title: "", description: "", videoUrl: "", codeSourceUrl: "" });
  const [addLessonLoading, setAddLessonLoading] = useState(false);
  const [addLessonError, setAddLessonError] = useState("");

  // Modulni tahrirlash modalini ochish
  const handleEditModule = (mod) => {
    setEditModule(mod);
    setEditModuleForm({
      title: mod.title,
      description: mod.description,
      order: mod.order || 0
    });
    setEditModuleError("");
  };
  // Modulni tahrirlashni saqlash
  const handleUpdateModule = async () => {
    if (!editModuleForm.title) {
      setEditModuleError("Modul nomi majburiy");
      return;
    }
    setEditModuleLoading(true);
    setEditModuleError("");
    try {
      const token = getJwtToken();
      const res = await fetch(`/api/admin/courses/${editModule.courseId}/modules/${editModule._id || editModule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editModuleForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditModule(null);
        // Modullarni yangilash uchun qayta yuklash
        reloadModules();
      } else {
        setEditModuleError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setEditModuleError("Server bilan bog'lanishda xatolik");
    } finally {
      setEditModuleLoading(false);
    }
  };
  // Modulni o'chirish
  const handleDeleteModule = async (mod) => {
    if (!window.confirm(`Modulni o'chirishni tasdiqlaysizmi? (${mod.title})`)) return;
    try {
      const token = getJwtToken();
      const res = await fetch(`/api/admin/courses/${mod.courseId}/modules/${mod._id || mod.id}`, {
        method: "DELETE",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success) {
        reloadModules();
      } else {
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch {
      alert("Server bilan bog'lanishda xatolik");
    }
  };
  // Darsni tahrirlash modalini ochish
  const handleEditLesson = (lesson) => {
    setEditLesson(lesson);
    setEditLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      codeSourceUrl: lesson.codeSourceUrl || "",
      order: lesson.order || 0
    });
    setEditLessonError("");
  };
  // Darsni yangilash
  const handleUpdateLesson = async () => {
    if (!editLessonForm.title) {
      setEditLessonError("Dars nomi majburiy");
      return;
    }
    setEditLessonLoading(true);
    setEditLessonError("");
    try {
      const token = getJwtToken();
      const res = await fetch(`/api/admin/modules/${editLesson.moduleId}/lessons/${editLesson._id || editLesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editLessonForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditLesson(null);
        reloadModules();
      } else {
        setEditLessonError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setEditLessonError("Server bilan bog'lanishda xatolik");
    } finally {
      setEditLessonLoading(false);
    }
  };
  // Darsni o'chirish
  const handleDeleteLesson = async (lesson) => {
    if (!window.confirm(`Darsni o'chirishni tasdiqlaysizmi? (${lesson.title})`)) return;
    setDeleteLessonLoading(true);
    try {
      const token = getJwtToken();
      const res = await fetch(`/api/admin/modules/${lesson.moduleId}/lessons/${lesson._id || lesson.id}`, {
        method: "DELETE",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success) {
        reloadModules();
      } else {
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch {
      alert("Server bilan bog'lanishda xatolik");
    } finally {
      setDeleteLessonLoading(false);
    }
  };
  // Modullarni qayta yuklash
  const reloadModules = () => {
    const courseId = course?.id || course?._id;
    if (!courseId) return;
    setModules([]);
    setModulesLoading(true);
    setModulesError("");
    const token = getJwtToken();
    fetch(`/api/admin/courses/${courseId}/modules`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(async data => {
        if (data.success) {
          // Fetch lessons for each module
          const modulesWithLessons = await Promise.all(
            data.modules.map(async (mod) => {
              const res = await fetch(`/api/admin/modules/${mod._id}/lessons`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
              });
              const lessonsData = await res.json();
              return { ...mod, lessons: lessonsData.lessons || [] };
            })
          );
          setModules(modulesWithLessons);
        } else {
          setModulesError("Modullarni yuklashda xatolik");
        }
      })
      .catch(() => setModulesError("Server bilan bog'lanishda xatolik"))
      .finally(() => setModulesLoading(false));
  };

  useEffect(() => {
    const courseId = course?.id || course?._id;
    if (!courseId) return;
    setModules([]);
    setModulesLoading(true);
    setModulesError("");
    const token = getJwtToken();
    fetch(`/api/admin/courses/${courseId}/modules`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(async data => {
        if (data.success) {
          // Fetch lessons for each module
          const modulesWithLessons = await Promise.all(
            data.modules.map(async (mod) => {
              const res = await fetch(`/api/admin/modules/${mod._id}/lessons`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
              });
              const lessonsData = await res.json();
              return { ...mod, lessons: lessonsData.lessons || [] };
            })
          );
          setModules(modulesWithLessons);
        } else {
          setModulesError("Modullarni yuklashda xatolik");
        }
      })
      .catch(() => setModulesError("Server bilan bog'lanishda xatolik"))
      .finally(() => setModulesLoading(false));
  }, [course]);

  useEffect(() => {
    setLocalStatus(course?.status || "draft");
  }, [course]);

  const handleToggleStatus = async () => {
    setStatusLoading(true);
    setStatusError("");
    try {
      const token = getJwtToken();
      const newStatus = localStatus === "active" ? "draft" : "active";
      const res = await fetch(`/api/admin/courses/${course.id || course._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLocalStatus(newStatus);
        if (onReloadCourses) onReloadCourses();
      } else {
        setStatusError(data.message || "Statusni o'zgartirishda xatolik");
      }
    } catch {
      setStatusError("Server bilan bog'lanishda xatolik");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.title) {
      setAddModuleError("Modul nomi majburiy");
      return;
    }
    setAddModuleLoading(true);
    setAddModuleError("");
    try {
      const token = getJwtToken();
      const res = await fetch(`/api/admin/courses/${course.id || course._id}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newModule)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddModuleOpen(false);
        setNewModule({ title: "", description: "" });
        setAddModuleError("");
        reloadModules();
        if (onReloadCourses) onReloadCourses();
      } else {
        setAddModuleError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setAddModuleError("Server bilan bog'lanishda xatolik");
    } finally {
      setAddModuleLoading(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title) {
      setAddLessonError("Dars nomi majburiy");
      return;
    }
    setAddLessonLoading(true);
    setAddLessonError("");
    try {
      const token = getJwtToken();
      const res = await fetch(`/api/admin/modules/${addLessonModuleId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newLesson)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddLessonModuleId(null);
        setNewLesson({ title: "", description: "", videoUrl: "", codeSourceUrl: "" });
        setAddLessonError("");
        reloadModules();
      } else {
        setAddLessonError(data.message || "Xatolik yuz berdi");
      }
    } catch {
      setAddLessonError("Server bilan bog'lanishda xatolik");
    } finally {
      setAddLessonLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-12 w-full max-w-7xl mx-4 shadow-xl border border-border relative flex flex-col md:flex-row gap-8">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>
        {loading ? (
          <div className="w-full text-center py-16">Yuklanmoqda...</div>
        ) : error ? (
          <div className="w-full text-center text-red-500 py-16">{error}</div>
        ) : course ? (
          <>
            {/* Chap: Kurs ma'lumotlari */}
            <div className="flex-1 bg-muted rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Kurs ma'lumotlari</h3>
              <div className="space-y-2">
                <div><b>Nomi:</b> {course.title}</div>
                <div><b>Tavsif:</b> {course.description}</div>
                {/* <div><b>Kategoriya:</b> {course.category}</div> */}
                <div className="flex items-center gap-2">
                  <b>Status:</b>
                  <Switch checked={localStatus === "active"} onCheckedChange={handleToggleStatus} disabled={statusLoading} />
                  <Badge variant={localStatus === "active" ? "default" : "secondary"}>
                    {localStatus === "active" ? "Faol" : "Qoralama"}
                  </Badge>
                </div>
                {statusError && <div className="text-red-500 text-xs">{statusError}</div>}
              </div>
            </div>
            {/* O'ng: Modullar va darslar */}
            <div className="flex-1 bg-muted rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modullar</h3>
                <Button size="sm" variant="default" onClick={() => setAddModuleOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Modul qo'shish
                </Button>
              </div>
              {modulesLoading ? (
                <div className="text-center py-8">Modullar yuklanmoqda...</div>
              ) : modulesError ? (
                <div className="text-center text-red-500 py-8">{modulesError}</div>
              ) : (
                <Accordion type="multiple" className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted scrollbar-track-transparent">
                  {modules.map((mod) => (
                    <AccordionItem key={mod._id} value={mod._id} className="bg-background rounded-lg mb-2 border">
                      <AccordionTrigger className="flex items-center justify-between px-4 py-2 font-semibold">
                        <span>{mod.title}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" title="Modulni tahrirlash" onClick={e => { e.stopPropagation(); handleEditModule(mod); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Modulni o'chirish" onClick={e => { e.stopPropagation(); handleDeleteModule(mod); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="default" onClick={e => { e.stopPropagation(); setAddLessonModuleId(mod._id); }}>
                            + Dars qo'shish
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="text-muted-foreground text-sm mb-2">{mod.description}</div>
                        <div className="space-y-1">
                          {mod.lessons?.map((lesson) => (
                            <div key={lesson._id} className="flex items-center justify-between bg-muted rounded px-2 py-1 mb-1">
                              <span>{lesson.title}</span>
                              <span className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" title="Darsni tahrirlash" onClick={() => handleEditLesson(lesson)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" title="Darsni o'chirish" onClick={() => handleDeleteLesson(lesson)} disabled={deleteLessonLoading}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </>
        ) : null}
      </div>
      {/* Edit Module Modal */}
      {editModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Modulni tahrirlash</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditModule(null)}><X className="w-4 h-4" /></Button>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleUpdateModule(); }}>
              <Input value={editModuleForm.title} onChange={e => setEditModuleForm(f => ({ ...f, title: e.target.value }))} required placeholder="Modul nomi" />
              <Input value={editModuleForm.description} onChange={e => setEditModuleForm(f => ({ ...f, description: e.target.value }))} placeholder="Tavsif" />
              <Input type="number" value={editModuleForm.order} onChange={e => setEditModuleForm(f => ({ ...f, order: Number(e.target.value) }))} min={0} placeholder="Tartib raqami" />
              {editModuleError && <div className="text-red-500 text-xs">{editModuleError}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditModule(null)} disabled={editModuleLoading}>Bekor qilish</Button>
                <Button type="submit" disabled={editModuleLoading}>{editModuleLoading ? "Yangilanmoqda..." : "Yangilash"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Lesson Modal */}
      {editLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Darsni tahrirlash</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditLesson(null)}><X className="w-4 h-4" /></Button>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleUpdateLesson(); }}>
              <Input value={editLessonForm.title} onChange={e => setEditLessonForm(f => ({ ...f, title: e.target.value }))} required placeholder="Dars nomi" />
              <Input value={editLessonForm.description} onChange={e => setEditLessonForm(f => ({ ...f, description: e.target.value }))} placeholder="Tavsif" />
              <Input value={editLessonForm.videoUrl} onChange={e => setEditLessonForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="Video URL" />
              <Input value={editLessonForm.codeSourceUrl} onChange={e => setEditLessonForm(f => ({ ...f, codeSourceUrl: e.target.value }))} placeholder="Kod manbasi (URL)" />
              <Input type="number" value={editLessonForm.order} onChange={e => setEditLessonForm(f => ({ ...f, order: Number(e.target.value) }))} min={0} placeholder="Tartib raqami" />
              {editLessonError && <div className="text-red-500 text-xs">{editLessonError}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditLesson(null)} disabled={editLessonLoading}>Bekor qilish</Button>
                <Button type="submit" disabled={editLessonLoading}>{editLessonLoading ? "Yangilanmoqda..." : "Yangilash"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {addModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Yangi modul qo'shish</h3>
              <Button variant="ghost" size="sm" onClick={() => setAddModuleOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddModule(); }}>
              <Input value={newModule.title} onChange={e => setNewModule(f => ({ ...f, title: e.target.value }))} required placeholder="Modul nomi" />
              <Input value={newModule.description} onChange={e => setNewModule(f => ({ ...f, description: e.target.value }))} placeholder="Tavsif" />
              {addModuleError && <div className="text-red-500 text-xs">{addModuleError}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setAddModuleOpen(false)} disabled={addModuleLoading}>Bekor qilish</Button>
                <Button type="submit" disabled={addModuleLoading}>{addModuleLoading ? "Qo'shilmoqda..." : "Qo'shish"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {addLessonModuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Yangi dars qo'shish</h3>
              <Button variant="ghost" size="sm" onClick={() => setAddLessonModuleId(null)}><X className="w-4 h-4" /></Button>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddLesson(); }}>
              <Input value={newLesson.title} onChange={e => setNewLesson(f => ({ ...f, title: e.target.value }))} required placeholder="Dars nomi" />
              <Input value={newLesson.description} onChange={e => setNewLesson(f => ({ ...f, description: e.target.value }))} placeholder="Tavsif" />
              <Input value={newLesson.videoUrl} onChange={e => setNewLesson(f => ({ ...f, videoUrl: e.target.value }))} placeholder="Video URL" />
              <Input value={newLesson.codeSourceUrl} onChange={e => setNewLesson(f => ({ ...f, codeSourceUrl: e.target.value }))} placeholder="Kod manbasi (URL)" />
              {addLessonError && <div className="text-red-500 text-xs">{addLessonError}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setAddLessonModuleId(null)} disabled={addLessonLoading}>Bekor qilish</Button>
                <Button type="submit" disabled={addLessonLoading}>{addLessonLoading ? "Qo'shilmoqda..." : "Qo'shish"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 