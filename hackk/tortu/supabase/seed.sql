INSERT INTO waste_categories (slug,name_tr,name_en,description_tr,description_en,icon) VALUES
('seramik','Seramik Atığı','Ceramic Waste','Kırık seramik, şamot, fire','Broken ceramics, chamotte, scrap','Archive'),
('uzum-cibresi','Üzüm Cibresi','Grape Pomace','Şarap üretimi yan ürünü','Wine production by-product','Grape'),
('bakliyat-kabugu','Bakliyat Kabuğu','Pulse Husk','Nohut/mercimek/fasulye kabuğu','Pulse husks','Wheat'),
('halı-tekstil','Halı/Tekstil Firesi','Carpet/Textile Scrap','Halı ve tekstil üretim atığı','Textile scrap','Scissors'),
('perlit-pomza','Perlit/Pomza','Perlite/Pumice','Maden tozu yan ürünü','Mining dust','Mountain') ON CONFLICT (slug) DO NOTHING;
-- Demo auth users: producer1@tortu.app, producer2@tortu.app, producer3@tortu.app, buyer1@tortu.app, buyer2@tortu.app, admin@tortu.app / Tortu2026!
