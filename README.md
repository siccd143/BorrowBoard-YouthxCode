# BorrowBoard

BorrowBoard is a student-to-student school resource network for borrowing classroom items, lending supplies, and recovering lost belongings. It helps students find things like chargers, calculators, safety goggles, rulers, and tools through trust scores, schedule-aware matching, pickup locations, QR-style handoffs, and a credits system.

## What It Does

- Lets students browse available school items and request a match.
- Allows students to list items they are willing to lend.
- Tracks borrowing/lending activity through a dashboard.
- Supports lost-and-found reports for missing or found items.
- Uses profile details, grade, school, pickup location, and schedule windows to improve matches.
- Includes credits, trust scores, return tracking, and handoff workflows.
- Supports image-assisted item classification for listing and lost-and-found flows.

## Main Pages

- **Home:** premium product landing page for BorrowBoard.
- **Auth:** email/password and Microsoft sign-in through Supabase Auth.
- **Dashboard:** active handoffs, recommendations, trust score, and activity timeline.
- **Borrow:** marketplace-style item browsing.
- **Request:** matching flow for finding an item.
- **List Item:** lender flow for adding items.
- **Lost & Found:** report and match lost/found belongings.
- **Schedule:** availability setup for smarter matching.
- **Credits:** rewards and trust activity.
- **Profile:** name, school info, pickup location, avatar, and sign out.

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth + Database:** Supabase
- **Icons:** lucide-react
- **Model Runtime:** local YOLO/Python flow, with optional hosted inference for production
- **Deployment:** Vercel

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and fill in your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Start the app:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Image Classifier

`/api/classify-image` runs our YOLO model directly in the Node.js runtime via
ONNX Runtime — the same code path locally and on Vercel, with **no Python
required** in production:

```text
models/yolo26n.onnx   # exported model weights, shipped into the function
lib/classify-onnx.ts  # sharp preprocessing + onnxruntime-node inference
```

Re-export from training with `model.export(format="onnx")` and drop the result
in at `models/yolo26n.onnx`. The class order in `lib/classify-onnx.ts`
(`CLASS_NAMES`) must match `models/metadata.yaml`.

`models/yolo26n.pt` + `scripts/classify_image.py` remain only for local
training/experiments and are no longer used by the API route.

Optional Roboflow fallback environment variables (used only if the ONNX model
fails to load):

```bash
npx vercel env add ROBOFLOW_API_KEY production
npx vercel env add ROBOFLOW_MODEL production
```

Current model path value:

```bash
school-supplies-gz456/1
```

Keep `ROBOFLOW_API_KEY` server-only. Do not expose it with `NEXT_PUBLIC_`.

## Credits

BorrowBoard was built as a collaborative project.

- **Ayaan:** product idea, design direction, frontend decisions, Supabase/auth setup, feature planning, testing, and project coordination.
- **Kevin:** trained/provided the item classification model work and helped shape the AI/model direction.
- **Codex / OpenAI:** assisted with implementation, UI development, debugging, responsive fixes, Supabase/Vercel setup, and code integration.

## Notes

This project is still evolving. Some features use demo/mock data while the backend, model integration, and production workflows continue to be improved.
