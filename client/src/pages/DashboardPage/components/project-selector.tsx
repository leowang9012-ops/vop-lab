import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockProjects } from "@/data/mock";

export function ProjectSelector() {
  return (
    <Select defaultValue={mockProjects[0].id}>
      <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
        <SelectValue placeholder="选择项目" />
      </SelectTrigger>
      <SelectContent>
        {mockProjects
          .filter((p) => p.status === "active")
          .map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
