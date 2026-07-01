export function Background3D() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 16%, rgba(168, 85, 247, 0.16), transparent 34%), radial-gradient(circle at 82% 18%, rgba(59, 130, 246, 0.12), transparent 30%), radial-gradient(circle at 76% 82%, rgba(16, 185, 129, 0.12), transparent 36%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] opacity-45" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />
    </div>
  );
}
