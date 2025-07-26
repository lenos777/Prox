import { useLocation, useNavigate } from "react-router-dom";
import { User as UserIcon, BarChart2, TrendingDown, TrendingUp, ChartBar } from "lucide-react";

export default function Students() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  // Dummy stats generator
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-muted-foreground mb-4">Foydalanuvchi topilmadi.</p>
        <button
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors border px-4 py-2 rounded-md"
          onClick={() => navigate("/prox-offline")}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Orqaga
        </button>
      </div>
    );
  }

  const stats = getUserStats(user);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 py-8 animate-fade-in">
      <button
        className="mb-6 self-start flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        onClick={() => navigate("/prox-offline")}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Orqaga
      </button>
      <div className="bg-card/80 border rounded-2xl shadow-md p-6 w-full max-w-xl animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">{user.fullName}</div>
              <div className="text-sm text-muted-foreground">{user.phone}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart2 className="w-4 h-4 text-primary" /> Qadam: <span className="font-semibold text-foreground">{stats.step}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-green-600" /> Shu hafta ball: <span className="font-semibold text-foreground">{stats.weekPoints.reduce((a,b)=>a+b,0)}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ChartBar className="w-4 h-4 text-blue-600" /> Shu oy ball: <span className="font-semibold text-foreground">{stats.monthPoints.reduce((a,b)=>a+b,0)}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart2 className="w-4 h-4 text-orange-500" /> O'rtacha ball: <span className="font-semibold text-foreground">{stats.avg}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="w-4 h-4 text-red-500" /> Eng yomon kun: <span className="font-semibold text-foreground">{stats.worstDay} ({stats.worstDayValue} ball)</span>
            </span>
          </div>
        </div>
        {/* Chart - week points */}
        <div className="mt-4">
          <h4 className="font-semibold text-base mb-2 text-foreground">Haftalik ballar</h4>
          <div className="flex items-end gap-2 h-24">
            {stats.weekPoints.map((point, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className={`w-6 rounded-t-md ${point === Math.max(...stats.weekPoints) ? 'bg-primary' : 'bg-muted-foreground/40'} transition-all`} style={{ height: `${point/2+10}px` }}></div>
                <span className="text-xs text-muted-foreground mt-1">{['Du','Se','Ch','Pa','Ju','Sh','Ya'][idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 