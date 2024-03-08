import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "formik";
import { FC } from "react";

interface ReportFormSelectProps {
  label: string;
  className?: string;
  name: string;
  onValueChange: (val: string) => void;
  items: { value: string; label: string }[];
}

const ReportFormSelect: FC<ReportFormSelectProps> = ({
  label,
  name,
  onValueChange,
  items,
  className,
}) => {
  return (
    <div className={`grid col-span-1 gap-1 ${className}`}>
      <label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={"type"}
      >
        {label}
      </label>
      <Select onValueChange={(e) => onValueChange(e)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <div key={item.value}>
              <SelectItem value={item.value}>{item.label}</SelectItem>
            </div>
          ))}
        </SelectContent>
      </Select>
      <div className="px-4 text-xs text-red-500">
        <ErrorMessage name={name} />
      </div>
    </div>
  );
};

ReportFormSelect.displayName = "ReportFormSelect";
export default ReportFormSelect;
