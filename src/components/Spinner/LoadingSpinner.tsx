import { LoaderIcon } from "lucide-react";

interface Props {
  className?: string;
}

export function LoadingSpinner({ className = 'text-white' }: Readonly<Props>) {
  return (
    <div className={"flex justify-center items-center h-full " + className}>
      <LoaderIcon className="w-8 h-8 animate-spin" />
    </div>
  );
}
