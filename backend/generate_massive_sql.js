const fs = require('fs');

const raw = `('prod_001', 'iPhone 15 Pro', 129999, 139999, 'Latest Apple flagship with titanium design', 'Electronics', 'https://images.unsplash.com/photo-1696446702183-cbd01e09f3c2?w=500', 4.8, 'Apple', 50, true),
('prod_002', 'Samsung Galaxy S24', 99999, 109999, 'Samsung flagship with AI features', 'Electronics', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', 4.7, 'Samsung', 45, true),
('prod_003', 'OnePlus 12', 69999, 74999, 'Flagship killer with Snapdragon 8 Gen 3', 'Electronics', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500', 4.6, 'OnePlus', 60, false),
('prod_004', 'MacBook Air M2', 114999, 119999, 'Thin and light laptop with M2 chip', 'Computers', 'https://images.unsplash.com/photo-1611186871525-7d98e5b97598?w=500', 4.9, 'Apple', 30, true),
('prod_005', 'Dell XPS 15', 149999, 159999, 'Premium Windows laptop with OLED display', 'Computers', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500', 4.7, 'Dell', 20, false),
('prod_006', 'Sony WH-1000XM5', 29999, 34999, 'Industry leading noise cancelling headphones', 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 4.8, 'Sony', 80, true),
('prod_007', 'Apple AirPods Pro', 24999, 27999, 'Active noise cancellation earbuds', 'Audio', 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=500', 4.7, 'Apple', 100, true),
('prod_008', 'Samsung 65 QLED TV', 89999, 99999, '4K QLED Smart TV with HDR', 'TV', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', 4.6, 'Samsung', 15, false),
('prod_009', 'LG OLED 55', 79999, 89999, 'Perfect blacks OLED Smart TV', 'TV', 'https://images.unsplash.com/photo-1571415060716-baff5f717c37?w=500', 4.8, 'LG', 12, true),
('prod_010', 'iPad Pro 12.9', 109999, 114999, 'Most powerful iPad with M2 chip', 'Tablets', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', 4.8, 'Apple', 35, true),
('prod_011', 'Samsung Galaxy Tab S9', 74999, 79999, 'Premium Android tablet', 'Tablets', 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=500', 4.6, 'Samsung', 40, false),
('prod_012', 'Logitech MX Master 3', 8999, 9999, 'Advanced wireless mouse for productivity', 'Accessories', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', 4.7, 'Logitech', 150, false),
('prod_013', 'Keychron K8 Keyboard', 6999, 7999, 'TKL mechanical keyboard with RGB', 'Accessories', 'https://images.unsplash.com/photo-1601445638532-1f0a71ade05a?w=500', 4.5, 'Keychron', 90, false),
('prod_014', 'Nike Air Max 270', 12999, 14999, 'Comfortable running shoes with Air unit', 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 4.5, 'Nike', 200, true),
('prod_015', 'Adidas Ultraboost 23', 14999, 16999, 'Premium running shoes with boost sole', 'Footwear', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500', 4.6, 'Adidas', 180, false),
('prod_016', 'Levis 501 Jeans', 4999, 5999, 'Classic straight fit denim jeans', 'Clothing', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 4.4, 'Levis', 300, false),
('prod_017', 'Nike Dri-FIT T-Shirt', 1999, 2499, 'Moisture wicking sports t-shirt', 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 4.3, 'Nike', 500, false),
('prod_018', 'Canon EOS R6', 229999, 249999, 'Full frame mirrorless camera', 'Cameras', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500', 4.8, 'Canon', 20, true),
('prod_019', 'Sony A7 IV', 249999, 269999, 'Professional mirrorless camera', 'Cameras', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500', 4.9, 'Sony', 15, true),
('prod_020', 'GoPro Hero 12', 44999, 49999, 'Action camera with HyperSmooth stabilization', 'Cameras', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500', 4.6, 'GoPro', 60, false),
('prod_021', 'Dyson V15 Vacuum', 59999, 64999, 'Cordless vacuum with laser dust detection', 'Home', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500', 4.7, 'Dyson', 25, true),
('prod_022', 'Instant Pot Duo 7-in-1', 8999, 10999, 'Multi-use electric pressure cooker', 'Kitchen', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', 4.6, 'Instant Pot', 70, false),
('prod_023', 'Nespresso Vertuo', 14999, 17999, 'Premium capsule coffee machine', 'Kitchen', 'https://images.unsplash.com/photo-1570087636768-9ee8f8b2e7e6?w=500', 4.5, 'Nespresso', 45, false),
('prod_024', 'KitchenAid Stand Mixer', 44999, 49999, 'Professional 5Qt tilt-head stand mixer', 'Kitchen', 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500', 4.8, 'KitchenAid', 30, true),
('prod_025', 'Fitbit Charge 6', 14999, 16999, 'Advanced health and fitness tracker', 'Wearables', 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500', 4.4, 'Fitbit', 120, false),
('prod_026', 'Apple Watch Series 9', 41999, 44999, 'Most advanced Apple Watch with Double Tap', 'Wearables', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', 4.8, 'Apple', 80, true),
('prod_027', 'Samsung Galaxy Watch 6', 29999, 32999, 'Premium Android smartwatch with health sensors', 'Wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 4.5, 'Samsung', 75, false),
('prod_028', 'Nintendo Switch OLED', 34999, 37999, 'Hybrid gaming console with vibrant OLED screen', 'Gaming', 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500', 4.8, 'Nintendo', 40, true),
('prod_029', 'PS5 DualSense Controller', 6999, 7999, 'Next-gen controller with haptic feedback', 'Gaming', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500', 4.7, 'Sony', 100, false),
('prod_030', 'Xbox Series X', 49999, 54999, 'Most powerful Xbox console ever made', 'Gaming', 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500', 4.7, 'Microsoft', 35, true),
('prod_031', 'Bose SoundLink Flex', 11999, 13999, 'Waterproof portable Bluetooth speaker', 'Audio', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 4.6, 'Bose', 90, false),
('prod_032', 'JBL Charge 5', 14999, 16999, 'Portable speaker with built-in power bank', 'Audio', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 4.5, 'JBL', 85, false),
('prod_033', 'Anker 65W GaN Charger', 2999, 3499, 'Compact fast charging GaN wall charger', 'Accessories', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.6, 'Anker', 300, false),
('prod_034', 'Samsung T7 1TB SSD', 7999, 8999, 'Portable USB NVMe SSD drive', 'Storage', 'https://images.unsplash.com/photo-1597138804456-e7dca7f59d54?w=500', 4.7, 'Samsung', 200, false),
('prod_035', 'WD 4TB Hard Drive', 6999, 7999, 'External hard drive for reliable backup', 'Storage', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500', 4.4, 'WD', 150, false),
('prod_036', 'LG 27 4K Monitor', 34999, 39999, '4K UHD IPS monitor with USB-C', 'Monitors', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', 4.7, 'LG', 40, true),
('prod_037', 'Dell 32 Curved Monitor', 44999, 49999, 'QHD curved gaming monitor 165Hz', 'Monitors', 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500', 4.6, 'Dell', 25, false),
('prod_038', 'Kindle Paperwhite', 13999, 15999, 'Waterproof e-reader with adjustable warm light', 'Books', 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500', 4.7, 'Amazon', 100, false),
('prod_039', 'Ring Video Doorbell', 9999, 11999, 'Smart video doorbell with HD video and alerts', 'Smart Home', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.4, 'Ring', 60, false),
('prod_040', 'Google Nest Hub', 9999, 11999, 'Smart home display with Google Assistant', 'Smart Home', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.5, 'Google', 55, false),
('prod_041', 'Philips Hue Starter Kit', 12999, 14999, 'Smart LED color bulbs with bridge', 'Smart Home', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.5, 'Philips', 70, false),
('prod_042', 'Roomba i7 Plus', 59999, 64999, 'Robot vacuum with automatic dirt disposal', 'Home', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500', 4.6, 'iRobot', 20, true),
('prod_043', 'Puma RS-X Sneakers', 7999, 9999, 'Retro-inspired chunky lifestyle sneakers', 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 4.3, 'Puma', 180, false),
('prod_044', 'Under Armour Hoodie', 3999, 4999, 'ColdGear fleece hoodie for cold weather', 'Clothing', 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500', 4.4, 'Under Armour', 250, false),
('prod_045', 'Ray-Ban Aviator Classic', 14999, 16999, 'Iconic gold-frame aviator sunglasses', 'Accessories', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 4.6, 'Ray-Ban', 120, false),
('prod_046', 'Samsonite Cabin Bag', 12999, 14999, 'Lightweight hardside carry-on luggage', 'Travel', 'https://images.unsplash.com/photo-1553531087-b95ce33e4c7a?w=500', 4.5, 'Samsonite', 40, false),
('prod_047', 'North Face Backpack 30L', 8999, 10999, 'Durable 30L hiking and travel backpack', 'Travel', 'https://images.unsplash.com/photo-1553531087-b95ce33e4c7a?w=500', 4.6, 'North Face', 65, false),
('prod_048', 'Premium Yoga Mat 6mm', 2999, 3499, 'Non-slip textured 6mm thickness yoga mat', 'Sports', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', 4.4, 'Gaiam', 200, false),
('prod_049', 'Resistance Bands Set of 5', 1499, 1999, 'Five levels of resistance exercise bands', 'Sports', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500', 4.3, 'TheraBand', 300, false),
('prod_050', 'Adjustable Dumbbell 20kg', 8999, 10999, 'Space-saving adjustable weight dumbbell set', 'Sports', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', 4.5, 'Bowflex', 30, false),
('prod_051', 'Whey Protein Chocolate 2kg', 3999, 4499, 'Rich chocolate whey protein powder', 'Nutrition', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500', 4.4, 'Optimum Nutrition', 150, false),
('prod_052', 'HDMI 2.1 Cable 2m', 999, 1299, '8K certified HDMI cable for gaming setups', 'Accessories', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.3, 'Belkin', 400, false),
('prod_053', 'USB-C Hub 7-in-1', 2999, 3499, 'Multiport USB-C hub with HDMI and SD card', 'Accessories', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.5, 'Anker', 250, false),
('prod_054', 'iPad Mini 6th Gen', 54999, 59999, 'Compact and powerful iPad with A15 Bionic', 'Tablets', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', 4.7, 'Apple', 45, false),
('prod_055', 'Xiaomi 13 Pro', 79999, 84999, 'Leica co-engineered camera flagship phone', 'Electronics', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500', 4.5, 'Xiaomi', 55, false),
('prod_056', 'Google Pixel 8', 74999, 79999, 'Pure Android experience with Google AI', 'Electronics', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', 4.6, 'Google', 60, false),
('prod_057', 'Asus ROG Phone 8', 94999, 99999, 'Ultimate performance gaming smartphone', 'Electronics', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500', 4.6, 'Asus', 30, false),
('prod_058', 'Lenovo ThinkPad X1 Carbon', 159999, 169999, 'Ultralight business laptop with great keyboard', 'Computers', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500', 4.7, 'Lenovo', 20, false),
('prod_059', 'HP Spectre x360', 139999, 149999, 'Premium convertible 2-in-1 laptop', 'Computers', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500', 4.6, 'HP', 18, false),
('prod_060', 'Asus ROG Zephyrus G14', 179999, 189999, 'Compact gaming laptop with RTX 4080', 'Computers', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500', 4.8, 'Asus', 15, true),
('prod_061', 'Razer DeathAdder V3', 7999, 8999, 'Ergonomic wired gaming mouse', 'Gaming', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', 4.6, 'Razer', 130, false),
('prod_062', 'SteelSeries Arctis Nova Pro', 14999, 16999, 'Wireless multi-system gaming headset', 'Gaming', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 4.7, 'SteelSeries', 75, false),
('prod_063', 'Corsair K70 RGB Keyboard', 13999, 15999, 'Mechanical gaming keyboard with per-key RGB', 'Gaming', 'https://images.unsplash.com/photo-1601445638532-1f0a71ade05a?w=500', 4.6, 'Corsair', 80, false),
('prod_064', 'NVIDIA RTX 4070 GPU', 59999, 64999, 'High performance Ada Lovelace gaming GPU', 'Computers', 'https://images.unsplash.com/photo-1597138804456-e7dca7f59d54?w=500', 4.8, 'NVIDIA', 20, true),
('prod_065', 'AMD Ryzen 9 7900X CPU', 44999, 49999, '12-core high-end desktop processor', 'Computers', 'https://images.unsplash.com/photo-1597138804456-e7dca7f59d54?w=500', 4.7, 'AMD', 25, false),
('prod_066', 'Corsair 32GB DDR5 RAM Kit', 14999, 16999, 'High speed DDR5 5600MHz memory kit', 'Computers', 'https://images.unsplash.com/photo-1597138804456-e7dca7f59d54?w=500', 4.6, 'Corsair', 60, false),
('prod_067', 'WD Black 2TB NVMe SSD', 12999, 14999, 'Ultra fast PCIe 4.0 NVMe SSD for gaming', 'Storage', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500', 4.7, 'WD', 90, false),
('prod_068', 'Seagate 8TB NAS HDD', 14999, 16999, 'IronWolf NAS optimized hard drive', 'Storage', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=500', 4.5, 'Seagate', 70, false),
('prod_069', 'TP-Link AX3000 WiFi 6', 9999, 11999, 'Dual band WiFi 6 router for fast homes', 'Networking', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.6, 'TP-Link', 55, false),
('prod_070', 'Netgear Orbi WiFi 6 Mesh', 24999, 27999, 'Tri-band whole home mesh WiFi system', 'Networking', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.5, 'Netgear', 30, false),
('prod_071', 'Polaroid Now Plus Camera', 13999, 15999, 'Instant analog film camera with filters', 'Cameras', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500', 4.3, 'Polaroid', 80, false),
('prod_072', 'DJI Mini 4 Pro Drone', 74999, 79999, 'Lightweight foldable drone with 4K camera', 'Cameras', 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=500', 4.8, 'DJI', 25, true),
('prod_073', 'Wacom Intuos Pro Tablet', 8999, 9999, 'Professional graphics pen drawing tablet', 'Accessories', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.5, 'Wacom', 50, false),
('prod_074', 'Elgato Stream Deck MK.2', 14999, 16999, 'Customizable LCD key streaming controller', 'Accessories', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.7, 'Elgato', 40, false),
('prod_075', 'Blue Yeti USB Microphone', 12999, 14999, 'Plug and play USB condenser microphone', 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 4.6, 'Blue', 65, false),
('prod_076', 'Rode NT-USB Mini', 9999, 11999, 'Compact broadcast quality studio microphone', 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 4.5, 'Rode', 55, false),
('prod_077', 'Sennheiser HD 560S', 19999, 22999, 'Open-back audiophile over-ear headphones', 'Audio', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 4.7, 'Sennheiser', 45, false),
('prod_078', 'Marshall Emberton II', 9999, 11999, 'Retro styled compact Bluetooth speaker', 'Audio', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 4.5, 'Marshall', 70, false),
('prod_079', 'Fire TV Stick 4K Max', 6499, 7499, 'WiFi 6 streaming stick with Alexa remote', 'TV', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', 4.5, 'Amazon', 150, false),
('prod_080', 'Chromecast with Google TV', 5999, 6999, '4K HDR streaming dongle with remote', 'TV', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', 4.4, 'Google', 130, false),
('prod_081', 'Fossil Gen 6 Smartwatch', 22999, 24999, 'Wear OS powered hybrid smartwatch', 'Wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 4.3, 'Fossil', 60, false),
('prod_082', 'Garmin Forerunner 265', 39999, 44999, 'AMOLED GPS running and triathlon watch', 'Wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 4.7, 'Garmin', 35, false),
('prod_083', 'Oura Ring Gen 3', 29999, 32999, 'Advanced sleep and health tracking smart ring', 'Wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 4.5, 'Oura', 40, false),
('prod_084', 'Arlo Pro 4 Security Camera', 19999, 22999, 'Wireless outdoor 2K HDR security camera', 'Smart Home', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.4, 'Arlo', 45, false),
('prod_085', 'ecobee Smart Thermostat Premium', 19999, 22999, 'Smart thermostat with built-in Alexa', 'Smart Home', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.6, 'ecobee', 35, false),
('prod_086', 'August WiFi Smart Lock', 14999, 16999, 'Auto-lock keyless entry smart door lock', 'Smart Home', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500', 4.3, 'August', 50, false),
('prod_087', 'Breville Barista Express', 59999, 64999, 'Integrated grinder espresso machine', 'Kitchen', 'https://images.unsplash.com/photo-1570087636768-9ee8f8b2e7e6?w=500', 4.8, 'Breville', 20, true),
('prod_088', 'Ninja Air Fryer XL 5.5L', 12999, 14999, 'Large capacity digital air fryer oven', 'Kitchen', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', 4.6, 'Ninja', 55, false),
('prod_089', 'Vitamix E310 Explorian Blender', 34999, 38999, 'Professional grade high performance blender', 'Kitchen', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', 4.8, 'Vitamix', 25, false),
('prod_090', 'Cuisinart 14-Cup Food Processor', 14999, 16999, 'Large capacity electric food processor', 'Kitchen', 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', 4.5, 'Cuisinart', 40, false),
('prod_091', 'New Balance 990v6', 16999, 18999, 'Made in USA premium running shoes', 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 4.7, 'New Balance', 90, false),
('prod_092', 'Converse Chuck Taylor All Star', 5999, 6999, 'Timeless high-top canvas sneakers', 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 4.4, 'Converse', 250, false),
('prod_093', 'Timberland 6 Inch Premium Boots', 14999, 16999, 'Waterproof nubuck leather ankle boots', 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 4.5, 'Timberland', 80, false),
('prod_094', 'Tommy Hilfiger Polo Shirt', 3999, 4999, 'Classic fit cotton pique polo shirt', 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 4.3, 'Tommy Hilfiger', 200, false),
('prod_095', 'Zara Slim Fit Wool Suit', 19999, 22999, 'Modern slim fit two-piece wool blend suit', 'Clothing', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500', 4.4, 'Zara', 60, false),
('prod_096', 'North Face Waterproof Jacket', 19999, 22999, 'DryVent waterproof hooded outdoor jacket', 'Clothing', 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500', 4.6, 'North Face', 75, true),
('prod_097', 'Fossil Bifold Leather Wallet', 3499, 3999, 'Slim genuine leather bifold wallet', 'Accessories', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 4.3, 'Fossil', 200, false),
('prod_098', 'Michael Kors Leather Handbag', 19999, 22999, 'Designer saffiano leather tote handbag', 'Accessories', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500', 4.5, 'Michael Kors', 40, false),
('prod_099', 'Casio G-Shock Solar Watch', 8999, 9999, 'Tough solar powered shock resistant watch', 'Accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 4.6, 'Casio', 150, false),
('prod_100', 'Wilson Pro Staff Tennis Racket', 9999, 11999, 'Professional grade carbon fiber tennis racket', 'Sports', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500', 4.5, 'Wilson', 60, false);
`;

const lines = raw.trim().split('\n').map(l => l.trim()).filter(l => l);

const outputLines = [];

// The user has products up to numericId = 10, so we start at 11
let currentNumericId = 11;

for (let line of lines) {
  // Line format: ('prod_001', 'name', 123, 123, 'desc', 'cat', 'img', 4.5, 'brand', 50, true),
  // Need to insert numericId right after id, remove stock (the 10th item), and add NOW() at the end
  
  // A regex or manual split
  // The structure is fixed:
  // (id, name, price, oldPrice, desc, cat, img, rating, brand, stock, isFeatured)
  
  // We can just parse the tuple using string manipulation
  let inner = line.substring(line.indexOf('(') + 1, line.lastIndexOf(')'));
  let parts = inner.split(/,(?=(?:(?:[^']*'){2})*[^']*$)/).map(p => p.trim());
  
  if (parts.length >= 11) {
    let id = parts[0];
    let name = parts[1];
    let price = parts[2];
    let oldPrice = parts[3];
    let desc = parts[4];
    let cat = parts[5];
    let img = parts[6];
    let rating = parts[7];
    let brand = parts[8];
    // skip stock (parts[9])
    let isFeatured = parts[10];

    // Build new tuple
    let newTuple = `(${id}, ${currentNumericId}, ${name}, ${brand}, ${price}, ${oldPrice}, ${img}, ${rating}, ${cat}, ${desc}, ${isFeatured}, NOW())`;
    outputLines.push(newTuple);
    currentNumericId++;
  }
}

const prefix = `INSERT INTO "Product" (
  "id", "numericId", "name", "brand", "price", "oldPrice", "image", "rating", "category", "description", "isFeatured", "updatedAt"
) VALUES`;

const finalSQL = prefix + '\n' + outputLines.join(',\n') + ';';
fs.writeFileSync('output_artifact.md', '```sql\n' + finalSQL + '\n```');
