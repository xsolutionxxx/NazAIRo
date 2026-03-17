export default function SearchWidget({ className }: { className?: string }) {
  return (
    <div
      className={`w-full h-70 bg-neutral rounded-2xl shadow-md ${className}`}
    >
      <h2 className="flex justify-center items-center h-full">SearchWidget</h2>
    </div>
  );
}
