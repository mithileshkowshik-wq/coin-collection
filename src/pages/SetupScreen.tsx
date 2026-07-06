export default function SetupScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-stone-100 p-6 text-stone-900">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">Almost there — connect Supabase</h1>
        <p className="mb-4 text-stone-600">
          The app needs your Supabase project credentials before it can store coins.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-stone-700">
          <li>
            Create a free project at{' '}
            <a href="https://supabase.com" className="font-medium text-amber-700 underline">
              supabase.com
            </a>
          </li>
          <li>
            In the SQL Editor, run the contents of <code className="rounded bg-stone-100 px-1">supabase/schema.sql</code>
          </li>
          <li>
            In Authentication → Users, add a user (email + password) for signing in
          </li>
          <li>
            Copy <code className="rounded bg-stone-100 px-1">.env.example</code> to{' '}
            <code className="rounded bg-stone-100 px-1">.env.local</code> and fill in the Project URL
            and anon key from Project Settings → API
          </li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    </div>
  )
}
