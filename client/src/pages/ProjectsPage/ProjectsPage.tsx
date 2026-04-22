import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProject, Project } from "@/contexts/ProjectContext";
import { Gamepad2, Plus, BarChart3, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectsPage() {
  const { projects, currentProject, selectProject, addProject } = useProject();
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    platform: "",
    genre: "",
    description: "",
  });

  const handleSelect = (id: string) => {
    selectProject(id);
    navigate("/");
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-").replace(/-+/g, "-");
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: form.name.trim(),
      platform: form.platform.trim() || "移动端",
      genre: form.genre.trim() || "竞技",
      status: "active",
      createdAt: new Date().toLocaleDateString("zh-CN"),
      dataDir: slug,
      description: form.description.trim(),
    };
    addProject(newProject);
    setShowDialog(false);
    setForm({ name: "", platform: "", genre: "", description: "" });
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

            {/* Add Project Card */}
            <Card
              className="bg-card border-border border-dashed cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setShowDialog(true)}
            >
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

      {/* New Project Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建项目</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">项目名称 *</Label>
              <Input
                id="proj-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="例如：街篮2"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-platform">平台</Label>
                <Input
                  id="proj-platform"
                  value={form.platform}
                  onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                  placeholder="例如：移动端"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-genre">品类</Label>
                <Input
                  id="proj-genre"
                  value={form.genre}
                  onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                  placeholder="例如：竞技"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">项目描述</Label>
              <Input
                id="proj-desc"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="简要描述项目定位"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={!form.name.trim()}>创建项目</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
