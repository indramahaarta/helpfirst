import { Field, ErrorMessage } from "formik";
import { FC } from "react";

interface ReportFormInputProps {
  label: string;
  name: string;
  placeholder: string;
  disabled?: boolean;
  classname?: string;
}

const ReportFormInput: FC<ReportFormInputProps> = ({
  label,
  name,
  placeholder,
  classname,
  disabled = false,
}) => {
  return (
    <div className={`grid col-span-2 gap-1 ${classname}`}>
      <label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={name}
      >
        {label}
      </label>
      <Field
        name={name}
        id={name}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder}
        type={name}
      />
      <div className="px-4 text-xs text-red-500">
        <ErrorMessage name={name} />
      </div>
    </div>
  );
};

ReportFormInput.displayName = "ReportFormInput";
export default ReportFormInput;
