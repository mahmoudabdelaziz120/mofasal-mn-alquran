import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { ChevronDown, Play, Check, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface Lesson {
  id: number;
  title: string;
  vid: string;
  dur: string;
  desc: string;
}

interface Chapter {
  num: string;
  title: string;
  lessons: Lesson[];
}

const chapters: Chapter[] = [
  {
    num: "01",
    title: "مقدمات علم التجويد",
    lessons: [
      { id: 1, title: "مقدمة عن علم التجويد", vid: "KmOtlp5ZmwI", dur: "11:00", desc: "يُعرِّفك هذا الدرس بعلم التجويد تعريفاً شاملاً: ما هو؟ ما حكمه؟ وما فضله؟ ويشرح لماذا يحتاج كل مسلم يتلو القرآن الكريم إلى تعلّم هذا العلم الشريف." },
      { id: 2, title: "مقدمة عن كيف أتعلم التجويد", vid: "a8WgAptvVOM", dur: "15:54", desc: "يرسم الدرس خارطة طريق واضحة لرحلة تعلّم التجويد، ويوضح المراحل المناسبة وأفضل الأساليب العملية للتعلم الذاتي الفعّال." },
      { id: 3, title: "مقدمة عن أين أتعلم التجويد", vid: "_q2anoYPSLM", dur: "12:15", desc: "يستعرض الدرس المصادر والأماكن المتاحة لتعلّم التجويد، سواء كانت دوراتٍ حضورية أو مصادر رقمية، ويرشدك إلى ما يناسب وضعك." },
      { id: 4, title: "استخدام الألوان وتعلم التجويد", vid: "V4vgDc_HmCY", dur: "17:12", desc: "يكشف الدرس عن منهجية توظيف الألوان لتمييز أحكام التجويد في المصحف، مما يجعل التطبيق بصرياً وأكثر يُسراً." },
      { id: 5, title: "مصطلحات علم التجويد", vid: "SiGbaGuQQWY", dur: "14:15", desc: "يُلمّك الدرس بأبرز المصطلحات الأساسية في علم التجويد حتى تصبح القراءة واضحةً أمامك." },
      { id: 6, title: "أحكام الابتداء: الاستعاذة والبسملة", vid: "J0qeChDjTf4", dur: "17:11", desc: "يتناول الدرس الآداب الشرعية قبل القراءة، ويفصّل أحكام الاستعاذة والبسملة: متى تُقالان؟ وكيف؟" }
    ]
  },
  {
    num: "02",
    title: "مخارج الحروف وصفاتها",
    lessons: [
      { id: 7, title: "صلة القرابة بين الأحرف وعلاقتها بخروج الأصوات", vid: "fLpGSIhrtoA", dur: "16:09", desc: "نظرة علمية مبتكرة في علاقة الأحرف المتقاربة ببعضها، وكيف يؤثر التشابه الصوتي على طريقة النطق." },
      { id: 8, title: "مخارج الحروف العربية", vid: "kG78Es3KLDQ", dur: "17:49", desc: "جولة تفصيلية داخل جهاز النطق البشري، ليتعرّف كل حرف عربي إلى مخرجه الدقيق." },
      { id: 9, title: "صفات الحروف (ج1): ما هي صفات الحروف وأنواعها؟", vid: "LZ9DEpMJtIY", dur: "17:45", desc: "الفرق بين الصفات الذاتية اللازمة والصفات العارضة، مع بيان أثر كل صفة في جمال الصوت." },
      { id: 10, title: "صفات الحروف (ج2): فيزياء الصوت وصفات الجهر والشدة", vid: "J-tb27rtGwQ", dur: "17:00", desc: "مفاهيم فيزياء الصوت لشرح صفتَي الجهر والهمس، والشدة والرخاوة." },
      { id: 11, title: "صفات الحروف (ج3): الاستعلاء والإطباق والإذلاق", vid: "n0nYEZvxexg", dur: "13:19", desc: "شرح بقية الصفات الأصلية كالاستعلاء والانخفاض والإطباق والانفتاح والإذلاق والإصمات." },
      { id: 12, title: "صفات الحروف (ج4): الصفات التي لا ضد لها والعرضية", vid: "xgywLag4hHA", dur: "22:14", desc: "الصفات التي لا ضدَّ لها كالقلقلة والغنة والتفشي، والصفات العرضية الناتجة عن التركيب والسياق." }
    ]
  },
  {
    num: "03",
    title: "الأخطاء الشائعة في نطق الحروف",
    lessons: [
      { id: 13, title: "الأخطاء الشائعة للحروف الجوفية", vid: "NuZQvO04wLc", dur: "15:55", desc: "أخطاء النطق الشائعة في حروف المد الجوفية (الألف والواو والياء) مع تمرينات تصحيحية عملية." },
      { id: 14, title: "الأخطاء الشائعة للحروف الحلقية", vid: "3rtDP2k8O3U", dur: "21:12", desc: "الزلاّت الصوتية في حروف الحلق الستة: الهمزة والهاء والعين والحاء والغين والخاء." },
      { id: 15, title: "الأخطاء الشائعة للحروف اللهوية والشجرية وحرف الضاد", vid: "FarjpETZZ88", dur: "22:58", desc: "حروف القاف والكاف والجيم والشين والياء والضاد، وتصحيح النطق الخاطئ." },
      { id: 16, title: "الأخطاء الشائعة للحروف الذلقية", vid: "X11b8TvhdqQ", dur: "18:36", desc: "حروف طرف اللسان الستة (ل، ن، ر، ف، ب، م) والأخطاء الناتجة عن تداخل مخارجها." },
      { id: 17, title: "الأخطاء الشائعة للحروف النطعية واللثوية", vid: "x8nP1fBW3_4", dur: "16:29", desc: "الأخطاء في حروف النطع (ط، د، ت) وحروف اللثة (ث، ذ، ظ) مع تمييز دقيق بين مخارجها." },
      { id: 18, title: "الأخطاء الشائعة لحروف الصفير والشفوية", vid: "a1vIpVimKVM", dur: "22:23", desc: "الأخطاء في حروف الصفير (ص، س، ز) والحروف الشفوية (ف، ب، م، و)." },
      { id: 19, title: "الأخطاء الشائعة للحروف الخيشومية", vid: "UeAXYQwv1vk", dur: "11:59", desc: "الخيشوم وكيف تؤدّى الحروف ذات الغنة، وتصحيح أخطاء النون والميم." },
      { id: 20, title: "الأخطاء الشائعة في تلاوة الفاتحة (ج1)", vid: "pceerYb_KsU", dur: "19:46", desc: "تطبيق ما سبق تعلّمه على سورة الفاتحة: البسملة والآيات الأولى." },
      { id: 21, title: "الأخطاء الشائعة في تلاوة الفاتحة (ج2)", vid: "4OSueN8qFr0", dur: "19:37", desc: "تصحيح أخطاء سورة الفاتحة في آيات (اهدنا الصراط المستقيم) وما تلاها." },
      { id: 22, title: "الأخطاء الشائعة في تلاوة الفاتحة (ج3)", vid: "aCNgL_vKnu0", dur: "15:54", desc: "مراجعة شاملة لجميع الأخطاء الصوتية والتجويدية في سورة الفاتحة." }
    ]
  },
  {
    num: "04",
    title: "أحكام التركيب – مقدمة",
    lessons: [
      { id: 23, title: "مقدمة عن التقاء الحرفين", vid: "YLHU9hl_DDs", dur: "18:23", desc: "ما يحدث حين يلتقي حرفان متجاوران، وكيف يؤثر كل منهما على الآخر في اللفظ." }
    ]
  },
  {
    num: "05",
    title: "النون الساكنة والتنوين",
    lessons: [
      { id: 24, title: "مقدمة أحكام النون الساكنة والتنوين", vid: "Y0drcwcWUuM", dur: "17:16", desc: "التعريف بالنون الساكنة والتنوين والتمييز بينهما، واستعراض أحكامها الأربعة." },
      { id: 25, title: "الإدغام بغنة للنون الساكنة والتنوين", vid: "ouR4le9EYSo", dur: "18:54", desc: "حكم الإدغام بغنة بالتفصيل: متى يقع؟ وفي أيّ أحرف؟ مع أمثلة قرآنية." },
      { id: 26, title: "الإدغام بغير غنة للنون الساكنة والتنوين", vid: "nGOW43fcYh4", dur: "15:23", desc: "الفرق بين الإدغام بغنة وبغير غنة، وأحرف الإدغام بلا غنة (اللام والراء)." },
      { id: 27, title: "الإقلاب للنون الساكنة والتنوين", vid: "CAas0uSx--s", dur: "13:32", desc: "حكم الإقلاب عند حرف الباء، وكيف تُقلَب النون أو التنوين ميماً مخفاةً." },
      { id: 28, title: "إظهار النون الساكنة والتنوين", vid: "FgkNJ5SzBD8", dur: "14:31", desc: "حكم الإظهار الحلقي: أحرفه الستة وسبب الإظهار عندها." },
      { id: 29, title: "إخفاء النون الساكنة والتنوين", vid: "esiaT_NTTNw", dur: "17:35", desc: "أكثر أحكام النون الساكنة تطبيقاً: الإخفاء في أي الأحرف الخمسة عشر يقع." },
      { id: 30, title: "مراجعة أحكام النون الساكنة والتنوين", vid: "8P7oBgVRwp4", dur: "21:11", desc: "مراجعة تطبيقية شاملة بأمثلة متنوعة من القرآن الكريم." }
    ]
  },
  {
    num: "06",
    title: "الميم الساكنة والمشددات",
    lessons: [
      { id: 31, title: "مقدمة الميم الساكنة", vid: "Gmag2-Fin48", dur: "7:47", desc: "الميم الساكنة وأحكامها الثلاثة بصورة تمهيدية." },
      { id: 32, title: "الإخفاء الشفوي", vid: "08c8dxycKcE", dur: "14:54", desc: "حكم الإخفاء الشفوي للميم الساكنة أمام الباء." },
      { id: 33, title: "إدغام الميم الساكنة", vid: "zZWybepvbb8", dur: "9:20", desc: "إدغام الميم الساكنة في مثلها مع الغنة." },
      { id: 34, title: "الإظهار الشفوي للميم الساكنة", vid: "p2i4ubqZ53k", dur: "11:52", desc: "الإظهار الشفوي عند جميع الحروف عدا الباء والميم." },
      { id: 35, title: "الميم والنون المشددتان", vid: "dWa0iKNcnmg", dur: "12:38", desc: "غنة الميم والنون المشددتَين بمقدار حركتين." }
    ]
  },
  {
    num: "07",
    title: "القلقلة والتفخيم والترقيق",
    lessons: [
      { id: 36, title: "القلقلة", vid: "kHRLgR3KZg0", dur: "21:08", desc: "صفة القلقلة بالتفصيل: ما هي؟ وفي أيّ أحرف تقع (قطب جد)؟" },
      { id: 37, title: "تعريف التفخيم وعلاقته بالاستعلاء والإطباق", vid: "qOfxPcCicHI", dur: "20:27", desc: "التفخيم وارتباطه بصفتَي الاستعلاء والإطباق ودرجاته المختلفة." },
      { id: 38, title: "أثر الحركات على التفخيم وتفخيم الألف واللام", vid: "yNwsdZWW8-s", dur: "25:18", desc: "تفاوت درجات التفخيم تبعاً للحركة، وقواعد تفخيم لفظ الجلالة." },
      { id: 39, title: "تفخيم الراء وترقيقها", vid: "jHifmjSpJmA", dur: "19:18", desc: "حرف الراء بالتفصيل: متى تُفخَّم؟ ومتى تُرقَّق؟" }
    ]
  },
  {
    num: "08",
    title: "أحكام المدود",
    lessons: [
      { id: 40, title: "الأحرف العجيبة بين العلة والمد واللين", vid: "VSRUcykUlis", dur: "27:40", desc: "الفرق بين أحرف العلة وأحرف المد وأحرف اللين." },
      { id: 41, title: "متى تمد أحرف العلة", vid: "DprslkPEaEY", dur: "25:59", desc: "في أي الأحوال يُمدّ حرف المد؟ وشروط المد." },
      { id: 42, title: "أنواع المد ومدته", vid: "XyE2p096EV4", dur: "24:15", desc: "تصنيف المدود إلى أصلية وفرعية، والوحدة الزمنية للمد." },
      { id: 43, title: "المد الطبيعي والبدل والعوض", vid: "AIGTJYjAjS0", dur: "26:29", desc: "أنواع المد الأصلي: المد الطبيعي بحركتين، ومد البدل، ومد العوض." },
      { id: 44, title: "مد الصلة الصغرى والصلة الكبرى", vid: "Rqnez1JRJ6c", dur: "28:17", desc: "مد صلة هاء الضمير في الوصل: الصغرى والكبرى." },
      { id: 45, title: "المد المتصل والمنفصل", vid: "Ttb_uL2hvMs", dur: "17:42", desc: "الفرق بين المد المتصل والمنفصل ومدة كل منهما." },
      { id: 46, title: "المد اللازم", vid: "ra8JIpS3vdk", dur: "21:57", desc: "المد اللازم وأقسامه الكلمية والحرفية المثقلة والمخففة." },
      { id: 47, title: "المد العارض للسكون واللين", vid: "qE3Cl7JCUWw", dur: "27:10", desc: "مد العارض للسكون الوقفي وأوجه مده، ومد اللين وضوابطه." }
    ]
  },
  {
    num: "09",
    title: "الهمزات",
    lessons: [
      { id: 48, title: "الفرق بين همزتي الوصل والقطع", vid: "TVA962bYESk", dur: "35:04", desc: "الفرق الجوهري بين همزة الوصل وهمزة القطع مع قاعدة عملية للتمييز." },
      { id: 49, title: "أثر دخول الهمزة على الكلمات", vid: "Of6jW75FGFk", dur: "19:13", desc: "كيف تُغيّر همزة الاستفهام والوصل من نطق الكلمات." },
      { id: 50, title: "همزة الوصل: حركتها وحذفها واجتماع الهمزتين", vid: "_DvBI3g_Shw", dur: "30:45", desc: "أحكام همزة الوصل: حركتها وحذفها في الوصل واجتماع الهمزتين." }
    ]
  },
  {
    num: "10",
    title: "الخاتمة",
    lessons: [
      { id: 51, title: "تطبيق التجويد الميسر (في أقل من دقيقة)", vid: "1aVxrQDfW3Q", dur: "0:57", desc: "تعريف سريع بتطبيق التجويد الميسر وكيف يُعينك على تطبيق أحكام التجويد." },
      { id: 52, title: "بشرى إطلاق تطبيق التجويد – شرح تفصيلي", vid: "kp13UlJWWxI", dur: "6:55", desc: "شرح تفصيلي لمزايا التطبيق وكيفية الاستفادة منه في تعلّم التجويد." }
    ]
  }
];

const allLessons = chapters.flatMap(ch => ch.lessons);

export default function TajweedCourse() {
  const navigate = useNavigate();
  const [done, setDone] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("tajweed_done") || "[]"); } catch { return []; }
  });
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(["01"]));
  const [modalLesson, setModalLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    localStorage.setItem("tajweed_done", JSON.stringify(done));
  }, [done]);

  const toggleDone = (id: number) => {
    setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleChapter = (num: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num); else next.add(num);
      return next;
    });
  };

  const resetProgress = () => {
    if (confirm("هل تريد إعادة تعيين تقدمك في الدورة؟")) setDone([]);
  };

  const pct = Math.round((done.length / 52) * 100);

  const openModal = (lesson: Lesson) => {
    setModalLesson(lesson);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalLesson(null);
    document.body.style.overflow = "";
  };

  const navLesson = (dir: number) => {
    if (!modalLesson) return;
    const idx = allLessons.findIndex(l => l.id === modalLesson.id);
    const next = idx + dir;
    if (next >= 0 && next < allLessons.length) setModalLesson(allLessons[next]);
  };

  const modalIdx = modalLesson ? allLessons.findIndex(l => l.id === modalLesson.id) : -1;

  return (
    <div className="relative min-h-screen" dir="rtl">
      <CosmosBackground />
      <div className="top-glow" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center px-4 pt-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <img src={logoImg} alt="الرئيسية" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover" />
          </button>
          <ThemeToggle />
        </div>

        {/* Hero */}
        <header className="text-center pt-6 sm:pt-8 pb-4 px-4">
          <p className="font-quran text-base sm:text-lg mb-2" style={{ color: "var(--text-2)" }}>﷽</p>
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-relaxed"
            style={{ color: "var(--text-0)", fontFamily: "'Amiri', serif" }}
          >
            سلسلة التجويد الميسر
          </h1>
          <p className="text-sm sm:text-base mb-4" style={{ color: "var(--dot-active)", fontFamily: "'Amiri', serif" }}>
            تعلّم أحكام التجويد خطوة بخطوة
          </p>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-2)" }}>
            52 درساً شاملاً من المقدمات إلى التطبيق
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 sm:gap-12 mt-5">
            {[
              { num: "52", label: "درساً" },
              { num: "10", label: "أقسام" },
              { num: "25+", label: "ساعة" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold font-quran" style={{ color: "var(--dot-active)" }}>{s.num}</div>
                <div className="text-[0.7rem]" style={{ color: "var(--text-2)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Progress Bar */}
        <div
          className="mx-4 sm:mx-auto max-w-3xl w-full rounded-2xl px-4 py-3 mb-6 flex items-center gap-3 flex-wrap"
          style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)", backdropFilter: "blur(40px)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-2)" }}>تقدّمك:</span>
          <div className="flex-1 min-w-[120px] h-1.5 rounded-full" style={{ background: "var(--progress-bar-bg)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "var(--progress-grad)" }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--dot-active)" }}>{done.length} / 52</span>
          <button
            onClick={resetProgress}
            className="flex items-center gap-1 text-[0.7rem] px-2 py-1 rounded-lg transition-colors"
            style={{ color: "var(--text-2)", border: "0.5px solid var(--glass-card-border)" }}
          >
            <RotateCcw className="w-3 h-3" />
            إعادة
          </button>
        </div>

        {/* Chapters */}
        <main className="px-4 max-w-3xl mx-auto w-full pb-16 space-y-3">
          {chapters.map((ch) => {
            const isExpanded = expandedChapters.has(ch.num);
            const chapterDone = ch.lessons.filter(l => done.includes(l.id)).length;
            return (
              <div key={ch.num} className="rounded-2xl overflow-hidden glass-card-themed">
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(ch.num)}
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-right transition-colors duration-200"
                  style={{ background: isExpanded ? "var(--highlight-bg)" : "transparent" }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: "var(--highlight-bg)", color: "var(--dot-active)" }}
                    >
                      {ch.num}
                    </div>
                    <div className="min-w-0">
                      <div className="font-quran text-sm sm:text-base font-bold" style={{ color: "var(--text-0)" }}>
                        {ch.title}
                      </div>
                      <div className="text-[0.65rem] sm:text-xs" style={{ color: "var(--text-2)" }}>
                        {ch.lessons.length} دروس · {chapterDone}/{ch.lessons.length} مكتمل
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 accordion-arrow ${isExpanded ? "rotated" : ""}`}
                    style={{ color: "var(--text-2)" }}
                  />
                </button>

                {/* Lessons */}
                <div className={`accordion-content ${isExpanded ? "expanded" : ""}`}>
                  <div className="px-2 sm:px-3 pb-3">
                    <div className="h-px mb-2" style={{ background: "var(--glass-thin-border)" }} />
                    {ch.lessons.map((lesson) => {
                      const isDone = done.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group"
                          style={{ background: isDone ? "var(--highlight-bg)" : "transparent" }}
                        >
                          {/* Done check */}
                          <button
                            onClick={() => toggleDone(lesson.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                            style={{
                              background: isDone ? "var(--dot-active)" : "transparent",
                              border: isDone ? "none" : "1.5px solid var(--glass-card-border)",
                              color: isDone ? "var(--primary-foreground)" : "transparent"
                            }}
                          >
                            {isDone && <Check className="w-3.5 h-3.5" style={{ color: "#fff" }} />}
                          </button>

                          {/* Lesson number */}
                          <span className="text-xs w-5 text-center flex-shrink-0 font-quran" style={{ color: "var(--text-2)" }}>
                            {lesson.id}
                          </span>

                          {/* Title */}
                          <span
                            className="flex-1 text-xs sm:text-sm font-medium min-w-0 truncate cursor-pointer"
                            style={{ color: isDone ? "var(--text-2)" : "var(--text-0)" }}
                            onClick={() => openModal(lesson)}
                          >
                            {lesson.title}
                          </span>

                          {/* Duration */}
                          <span className="text-[0.65rem] hidden sm:inline flex-shrink-0" style={{ color: "var(--text-2)", direction: "ltr" }}>
                            {lesson.dur}
                          </span>

                          {/* Play button */}
                          <button
                            onClick={() => openModal(lesson)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.7rem] font-bold transition-all duration-200 flex-shrink-0"
                            style={{
                              background: "var(--highlight-bg)",
                              color: "var(--dot-active)",
                              border: "0.5px solid var(--highlight-border)"
                            }}
                          >
                            <Play className="w-3 h-3" />
                            <span className="hidden sm:inline">مشاهدة</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {/* Modal */}
      {modalLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="w-full max-w-[780px] max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: "var(--glass-thick-bg)",
              border: "0.5px solid var(--glass-thick-border)",
              backdropFilter: "blur(40px)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 p-5 sm:p-6" style={{ borderBottom: "1px solid var(--glass-thin-border)" }}>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--dot-active)" }}>الدرس {modalLesson.id}</div>
                <h2 className="font-quran text-lg sm:text-xl font-bold" style={{ color: "var(--text-0)" }}>
                  {modalLesson.title}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: "var(--glass-card-bg)", color: "var(--text-2)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video */}
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${modalLesson.vid}?rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope"
                allowFullScreen
              />
            </div>

            {/* Description */}
            <div className="p-5 sm:p-6">
              <div className="text-[0.7rem] font-bold mb-2" style={{ color: "var(--dot-active)", letterSpacing: "1px" }}>
                📖 ملخص الدرس
              </div>
              <p
                className="text-sm font-quran leading-[2]"
                style={{
                  color: "var(--text-1)",
                  background: "var(--highlight-bg)",
                  borderRight: "3px solid var(--dot-active)",
                  padding: "12px 16px",
                  borderRadius: "0 8px 8px 0"
                }}
              >
                {modalLesson.desc}
              </p>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 flex-wrap"
              style={{ borderTop: "1px solid var(--glass-thin-border)" }}
            >
              <div className="flex gap-2">
                <button
                  onClick={() => navLesson(-1)}
                  disabled={modalIdx <= 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-30"
                  style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)", color: "var(--text-1)" }}
                >
                  <ChevronRight className="w-3 h-3" /> السابق
                </button>
                <button
                  onClick={() => navLesson(1)}
                  disabled={modalIdx >= allLessons.length - 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-30"
                  style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)", color: "var(--text-1)" }}
                >
                  التالي <ChevronLeft className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => toggleDone(modalLesson.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: done.includes(modalLesson.id) ? "var(--highlight-bg)" : "var(--glass-card-bg)",
                  border: `0.5px solid ${done.includes(modalLesson.id) ? "var(--highlight-border)" : "var(--glass-card-border)"}`,
                  color: "var(--dot-active)"
                }}
              >
                <Check className="w-3.5 h-3.5" />
                {done.includes(modalLesson.id) ? "مُكتمل" : "علّم كمُكتمل"}
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${modalLesson.vid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: "#cc0000", color: "#fff" }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                  <path d="M23.5 6.2s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2 12 2 12 2s-4.6 0-7.3.2c-.6 0-1.9.1-3 1.3C.8 4.3.5 6.2.5 6.2S.2 8.4.2 10.6v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 21.2 12 21.2 12 21.2s4.6 0 7.3-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.8 8.4 23.5 6.2 23.5 6.2zM9.7 15.5V8l6.6 3.8-6.6 3.7z" />
                </svg>
                يوتيوب
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
