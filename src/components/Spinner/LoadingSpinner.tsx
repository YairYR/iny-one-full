import { Loader } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <Loader className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );
}
