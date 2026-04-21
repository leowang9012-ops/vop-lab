import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/data/mock";
import { MoreHorizontal, MessageSquareWarning } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const platformColors = {
  iOS: "bg-info/10 text-info border-info/30",
  Android: "bg-success/10 text-success border-success/30",
  PC: "bg-primary/10 text-primary border-primary/30",
  Console: "bg-warning/10 text-warning border-warning/30",
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-200 group cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <Badge variant="outline" className={`mt-1.5 ${platformColors[project.platform]}`}>
              {project.platform}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>查看详情</DropdownMenuItem>
              <DropdownMenuItem>编辑项目</DropdownMenuItem>
              <DropdownMenuItem>导出数据</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">归档项目</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MessageSquareWarning className="w-4 h-4" />
            <span>{project.feedbackCount.toLocaleString()} 条反馈</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          最后更新: {project.lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
}
