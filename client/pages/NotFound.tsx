import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Sahifa topilmadi</p>
        <Button asChild>
          <a href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Bosh sahifaga qaytish
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
