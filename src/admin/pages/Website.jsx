import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { fetchBusinessSettings, updateBusinessSettings, fetchSiteAssets, updateSiteAssets } from '../services/adminService'
import { Toggle } from '../../components/ui'
import ImageUploader from '../../components/ui/ImageUploader'

export default function AdminWebsite() {
  const [tab, setTab] = useState('business')
  const [business, setBusiness] = useState({
    business_name: 'My Store', business_tagline: '', business_email: '', business_phone: '',
    business_address: '', currency: 'INR', currency_symbol: '₹', logo_url: '', favicon_url: '',
    theme_color: '#16a34a', footer_text: '', social_links: {}, terms_page: '', privacy_page: '', refund_page: '', delivery_page: ''
  })
  const [siteAssets, setSiteAssets] = useState({
    logo_url: '', favicon_url: '', header_text_1: 'Free delivery', header_text_2: 'Farm fresh',
    home_main_banner_1_url: '', home_main_banner_2_url: '', home_main_banner_3_url: '', home_main_banner_4_url: '',
    home_middle_top_banner_url: '', home_middle_bottom_banner_url: '', home_right_story_banner_url: '',
    ad_banner_left_url: '', ad_banner_right_url: '', about_heading: '', about_description: '', about_image_url: ''
  })
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([fetchBusinessSettings(), fetchSiteAssets()]).then(([b, s]) => {
      if (b) setBusiness(b); if (s) setSiteAssets(s); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const saveBusiness = async () => { setSaving(true); try { await updateBusinessSettings(business); toast.success('Business settings saved') } catch (e) { toast.error(e.message) }; setSaving(false) }
  const saveSiteAssets = async () => { setSaving(true); try { await updateSiteAssets(siteAssets); toast.success('Site assets saved') } catch (e) { toast.error(e.message) }; setSaving(false) }

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Website Settings</h1>
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {[{key:'business',label:'Business'},{key:'banners',label:'Banners'},{key:'about',label:'About'},{key:'policies',label:'Policies'}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-md px-4 py-2 text-sm font-semibold transition ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'business' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Business Name</label><input value={business.business_name} onChange={e => setBusiness({...business, business_name: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold mb-1">Tagline</label><input value={business.business_tagline} onChange={e => setBusiness({...business, business_tagline: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Email</label><input value={business.business_email} onChange={e => setBusiness({...business, business_email: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold mb-1">Phone</label><input value={business.business_phone} onChange={e => setBusiness({...business, business_phone: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Address</label><textarea value={business.business_address} onChange={e => setBusiness({...business, business_address: e.target.value})} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Currency Symbol</label><input value={business.currency_symbol} onChange={e => setBusiness({...business, currency_symbol: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold mb-1">Theme Color</label><input type="color" value={business.theme_color} onChange={e => setBusiness({...business, theme_color: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 h-10" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1">Logo URL</label><input value={business.logo_url} onChange={e => setBusiness({...business, logo_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-semibold mb-1">Favicon URL</label><input value={business.favicon_url} onChange={e => setBusiness({...business, favicon_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-semibold mb-1">Footer Text</label><textarea value={business.footer_text} onChange={e => setBusiness({...business, footer_text: e.target.value})} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="flex justify-end pt-4 border-t"><button onClick={saveBusiness} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button></div>
        </div>
      )}

      {tab === 'banners' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-3xl">
          <h2 className="font-semibold text-slate-900">Homepage Banners</h2>
          {['home_main_banner_1_url','home_main_banner_2_url','home_main_banner_3_url','home_main_banner_4_url'].map(key => (
            <div key={key}><label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">{key.replace(/_/g,' ')}</label><input value={siteAssets[key]||''} onChange={e => setSiteAssets({...siteAssets, [key]: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Middle Top Banner</label><input value={siteAssets.home_middle_top_banner_url||''} onChange={e => setSiteAssets({...siteAssets, home_middle_top_banner_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Middle Bottom Banner</label><input value={siteAssets.home_middle_bottom_banner_url||''} onChange={e => setSiteAssets({...siteAssets, home_middle_bottom_banner_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Right Story Banner</label><input value={siteAssets.home_right_story_banner_url||''} onChange={e => setSiteAssets({...siteAssets, home_right_story_banner_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Header Text</label><input value={siteAssets.header_text_1} onChange={e => setSiteAssets({...siteAssets, header_text_1: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Ad Left</label><input value={siteAssets.ad_banner_left_url||''} onChange={e => setSiteAssets({...siteAssets, ad_banner_left_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1 uppercase">Ad Right</label><input value={siteAssets.ad_banner_right_url||''} onChange={e => setSiteAssets({...siteAssets, ad_banner_right_url: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex justify-end pt-4 border-t"><button onClick={saveSiteAssets} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button></div>
        </div>
      )}

      {tab === 'about' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-3xl">
          <div><label className="block text-sm font-semibold mb-1">About Heading</label><input value={siteAssets.about_heading||''} onChange={e => setSiteAssets({...siteAssets, about_heading: e.target.value})} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">About Description</label><textarea value={siteAssets.about_description||''} onChange={e => setSiteAssets({...siteAssets, about_description: e.target.value})} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <ImageUploader value={siteAssets.about_image_url||''} onChange={v => setSiteAssets({...siteAssets, about_image_url: v})} label="About Image" />
          <div className="flex justify-end pt-4 border-t"><button onClick={saveSiteAssets} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button></div>
        </div>
      )}

      {tab === 'policies' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-3xl">
          <div><label className="block text-sm font-semibold mb-1">Terms & Conditions URL/Text</label><textarea value={business.terms_page||''} onChange={e => setBusiness({...business, terms_page: e.target.value})} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">Privacy Policy URL/Text</label><textarea value={business.privacy_page||''} onChange={e => setBusiness({...business, privacy_page: e.target.value})} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">Refund Policy URL/Text</label><textarea value={business.refund_page||''} onChange={e => setBusiness({...business, refund_page: e.target.value})} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-semibold mb-1">Delivery Policy URL/Text</label><textarea value={business.delivery_page||''} onChange={e => setBusiness({...business, delivery_page: e.target.value})} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
          <div className="flex justify-end pt-4 border-t"><button onClick={saveBusiness} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button></div>
        </div>
      )}
    </div>
  )
}
