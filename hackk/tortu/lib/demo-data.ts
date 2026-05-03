import type { Listing, Profile, Transaction } from "@/lib/types";
export const categories = [
 {id:1,slug:"seramik",name_tr:"Seramik Atığı",name_en:"Ceramic Waste",description_tr:"Kırık seramik, şamot, fire",description_en:"Broken ceramics, chamotte, scrap"},
 {id:2,slug:"uzum-cibresi",name_tr:"Üzüm Cibresi",name_en:"Grape Pomace",description_tr:"Şarap üretimi yan ürünü",description_en:"Wine production by-product"},
 {id:3,slug:"bakliyat-kabugu",name_tr:"Bakliyat Kabuğu",name_en:"Pulse Husk",description_tr:"Nohut/mercimek/fasulye kabuğu",description_en:"Pulse husks"},
 {id:4,slug:"halı-tekstil",name_tr:"Halı/Tekstil Firesi",name_en:"Carpet/Textile Scrap",description_tr:"Halı ve tekstil üretim atığı",description_en:"Textile scrap"},
 {id:5,slug:"ahsap-talasi",name_tr:"Ahşap Talaşı",name_en:"Wood Shavings",description_tr:"Mobilya/marangoz atığı",description_en:"Wood waste"},
 {id:6,slug:"metal-hurda",name_tr:"Metal Hurda",name_en:"Metal Scrap",description_tr:"Demir, çelik, alüminyum hurda",description_en:"Metal scrap"},
 {id:7,slug:"plastik",name_tr:"Plastik Atığı",name_en:"Plastic Waste",description_tr:"Endüstriyel plastik fire",description_en:"Plastic scrap"},
 {id:8,slug:"insaat-molozu",name_tr:"İnşaat Molozu",name_en:"Construction Debris",description_tr:"Beton, tuğla parçaları",description_en:"Debris"},
 {id:9,slug:"tarim-atigi",name_tr:"Tarım Atığı",name_en:"Agricultural Waste",description_tr:"Saman, sap, kabuk",description_en:"Agricultural by-product"},
 {id:10,slug:"perlit-pomza",name_tr:"Perlit/Pomza",name_en:"Perlite/Pumice",description_tr:"Maden tozu yan ürünü",description_en:"Mining dust"},
 {id:11,slug:"peynir-suyu",name_tr:"Peyniraltı Suyu",name_en:"Whey",description_tr:"Peynir üretimi yan ürünü",description_en:"Whey"},
 {id:12,slug:"zeytin-pirinasi",name_tr:"Zeytin Pirinası",name_en:"Olive Pomace",description_tr:"Zeytinyağı üretimi yan ürünü",description_en:"Olive pomace"}
];
export const profiles: Profile[] = [
 {id:"producer1",full_name:"Avanos Ustası",company_name:"Avanos Seramik Atölyesi",role:"producer",email:"producer1@tortu.app",city:"Nevşehir",address:"Avanos, Nevşehir",latitude:38.717,longitude:34.848,total_co2_saved_kg:410,total_revenue_try:46000,total_purchases_try:0},
 {id:"producer2",full_name:"Ürgüp Bağcısı",company_name:"Ürgüp Şaraphanesi",role:"producer",email:"producer2@tortu.app",city:"Nevşehir",address:"Ürgüp, Nevşehir",latitude:38.631,longitude:34.912,total_co2_saved_kg:720,total_revenue_try:62000,total_purchases_try:0},
 {id:"producer3",full_name:"Niğde Operasyon",company_name:"Niğde Bakliyat A.Ş.",role:"producer",email:"producer3@tortu.app",city:"Niğde",address:"Niğde OSB",latitude:37.97,longitude:34.676,total_co2_saved_kg:530,total_revenue_try:37000,total_purchases_try:0},
 {id:"buyer1",full_name:"Yeşil Operasyon",company_name:"Yeşil Geri Dönüşüm Ltd.",role:"buyer",email:"buyer1@tortu.app",city:"Kayseri",address:"Kayseri OSB",latitude:38.7205,longitude:35.4826,total_co2_saved_kg:1160,total_revenue_try:0,total_purchases_try:84000},
 {id:"admin",full_name:"Tortu Admin",company_name:"Tortu Operasyon",role:"both",email:"admin@tortu.app",city:"Nevşehir",address:"Nevşehir",latitude:38.6244,longitude:34.7142,total_co2_saved_kg:0,total_revenue_try:0,total_purchases_try:0,is_admin:true}
];
export const listings: Listing[] = [
 {id:"avanos-seramik",seller_id:"producer1",title:"2 ton kırık şamot ve seramik fire",description:"Avanos seramik üretiminden çıkan temiz, ayrıştırılmış kırık şamot.",category_slug:"seramik",quantity_value:2,quantity_unit:"ton",price_try:1500,is_export_eligible:true,gtip_code:"6909",preferred_transport_mode:"road",photo_urls:["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80"],pickup_latitude:38.717,pickup_longitude:34.848,pickup_address:"Avanos, Nevşehir",pickup_city:"Avanos",status:"active",created_at:"2026-05-02T09:00:00Z"},
 {id:"urgup-uzum",seller_id:"producer2",title:"800 kg üzüm cibresi",description:"Ürgüp şarap üretimi sonrası taze üzüm posası.",category_slug:"uzum-cibresi",quantity_value:800,quantity_unit:"kg",price_try:800,is_export_eligible:true,gtip_code:"2308",preferred_transport_mode:"road",photo_urls:["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80"],pickup_latitude:38.631,pickup_longitude:34.912,pickup_address:"Ürgüp, Nevşehir",pickup_city:"Ürgüp",status:"active",created_at:"2026-05-02T09:20:00Z"},
 {id:"nigde-nohut",seller_id:"producer3",title:"1.5 ton nohut kabuğu",description:"Niğde Bakliyat tesisinden çıkan kuru nohut kabuğu.",category_slug:"bakliyat-kabugu",quantity_value:1.5,quantity_unit:"ton",price_try:600,is_export_eligible:false,preferred_transport_mode:"rail",photo_urls:["https://images.unsplash.com/photo-1627735483792-f24670ebc356?auto=format&fit=crop&w=1200&q=80"],pickup_latitude:37.97,pickup_longitude:34.676,pickup_address:"Niğde OSB",pickup_city:"Niğde",status:"active",created_at:"2026-05-02T09:30:00Z"},
 {id:"hacibektas-hali",seller_id:"producer1",title:"200 kg halı ve tekstil firesi",description:"Hacıbektaş bölgesinden ayrılmış halı kenar firesi.",category_slug:"halı-tekstil",quantity_value:200,quantity_unit:"kg",price_try:1200,is_export_eligible:false,preferred_transport_mode:"road",photo_urls:["https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=1200&q=80"],pickup_latitude:38.941,pickup_longitude:34.557,pickup_address:"Hacıbektaş, Nevşehir",pickup_city:"Hacıbektaş",status:"active",created_at:"2026-05-02T10:00:00Z"},
 {id:"acigol-perlit",seller_id:"producer3",title:"5 ton perlit/pomza tozu",description:"Acıgöl madencilik hattından elenmiş perlit-pomza ince fraksiyon.",category_slug:"perlit-pomza",quantity_value:5,quantity_unit:"ton",price_try:400,is_export_eligible:true,gtip_code:"2530",preferred_transport_mode:"rail",photo_urls:["https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"],pickup_latitude:38.551,pickup_longitude:34.518,pickup_address:"Acıgöl, Nevşehir",pickup_city:"Acıgöl",status:"active",created_at:"2026-05-02T10:10:00Z"}
];
export const transactions: Transaction[] = [
 {id:"tx-001",listing_id:"avanos-seramik",seller_id:"producer1",buyer_id:"buyer1",quantity:1.2,total_try:1800,distance_km:88,transport_mode:"road",co2_kg:10.56,carbon_cost_try:3.7,usd_rate:32.4,eur_rate:35.1,status:"completed",created_at:"2026-04-28T10:00:00Z",completed_at:"2026-04-28T12:00:00Z"},
 {id:"tx-002",listing_id:"urgup-uzum",seller_id:"producer2",buyer_id:"buyer1",quantity:.8,total_try:640,distance_km:170,transport_mode:"road",co2_kg:13.6,carbon_cost_try:4.7,usd_rate:32.4,eur_rate:35.1,status:"completed",created_at:"2026-04-29T10:00:00Z",completed_at:"2026-04-29T12:00:00Z"}
];
export function getCategory(slug:string){ return categories.find(c=>c.slug===slug) ?? categories[0]; }
export function getSeller(id:string){ return profiles.find(p=>p.id===id) ?? profiles[0]; }
export function toTon(value:number, unit:Listing["quantity_unit"]){ if(unit==="kg") return value/1000; if(unit==="m3") return value*.6; if(unit==="piece") return value*.02; return value; }
