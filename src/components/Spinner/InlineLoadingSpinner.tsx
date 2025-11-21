import { LoaderIcon } from "lucide-react";

interface Props {
  className?: string;
}

export function InlineLoadingSpinner({ className = "text-white" }: Readonly<Props>) {
  return <LoaderIcon className={"w-4 h-4 animate-spin " + className} />;
}