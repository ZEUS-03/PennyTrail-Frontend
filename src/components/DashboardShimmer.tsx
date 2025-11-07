import { Card } from "@/components/ui/card";

const DashboardShimmer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-400/20 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="mobile-container py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse lg:hidden" />
              <div>
                <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
                <div className="h-4 w-64 bg-slate-200 rounded mt-2 animate-pulse hidden sm:block" />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="hidden sm:flex h-9 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-9 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="mobile-container py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((item) => (
            <Card
              key={item}
              className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200/20 to-transparent rounded-full blur-2xl" />
              <div className="p-5 sm:p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-slate-200 rounded mb-2 animate-pulse" />
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-slate-200 rounded mt-2 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-slate-200 rounded mt-2 animate-pulse" />
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-center h-72 sm:h-80">
                <div className="relative">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-8 border-slate-200 animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg"
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-slate-200 rounded mt-1 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 w-44 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-36 bg-slate-200 rounded mt-2 animate-pulse" />
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg mb-6">
                <div className="h-9 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-9 bg-slate-200 rounded-md animate-pulse" />
              </div>
              <div className="h-72 sm:h-80 flex flex-col justify-end gap-2 px-4">
                {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
                  <div
                    key={item}
                    className="h-full bg-slate-200 rounded-t-lg animate-pulse"
                    style={{
                      height: `${20 + index * 10}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 rounded mt-2 animate-pulse" />
              </div>
              <div className="h-9 w-24 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardShimmer;
