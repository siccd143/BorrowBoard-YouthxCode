# BorrowBoard

BorrowBoard is a school borrowing app built with Next.js, Supabase, Tailwind CSS, and a trained image classifier for item listing and lost-and-found flows.

## Local Setup

Install app dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and fill in the Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Install the local image model runtime:

```bash
npm run model:install
```

Start the app:

```bash
npm run dev
```

## Image Classifier

Locally, `/api/classify-image` uses `models/yolo26n.pt` through `scripts/classify_image.py`.

On Vercel, use hosted Roboflow inference instead of local Python/PyTorch:

```bash
npx vercel env add ROBOFLOW_API_KEY production
npx vercel env add ROBOFLOW_MODEL production
```

Use this model value unless the model is changed:

```bash
school-supplies-gz456/1
```

After adding or changing Vercel env vars, redeploy:

```bash
npx vercel deploy --prod
```

Keep `ROBOFLOW_API_KEY` server-only. Never rename it to `NEXT_PUBLIC_ROBOFLOW_API_KEY`.
