import { ProjectCard } from "./components/project-card";
import { NewProjectDialog } from "./components/new-project-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProjects } from "@/data/mock";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">项目管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">管理游戏项目及其反馈数据</p>
          </div>
          <NewProjectDialog>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </Button>
          </NewProjectDialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">活跃项目</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockProjects
              .filter((p) => p.status === "active")
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </div>

        {mockProjects.some((p) => p.status === "archived") && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">已归档</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockProjects
                .filter((p) => p.status === "archived")
                .map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <Card className="mt-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium">项目统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl font-bold text-foreground">{mockProjects.length}</p>
                <p className="text-sm text-muted-foreground">总项目数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {mockProjects.filter((p) => p.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">活跃项目</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {mockProjects.reduce((acc, p) => acc + p.feedbackCount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">总反馈数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {new Set(mockProjects.map((p) => p.platform)).size}
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
