import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReactNode } from "react";

interface NewProjectDialogProps {
  children: ReactNode;
}

export function NewProjectDialog({ children }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    // TODO: 调用 API 创建项目
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
          <DialogDescription>创建一个新的游戏项目来收集和分析玩家反馈</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">项目名称</Label>
            <Input id="name" placeholder="输入游戏名称" className="bg-secondary/50 border-border" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="platform">平台</Label>
            <Select>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="选择平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iOS">iOS</SelectItem>
                <SelectItem value="Android">Android</SelectItem>
                <SelectItem value="PC">PC</SelectItem>
                <SelectItem value="Console">Console</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">项目描述（可选）</Label>
            <Input id="description" placeholder="简要描述" className="bg-secondary/50 border-border" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>创建项目</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
