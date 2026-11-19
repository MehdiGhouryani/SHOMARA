# مشخصات کامل UI صفحهٔ اصلی شمارا — مسیر یادگیری

## 1. هدف صفحه
کودک باید در نگاه اول بداند: الان در کدام پایه/فصل است، تا کجا پیش رفته، کدام ایستگاه را باید ادامه دهد، و ایستگاه‌های قبل و بعد چه وضعیتی دارند. UI باید شاد، نرم و بازی‌گونه باشد اما از بازی‌سازیِ پاداش‌محور یا صفحهٔ داشبورد شلوغ استفاده نکند.

## 2. جهت هنری
- تصویر مرجع: کارت سفید نرم، radius زیاد، برجستگی کنترل‌شده، آیکون‌های رنگی سه‌بعدی/کلی، زمینهٔ یاسی روشن، تاکید بنفش.
- سازگاری با شمارا: green معنای تکمیل/پیشرفت دارد؛ violet برای انتخاب و active nav؛ amber صرفاً تاکید کوچک.
- canvas: lavender mist؛ card surface سفید؛ بخش‌های path garden tint.
- ارتفاع و سایه فقط برای hierarchy؛ متن بدون سایه؛ هر viewport فقط یک Featured surface.
- character cameo در Header یا Continue card، حداکثر یک شخصیت در هر ناحیه.

## 3. اجزای صفحه به ترتیب
### A. System area / status bars
- محتوا به status bar و display cutout احترام بگذارد. edge-to-edge با inset سیستم.
- bottom bar بالای gesture inset و home indicator قرار گیرد؛ در Compose از WindowInsets استفاده شود، نه margin ثابت بر اساس دستگاه.

### B. Home header
- راست: عنوان «مسیر یادگیری» (حداکثر ۱–۲ خط با font scale)؛ زیرعنوان کوتاه مثل «قدم‌به‌قدم جلو می‌ریم».
- چپ: settings icon button (target حداقل 48dp). شخصیت Main می‌تواند به شکل bust کوچک/محدود کنار heading قرار بگیرد، نه hero غالب.
- header در 360dp باید بدون overlap و بدون فشردگی title/action باشد.

### C. Chapter progress card
- یک card سفید raised-soft، 16–20dp padding، radius 24–28dp.
- ردیف بالا: grade pill (مثلاً «پایهٔ اول») و chapter title (محتوای واقعی).
- ردیف میانی: متن توضیح و progress textual (مثلاً ۳ از ۸ ایستگاه)؛ اعداد با ShomaraDigits/format موجود.
- ردیف پایین: progress bar با semantic range; مقدار را از ViewModel/evaluator بگیر، نه تعداد visible nodes.
- اگر progress unavailable است، loading/error/empty surface نشان بده؛ progress صفر فرضی نساز.

### D. Continue / current station card
- Card برجسته و واحد؛ عنوان کوتاه «از آخرین نقطه ادامه بده» و عنوان واقعی station.
- متن کمکی 1–2 خط؛ CTA اصلی «ادامه مسیر» یا «شروع ایستگاه» متناسب با real session state.
- Number می‌تواند کنار مفهوم عددی ظاهر شود. Main برای greeting یا encouragement محدود. Fandogh در practice/empty hint، فقط اگر relevant.
- از trophy/coin/streak/heart/XP و پاداش غیرواقعی استفاده نشود.
- CTA ثابت و در دسترس، ولی هیچ UI overlay نباید station label را بپوشاند.

### E. Learning path title and chapter band
- عنوان «مسیر تو» همراه chip فصل، بدون «See all» غیرضروری.
- chapter separator با رنگ فصلی (از theme موجود) یا ribbon گرافیکی؛ فقط یک ribbon در هر مرز فصل.
- مسیر باید continuous و موجی/zigzag باشد و پشت nodeها قرار بگیرد. از geometry محاسبه‌شده و تست‌شدهٔ `ShomaraPathGraph` استفاده شود.
- RTL باید start/right winding را رعایت کند؛ جهت عدد و ریاضی mirror نشود.

### F. Node types
- Completed: green surface + check glyph + label «تکمیل‌شده»؛ در perfect می‌توان ring/mark دوم فقط وقتی domain مقدار perfect دارد.
- Current: یک node یگانه و Featured؛ violet/rich fill با inner highlight؛ شماره/lesson identity و CTA.
- هیچ state مصنوعی «Upcoming» اضافه نکنید؛ نودهای آینده مطابق domain در وضعیت واقعی Locked/Fresh قرار می‌گیرند و توضیح متناسب نمایش می‌دهند.
- Locked: خنثی با lock glyph و متن reason کوتاه. اگر tap برای guide/detail وجود دارد، operable بماند؛ `disabled` accessibility نشود و reason کامل در stateDescription ارائه شود.
- state فقط با رنگ منتقل نشود؛ آیکون، label، shape و TalkBack semantics لازم است.

### G. Bottom Navigation
- دقیقاً سه tab: «مسیر / تمرین / من». guardian/settings به عنوان tab چهارم اضافه نشود.
- عرض برابر، bottom surface کپسولی/rounded، active item با tint lavender و icon violet؛ inactive items خاکستری-بنفش.
- SVG source + Android VectorDrawable هر دو حالت active/inactive در package موجود است.
- `selected`/`Role.Tab` و stateDescription برای TalkBack. Tap سریع/دوگانه باید idempotent باشد و coordinator مسئول route باشد.

### H. Floating return-to-current action
- اگر page state و scroll offset نیاز به برگشت داشته باشند، FAB کوچک (48–52dp) در safe area و فقط پس از threshold واقعی scroll ظاهر شود.
- bottom content padding باید این action را جبران کند؛ هیچ label یا node آن زیر FAB مخفی نشود.
- در 360dp از overlay بزرگ و متنی طولانی خودداری شود؛ رفتار فعلی باید در note page 06 بررسی شود.

## 4. Component breakdown
1. `HomeHeader`
2. `IconButton` settings/help/back
3. `ChapterProgressCard`
4. `ContinueStationCard`
5. `ChapterRibbon`
6. `PathCanvas/Connector`
7. `PathNode`
8. `NodeStatusLabel`
9. `PathFab`
10. `BottomNavigationBar`
11. `Offline/Error/Empty/Loading Surface`
12. `CharacterSlot` (image only; not a new mascot renderer)
13. `LessonTopicIcon` (counting/addition/shapes/patterns)
14. `ProgressIndicator`
15. `LockedReasonSheet` (only when actual click action exists)

## 5. Content / API boundary
All displayed title, description, grade/chapter metadata, node order, station state, progress, CTA label, lock reason and actions must come from immutable UI state. The page is renderer only. No content, mastery, unlock, current station or completion is invented in composables.

## 6. Empty and exceptional behavior
- Fresh child: one actual Fresh/current station or explicit onboarding action from domain. Do not assume first node if no progress source exists.
- Null current station: preserve real placement semantics from ShomaraPathGraph.
- Offline: for this product offline is normal; no global red/offline banner unless a local asset is actually unavailable.
- missing content asset: honest local message and a real route/back action. Never silently substitute another station.
- error: concise child-friendly message and retry only when retry action exists.
- loading: keep layout stable; no skeleton shimmer under reduced motion.

## 7. Character placement rules
- Main: small companion in home header/intro; static shipped pose only.
- Number: learning-related support near numbers/counting or specific manipulative.
- Fandogh: optional guidance/empty/practice corner cameo, not decorative node label.
- Do not create off-model redraws, new faces or animation frames. Do not crop characters out of screenshots. Use original transparent WebP assets in repo.

## 8. Visual quality and interaction
- 24dp preferred horizontal screen inset; adaptive to 20dp or less only for measured width constraints.
- 48dp minimum touch; 72–80dp for early-grade manipulatives.
- Soft clay edge + subtle shadow; pressed reduces depth, not layout size.
- No nested shadows. No more than one featured surface per decision viewport.
- Use font Vazirmatn from project setup; numerals/digits use existing helper; never ship a font copy inside this pack.
- Colors and sizes use `HOME_VISUAL_TOKENS.json` for screen-local accent only, then map to canonical `ShomaraTokens`/codegen after design owner review.
