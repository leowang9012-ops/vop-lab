import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radar } from "lucide-react";

const CORRECT_PASSWORD = "Voplab9494";
const TOKEN = "vop-lab-logged-in";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === CORRECT_PASSWORD) {
      localStorage.setItem(TOKEN, "1");
      navigate("/", { replace: true });
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 mb-5">
            <Radar className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">VoP Lab</h1>
          <p className="text-sm text-muted-foreground mt-1.5">玩家反馈智能分析平台</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              输入访问密码
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              placeholder="请输入密码"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border bg-secondary/30 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 backdrop-blur-sm ${
                error ? "border-destructive animate-shake" : "border-border/60"
              }`}
            />
            {error && (
              <p className="mt-2 text-xs text-destructive font-medium">密码错误，请重试</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!pw.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold font-display hover:bg-primary/90 disabled:opacity-40 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            进入平台
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          仅限授权人员访问
        </p>
      </div>
    </div>
  );
}
