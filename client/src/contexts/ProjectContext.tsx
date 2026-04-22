import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Project {
  id: string;
  name: string;
  platform: string;
  genre: string;
  status: "active" | "archived";
  createdAt: string;
  dataDir: string;
  description: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  selectProject: (id: string) => void;
  addProject: (project: Project) => void;
  loading: boolean;
  currentDataDir: string;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/vop-lab/data/projects.json`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const list: Project[] = data.projects || [];
        setProjects(list);

        const savedId = localStorage.getItem("vop-lab-current-project");
        const saved = list.find((p: Project) => p.id === savedId);
        if (saved) {
          setCurrentProject(saved);
        } else if (list.length > 0) {
          setCurrentProject(list[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const selectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
      localStorage.setItem("vop-lab-current-project", id);
    }
  };

  const addProject = (project: Project) => {
    const updated = [...projects, project];
    setProjects(updated);
    localStorage.setItem("vop-lab-projects", JSON.stringify(updated));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        selectProject,
        addProject,
        loading,
        currentDataDir: currentProject?.dataDir || "",
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
