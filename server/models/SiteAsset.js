import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  home_main_banner_1_url: { type: String, default: '' },
  home_main_banner_2_url: { type: String, default: '' },
  home_main_banner_3_url: { type: String, default: '' },
  home_main_banner_4_url: { type: String, default: '' },
  home_middle_top_banner_url: { type: String, default: '' },
  home_middle_bottom_banner_url: { type: String, default: '' },
  home_right_story_banner_url: { type: String, default: '' },
  ad_banner_left_url: { type: String, default: '' },
  ad_banner_right_url: { type: String, default: '' },
  about_heading: { type: String, default: '' },
  about_description: { type: String, default: '' },
  about_image_url: { type: String, default: '' },
  header_text_1: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('SiteAsset', schema)
