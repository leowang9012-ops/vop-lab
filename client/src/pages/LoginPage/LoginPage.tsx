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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-4">
            <Radar className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">VoP Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">玩家反馈智能分析平台</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              输入访问密码
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              placeholder="请输入密码"
              autoFocus
              className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                error ? "border-destructive animate-shake" : "border-input"
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-destructive">密码错误，请重试</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!pw.trim()}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            进入平台
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          仅限授权人员访问
        </p>
      </div>
    </div>
  );
}
