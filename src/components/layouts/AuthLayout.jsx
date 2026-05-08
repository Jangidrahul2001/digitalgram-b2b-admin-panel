

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-y-auto bg-app">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-900/5 blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Outlet />
      </div>
    </div>
  )
}
