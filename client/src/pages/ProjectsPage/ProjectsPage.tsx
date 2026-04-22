import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProject, Project } from "@/contexts/ProjectContext";
import { Gamepad2, Plus, BarChart3, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProjectsPage() {
  const { projects, currentProject, selectProject } = useProject();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    selectProject(id);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">项目管理</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">管理游戏项目及其反馈数据</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Current Project */}
        {currentProject && (
          <Card className="bg-card border-primary/30 border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-primary" />
                    当前项目
                  </CardTitle>
                  <CardDescription>正在查看此项目的数据</CardDescription>
                </div>
                <Badge variant="default" className="text-xs">活跃</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{currentProject.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{currentProject.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{currentProject.platform}</span>
                    <span>{currentProject.genre}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />创建于 {currentProject.createdAt}</span>
                  </div>
                </div>
                <Button onClick={() => navigate("/")} className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  查看数据
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Projects */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">所有项目</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <Card
                key={p.id}
                className={`bg-card border-border cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
                  currentProject?.id === p.id ? 'ring-2 ring-primary/30' : ''
                }`}
                onClick={() => handleSelect(p.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-sm">{p.name}</CardTitle>
                    </div>
                    <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {p.status === 'active' ? '活跃' : '已归档'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{p.platform}</span>
                    <span>·</span>
                    <span>{p.genre}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Project Placeholder */}
            <Card className="bg-card border-border border-dashed cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Plus className="w-8 h-8 mb-3" />
                <p className="text-sm font-medium">新建项目</p>
                <p className="text-xs mt-1">添加新游戏项目</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">项目统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl font-bold text-foreground">{projects.length}</p>
                <p className="text-sm text-muted-foreground">总项目数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {projects.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">活跃项目</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">已接入数据</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {new Set(projects.map(p => p.platform)).size}
                </p>
                <p className="text-sm text-muted-foreground">覆盖平台</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
