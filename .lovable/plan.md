

## الخطة: تحسين وضوح النصوص في صفحة المتشابهات + دعم الهاتف

### المشكلة
1. النصوص في صفوف المتشابهات (labels) صغيرة جداً (`text-xs`) وغير واضحة
2. على الهاتف، النص يُقطع بـ `truncate` (نقط ...) بدلاً من الظهور كاملاً

### التعديلات المطلوبة في `src/pages/MutashabihatAyah.tsx`

**1. تكبير الفونت وجعله أوضح:**
- Row label (سطر 260): تغيير من `text-xs truncate` إلى `text-sm sm:text-base font-semibold` مع إزالة `truncate`
- عدد الآيات (سطر 265): تغيير من `text-xs` إلى `text-sm font-medium`
- رقم الكلمات (سطر 255): تكبير من `w-7 h-7 text-xs` إلى `w-8 h-8 text-sm`
- Section header title (سطر 226): تكبير من `text-sm` إلى `text-base`
- Section description (سطر 231): تكبير من `text-xs` إلى `text-sm`
- Pill badges (سطر 189): تكبير من `text-xs` إلى `text-sm`

**2. إزالة القطع على الهاتف:**
- إزالة `truncate` من label النص (سطر 260)
- إضافة `break-words` أو `whitespace-normal` بدلاً منه ليسمح بالالتفاف لسطر جديد
- السماح للصف بأن يكبر عمودياً حسب المحتوى

**3. تحسين المحتوى الموسع (Expanded):**
- تكبير اسم السورة ورقم الآية داخل الصفوف الموسعة (سطور 287-290)
- تكبير نص الآية من `text-base sm:text-lg` إلى `text-lg sm:text-xl`

### ملف واحد يتأثر
- `src/pages/MutashabihatAyah.tsx`

