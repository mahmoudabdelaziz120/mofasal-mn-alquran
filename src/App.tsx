import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import SurahReader from "./pages/SurahReader.tsx";
import TafsirReader from "./pages/TafsirReader.tsx";
import TajweedCourse from "./pages/TajweedCourse.tsx";
import MutashabihatIndex from "./pages/MutashabihatIndex.tsx";
import MutashabihatSurah from "./pages/MutashabihatSurah.tsx";
import MutashabihatAyah from "./pages/MutashabihatAyah.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/surah/:id" element={<SurahReader />} />
          <Route path="/tafsir" element={<TafsirReader />} />
          <Route path="/tajweed-course" element={<TajweedCourse />} />
          <Route path="/mutashabihat" element={<MutashabihatIndex />} />
          <Route path="/mutashabihat/:slug" element={<MutashabihatSurah />} />
          <Route path="/mutashabihat/:slug/:ayahNum" element={<MutashabihatAyah />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
