export default function Account({ initialTab = 'account' }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Account</h1>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Account management and order history will be displayed here.</p>
      </div>
    </div>
  )
}
