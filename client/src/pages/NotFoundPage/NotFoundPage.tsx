import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">页面未找到</p>
        <p className="text-sm text-muted-foreground">
          你访问的页面不存在或已被移除
        </p>
        <Button onClick={() => navigate("/")} className="mt-4">
          返回首页
        </Button>
      </div>
    </div>
  );
}
