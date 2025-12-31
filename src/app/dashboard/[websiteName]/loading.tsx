import Image from "next/image";
import Loader from "@/../public/Loader.gif";

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-background/95 z-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>

      <div className="relative flex flex-col items-center space-y-8 p-10 rounded-2xl bg-card/70 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-border/50 max-w-md w-full mx-4 transform transition-all">
        <div className="relative w-28 h-28 animate-float">
          <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse-slow"></div>
          <Image
            src={Loader}
            width={112}
            height={112}
            alt="Loading"
            className="w-full h-full rounded-2xl object-cover"
            priority
          />
        </div>

        <h2 className="text-3xl font-semibold text-primary/90 tracking-tight animate-pulse-slow">
          Loading Analytics
        </h2>

        <div className="w-full bg-muted/30 h-[1px]"></div>

        <p className="text-muted-foreground text-center text-lg">
          Please wait while we prepare your data
          <span className="animate-ellipsis">...</span>
        </p>

        <div className="flex space-x-3 mt-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
