import { Loader2 } from "lucide-react";

export default function RouteLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-page">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
    </div>
  );
}
