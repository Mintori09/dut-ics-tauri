import { useState } from "react";
import type { SelectType } from "../hooks/useSemesters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface Props {
  semesters: SelectType[];
  setSemesters: (semesters: SelectType[]) => void;
}

export default function SemesterList({ semesters, setSemesters }: Props) {
  if (!semesters || semesters.length === 0) return null;

  const [selected, setSelected] = useState(
    semesters.find((s) => s.selected)?.value || "",
  );

  const handleChange = (newValue: string) => {
    setSelected(newValue);
    const updatedSemesters = semesters.map((s) => ({
      ...s,
      selected: s.value === newValue,
    }));
    setSemesters(updatedSemesters);
    console.log("Học kỳ được chọn:", newValue);
  };

  return (
    <div className="w-fit min-w-[180px] p-3 border rounded-xl bg-gray-50 mb-4">
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="text-sm bg-white">
          <SelectValue placeholder="Học kỳ" />
        </SelectTrigger>
        <SelectContent>
          {semesters.map((semester) => (
            <SelectItem key={semester.value} value={semester.value}>
              {semester.text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
