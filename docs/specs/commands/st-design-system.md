# `/st:design-system` - Define Project Design System

> Trạng thái: ✅ Approved (sau research + brainstorming)

## Tổng quan

Xác định design system cho toàn bộ project: aesthetic direction, typography, color, spacing, layout, motion, decoration. Lưu vào `.superteam/DESIGN-SYSTEM.md`. Dùng bởi `/st:ui-design` cho mọi page/component. Hai chiều: `/st:ui-design` có thể suggest update lên, `/st:design-system` có thể infer từ code hiện tại.

## Quyết định thiết kế

| Quyết định | Kết quả | Lý do |
|---|---|---|
| Scope | 7 dimensions: Aesthetic, Typography, Color, Spacing, Layout, Motion, Decoration | Full, coherent system |
| Research | WebSearch + Playwright screenshot top 3-5 sites cùng space | Biết landscape → đề xuất SAFE/RISK có cơ sở |
| Proposal | SAFE choices vs RISKS — 1 đề xuất toàn bộ, user adjust | Consultant approach, không form wizard |
| AI slop | 7 core anti-patterns + nguyên tắc chung | Cụ thể cho patterns phổ biến, flexible cho patterns mới |
| Font lists | Blacklist (14) + overused (8) + recommended by purpose | Proven từ gstack |
| Coherence | Nudge nhẹ khi mismatch, luôn chấp nhận user decision | Cảnh báo 1 lần, không block |
| Preview | Playwright MCP — HTML preview với mockups | Consistent với /st:ui-design |
| Output | `.superteam/DESIGN-SYSTEM.md` | Gọn trong .superteam/ |
| Interaction | Hai chiều với /st:ui-design — suggest update cả hai hướng | System sống, không static |
| Brownfield | Detect + infer design system từ code hiện tại | Adopt design system không cần từ zero |
| Image input | Accept reference, inspiration, wireframe bất cứ lúc nào | Visual input cho design decisions |

## Flow

```
1. Input
   - User: "/st:design-system" hoặc được gợi ý từ /st:ui-design
   - Image input: reference sites, mood boards, wireframes
    ↓
2. Pre-checks
   - .superteam/DESIGN-SYSTEM.md tồn tại?
     → Có: đọc, hỏi "Update, bắt đầu lại, hay hủy?"
     → Không: tiếp tục
   - Detect existing UI code (brownfield)?
     → Có: scan codebase, extract actual fonts/colors/spacing đang dùng
       "Project đã có UI code. Tôi detect được: [fonts], [colors],
        [spacing]. Dùng làm baseline hay bắt đầu từ zero?"
     → Không: tiếp tục
   - Load context: .superteam/config.json, PROJECT.md, README.md
    ↓
3. Product Context (1 câu hỏi bao quát)
   - AI tổng hợp từ codebase + PROJECT.md:
     "Từ codebase, tôi thấy đây là [X] cho [Y] trong ngành [Z].
      Đúng không? Và muốn tôi research landscape không?"
   - Confirm: product type, target users, industry
   - User chọn: research hay dùng built-in knowledge
    ↓
4. Research (optional, nếu user đồng ý)
   - WebSearch: "best [industry] web apps 2025", "[category] website design"
   - Playwright: visit top 3-5 sites → screenshot + phân tích:
     → Fonts thực tế (extract từ rendered page)
     → Color palette
     → Layout approach, spacing density
     → Aesthetic direction
   - Tổng hợp:
     "Landscape: converge on [patterns]. Most feel [observation].
      Opportunity to stand out: [gap]."
   - Graceful degradation:
     Playwright available → richest research
     Playwright unavailable → WebSearch only
     WebSearch unavailable → built-in design knowledge
    ↓
5. Propose từng dimension (1 per message, visual-first)

   Propose lần lượt 7 dimensions. Mỗi dimension 1 message.

   Visual dimensions (typography, color, decoration, spacing, layout)
   → PHẢI có HTML preview + screenshot KÈM THEO khi propose.
     Không chỉ describe bằng text rồi hỏi approve.
     (Tuân thủ core-principles: Visual-First)

   Non-visual dimensions (aesthetic direction, motion)
   → Text description + rationale là đủ.

   Mỗi dimension kèm:
   - Rationale
   - SAFE choice vs RISK choice
   - AI slop check (nếu relevant)
   - Recommend + Confidence

   10 aesthetic directions:
   Brutally Minimal | Maximalist Chaos | Retro-Futuristic |
   Luxury/Refined | Playful | Editorial/Magazine |
   Brutalist/Raw | Art Deco | Organic/Natural | Industrial

   Font rules:
   - Blacklist (14, cấm): Papyrus, Comic Sans, Lobster, Impact,
     Jokerman, Bleeding Cowboys, Permanent Marker, Bradley Hand,
     Brush Script, Hobo, Trajan, Raleway, Clash Display,
     Courier New (for body)
   - Overused (8, cảnh báo): Inter, Roboto, Arial, Helvetica,
     Open Sans, Lato, Montserrat, Poppins
   - Recommended by purpose:
     Display: Satoshi, General Sans, Instrument Serif, Fraunces,
              Clash Grotesk, Cabinet Grotesk
     Body: Instrument Sans, DM Sans, Source Sans 3, Geist,
           Plus Jakarta Sans, Outfit
     Data: Geist (tabular-nums), DM Sans (tabular-nums),
           JetBrains Mono, IBM Plex Mono
     Code: JetBrains Mono, Fira Code, Berkeley Mono, Geist Mono

   AI slop anti-patterns (7 core + nguyên tắc):
   1. Purple/violet gradients làm accent mặc định
   2. 3-column feature grid với icons trong colored circles
   3. Centered everything với uniform spacing
   4. Uniform bubbly border-radius trên mọi element
   5. Generic hero copy ("Welcome to [X]", "Unlock the power of...")
   6. Decorative blobs, floating circles, wavy SVG dividers
   7. Cookie-cutter section rhythm
   + Nguyên tắc: "Would a human designer at a respected studio
     ship this? If zero creative direction → flag it."

   User options:
   → Approve → preview
   → Adjust [section] → drill-down
   → Different risks → show wilder options
   → Start over
    ↓
6. Drill-downs (nếu user muốn adjust)
   - Fonts: 3-5 candidates với rationale, explain what each evokes
   - Colors: 2-3 palette options với hex, explain color theory
   - Mỗi drill-down là 1 focused question
   - Sau mỗi change → coherence check:
     → Mismatch? Nudge nhẹ 1 lần, giải thích tại sao unusual
     → Offer alternative
     → Luôn chấp nhận user decision, không block, không hỏi lại
    ↓
7. Full-System Preview trên Playwright (sau khi tất cả dimensions approved)
   - Tạo HTML preview page tổng hợp (self-contained, no framework):
     → Load approved fonts từ Google Fonts / Bunny Fonts
     → Dùng approved color palette throughout
     → Font specimen: mỗi font trong approved role
     → Color swatches với hex + sample UI components
     → Realistic mockups theo project type:
       Dashboard → data table, sidebar, stat cards
       Marketing → hero, features, testimonial, CTA
       Admin → form, toggles, dropdowns
     → Light/dark mode toggle (default: light)
     → Responsive
   - Mở qua Playwright MCP → user xem toàn bộ system together
   - User feedback → adjust → regenerate preview
   - Loop cho đến satisfied
   Note: đây là preview TỔNG HỢP. Mỗi visual dimension đã có
   preview riêng ở step 5. Step này kiểm tra coherence giữa
   tất cả dimensions khi kết hợp.
    ↓
8. Write DESIGN-SYSTEM.md
   - Lưu vào .superteam/DESIGN-SYSTEM.md
   - Commit: "design: create design system for [project]"
    ↓
9. Done
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ST ► DESIGN SYSTEM CREATED ✓
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Aesthetic: [direction]
   Fonts: [display] / [body] / [data]
   Colors: [primary] / [secondary]
   ▶ Dùng /st:ui-design để design pages
```

## DESIGN-SYSTEM.md Format

```markdown
# Design System — [Project Name]

## Product Context
- **What this is:** [1-2 sentence description]
- **Who it's for:** [target users]
- **Space/industry:** [category, peers]
- **Project type:** [web app / dashboard / marketing site / editorial / internal tool]

## Aesthetic Direction
- **Direction:** [name]
- **Decoration level:** [minimal / intentional / expressive]
- **Mood:** [1-2 sentence description of how the product should feel]
- **Reference sites:** [URLs, if research was done]

## Typography
- **Display/Hero:** [font name] — [rationale]
- **Body:** [font name] — [rationale]
- **UI/Labels:** [font name or "same as body"]
- **Data/Tables:** [font name] — [rationale, must support tabular-nums]
- **Code:** [font name]
- **Loading:** [CDN URL or self-hosted strategy]
- **Scale:** [modular scale with specific px/rem values for each level]

## Color
- **Approach:** [restrained / balanced / expressive]
- **Primary:** [hex] — [what it represents, usage]
- **Secondary:** [hex] — [usage]
- **Neutrals:** [warm/cool grays, hex range from lightest to darkest]
- **Semantic:** success [hex], warning [hex], error [hex], info [hex]
- **Dark mode:** [strategy — redesign surfaces, reduce saturation 10-20%]

## Spacing
- **Base unit:** [4px or 8px]
- **Density:** [compact / comfortable / spacious]
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approach:** [grid-disciplined / creative-editorial / hybrid]
- **Grid:** [columns per breakpoint]
- **Max content width:** [value]
- **Border radius:** [hierarchical scale — e.g., sm:4px, md:8px, lg:12px, full:9999px]

## Motion
- **Approach:** [minimal-functional / intentional / expressive]
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| [today] | Initial design system created | Created by /st:design-system based on [product context / research] |
```

## Coherence Validation

Khi user override 1 section → check coherence với các section khác:

| Aesthetic | + Override | Tại sao clash |
|---|---|---|
| Brutalist/Minimal | + Expressive motion | Raw = không trang trí, expressive = rất decorative |
| Luxury/Refined | + Compact spacing | Luxury cần breathe, compact = chật |
| Playful | + Restrained color | Playful cần color energy, restrained thiếu personality |
| Editorial/Magazine | + Data-heavy layout | Editorial = asymmetric + whitespace, data = dense |
| Industrial | + Expressive decoration | Industrial = function-first, decoration = ornamental |

**Cách xử lý:** Nudge nhẹ 1 lần → offer alternative → luôn chấp nhận user decision → không block → không hỏi lại.

## Interaction với `/st:ui-design` (hai chiều)

```
/st:ui-design → /st:design-system:
  Khi design page mới, phát hiện cần color/component chưa có
  → Suggest: "Chart colors chưa có trong design system.
    Thêm vào DESIGN-SYSTEM.md không?"
  → User confirm → update file + ghi Decisions Log

/st:design-system → infer từ code:
  Khi chạy trên brownfield project (có UI code, chưa có design system)
  → Scan codebase: extract fonts, colors, spacing thực tế
  → "Detect: [fonts], [colors], [spacing]. Dùng làm baseline?"
  → User confirm → tạo DESIGN-SYSTEM.md từ inferred values
```

## So sánh

| | GSD | gstack | Superteam |
|---|---|---|---|
| Command riêng | Không | `/design-consultation` | `/st:design-system` |
| Scope | 5 dims (per-phase) | 7 dims (project-level) | 7 dims (project-level) |
| Research | Không | WebSearch + browse | WebSearch + Playwright |
| Aesthetic directions | Không | 10 hướng | 10 hướng |
| SAFE/RISK | Không | Có | Có |
| Font blacklist | Không | 14 blacklist + 8 overused | 14 blacklist + 8 overused |
| AI slop | Không | 7 + 10 (hardcoded) | 7 core + nguyên tắc chung |
| Coherence check | Không | Nudge | Nudge |
| Preview | Không | `open` browser | Playwright MCP |
| Brownfield support | Detect library | Extract from rendered | Infer từ codebase |
| Interaction với UI | UI-SPEC per-phase | design-review audit | Hai chiều suggest |
| Output | UI-SPEC.md | DESIGN.md (root) | .superteam/DESIGN-SYSTEM.md |

## Cải thiện so với industry

1. **SAFE/RISK breakdown** → user biết đâu safe, đâu lấy creative risk, có cơ sở từ research
2. **AI slop detection** → core list + nguyên tắc, chống generic AI output
3. **Coherence validation** → nudge nhẹ khi mismatch, không block
4. **Playwright preview** → consistent với /st:ui-design pipeline
5. **Hai chiều với /st:ui-design** → design system sống, không static document
6. **Brownfield support** → infer từ code hiện tại, không cần từ zero
7. **Font curation** → blacklist + overused + recommended by purpose
