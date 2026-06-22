import React, {type FC } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: FC<FileInputProps> = ({ className = "", onChange }) => {
  return (
      <input
          type="file"
          className={`h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-sm transition-colors 
        file:mr-5 file:h-full file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:px-4 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100 
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
        dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-300 ${className}`}
          onChange={onChange}
      />
  );
};

export default FileInput;