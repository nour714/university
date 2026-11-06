export default function ExamDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 max-w-lg w-full space-y-4 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 animate-pulse">
          <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-44 bg-slate-200 rounded-md mx-auto animate-pulse" />
          <div className="h-3.5 w-60 bg-slate-100 rounded-md mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
