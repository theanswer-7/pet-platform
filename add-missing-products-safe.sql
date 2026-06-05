-- 安全添加前端硬编码但数据库中缺失的商品
-- 这个脚本将添加前端Mall.vue中定义但数据库初始化脚本中缺失的商品
-- 使用INSERT IGNORE确保即使运行多次也不会重复插入数据

INSERT IGNORE INTO products (
  name, description, price, original_price, image, category, 
  stock, sales, status, is_new, is_hot, is_flash_sale, 
  flash_sale_start, flash_sale_end
) VALUES 
-- 宠物食品类
(
  '皇家小型犬成犬粮',
  '营养均衡，促进消化健康',
  258.00,
  298.00,
  'https://img.alicdn.com/i3/1657012585/O1CN01o6L2Kx1UxyMAfqn7Z_!!1657012585.jpg',
  'food',
  45,
  1234,
  'active',
  1,
  0,
  0,
  NULL,
  NULL
),
(
  '冠能大型犬成犬粮',
  '专为大型犬设计，强健骨骼',
  328.00,
  368.00,
  'https://gw.alicdn.com/imgextra/O1CN01dIWkCS1H4TwHqhTKe_!!3017450704-0-yinheaigc.jpg',
  'food',
  42,
  1456,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '冻干鸡肉粒宠物零食',
  '纯天然无添加，高蛋白低脂',
  68.00,
  88.00,
  'http://img.alicdn.com/img/i1/9734303905/O1CN01TYZTnH1eiXkNnvpTV_!!4611686018427383969-0-saturn_solar.jpg',
  'food',
  56,
  2234,
  'active',
  1,
  0,
  0,
  NULL,
  NULL
),

-- 宠物玩具类
(
  '猫咪电动逗猫棒',
  '智能感应，激发捕猎天性',
  68.00,
  88.00,
  'https://ts1.tc.mm.bing.net/th/id/OIP-C.1obNYDNUrUt-raCFQ5S1TQAAAA?w=213&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
  'toy',
  78,
  2103,
  'active',
  1,
  0,
  0,
  NULL,
  NULL
),
(
  '耐咬橡胶磨牙玩具',
  '食品级材质，清洁牙齿',
  38.00,
  NULL,
  'http://img.alicdn.com/img/i4/28852095/O1CN01wDTL8H1RLYe4NlDrW_!!0-saturn_solar.jpg',
  'toy',
  78,
  1567,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '狗狗益智漏食玩具',
  '延缓进食，训练智力',
  58.00,
  NULL,
  'https://gw.alicdn.com/imgextra/O1CN01dwvafY1FfSgXSe4qs_!!2214975900514-0-yinheaigc.jpg',
  'toy',
  62,
  1123,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),

-- 保健药品类
(
  '宠物卵磷脂美毛膏',
  '改善毛发质量，增强皮肤健康',
  128.00,
  NULL,
  'https://img.alicdn.com/bao/uploaded/i1/291341349/O1CN01tim5dV1Lpt8a7CJta_!!291341349-0-picasso.jpg',
  'health',
  56,
  987,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物关节保健片',
  '缓解关节疼痛，增强活动力',
  158.00,
  NULL,
  'http://img.alicdn.com/img/i2/7924477624/O1CN01WLsRG926BqiM1Szuw_!!4611686018427383480-0-saturn_solar.jpg',
  'health',
  35,
  987,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),

-- 窝垫睡床类
(
  '宠物四季通用窝',
  '可拆洗设计，舒适保暖',
  189.00,
  229.00,
  'https://ts1.tc.mm.bing.net/th/id/OIP-C.Rcp-qVGP4o_sXbKRjlniPgAAAA?w=202&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
  'bed',
  23,
  1456,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物柔软毛毯',
  '亲肤材质，可机洗',
  68.00,
  NULL,
  'http://img.alicdn.com/img/i2/1464730048/O1CN01nPh1zN1CE20aMRRC0_!!0-saturn_solar.jpg',
  'bed',
  72,
  1456,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物半封闭式窝',
  '安全感设计，保暖透气',
  158.00,
  198.00,
  'https://img.alicdn.com/imgextra/i3/2217224742649/O1CN01A7xbv11VRIGcQxEy3_!!2217224742649-0-alimamacc.jpg',
  'bed',
  29,
  890,
  'active',
  1,
  0,
  0,
  NULL,
  NULL
),

-- 服饰配饰类
(
  '宠物雨衣四脚款',
  '防水透气，活动自如',
  45.00,
  NULL,
  'https://ts1.tc.mm.bing.net/th/id/OIP-C.KDh2Zxf9eB2eq1W81vtGMQAAAA?w=214&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
  'wear',
  34,
  567,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物圣诞服装',
  '节日氛围，拍照神器',
  88.00,
  NULL,
  'http://img.alicdn.com/img/i1/6444622440/O1CN01wDNL4y1TtZVKYJqR3_!!4611686018427380328-2-saturn_solar.png',
  'wear',
  45,
  678,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),

-- 出行装备类
(
  '宠物牵引绳套装',
  '防爆冲设计，安全舒适',
  89.00,
  NULL,
  'https://tse3-mm.cn.bing.net/th/id/OIP-C.R4-vG81cm-z1jOibH0wqGQHaE_?w=304&h=205&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
  'travel',
  67,
  2345,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物背包',
  '人体工学设计，舒适透气',
  158.00,
  198.00,
  'http://img.alicdn.com/img/i3/773370050/O1CN01dvDcIW1CEwpyY8Vr3_!!4611686018427384002-0-saturn_solar.jpg',
  'travel',
  38,
  789,
  'active',
  1,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物车载饮水杯',
  '一键出水，便携设计',
  48.00,
  NULL,
  'https://gw.alicdn.com/imgextra/O1CN01wuDTv21uPnNMiLx3p_!!2219862306030-0-yinheaigc.jpg',
  'travel',
  67,
  1234,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),

-- 其他用品类
(
  '宠物自动饮水机',
  '静音循环，保持水质新鲜',
  189.00,
  NULL,
  'https://ts4.tc.mm.bing.net/th/id/OIP-C.3FTvHf8dzEXx7Lm7kt_McAHaLB?rs=1&pid=ImgDetMain&o=7&rm=3',
  'other',
  32,
  856,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物智能喂食器',
  '定时定量，远程控制',
  358.00,
  NULL,
  'http://img.alicdn.com/img/i4/6243592877/O1CN01Rfh97e1X7iaP9Tcxd_!!4611686018427382445-0-saturn_solar.jpg',
  'other',
  32,
  890,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
),
(
  '宠物电热毯',
  '恒温设计，安全节能',
  168.00,
  NULL,
  'http://img.alicdn.com/img/i4/3194097819/O1CN01ARZXiY27d9nDdnEAj_!!2-saturn_solar.png',
  'other',
  42,
  678,
  'active',
  0,
  0,
  0,
  NULL,
  NULL
);

-- 查询商品总数
SELECT COUNT(*) as total_products FROM products WHERE status = 'active';-- 安全添加缺失的商品数据
-- 这个脚本不会删除现有数据，只会添加缺失的商品

-- 检查并添加宠物智能喂食器
INSERT IGNORE INTO products (
  name, description, price, original_price, image, category, 
  stock, sales, status, is_new, is_hot, is_flash_sale, 
  flash_sale_start, flash_sale_end, created_at, updated_at
) VALUES (
  '宠物智能喂食器',
  '定时定量喂食器，可通过手机APP远程控制，适合上班族和旅行时使用。',
  198.00,
  258.00,
  'https://picsum.photos/seed/supply2/300/300.jpg',
  'supply',
  25,
  75,
  'active',
  1,
  0,
  0,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- 检查并添加宠物便携背包 透气款
INSERT IGNORE INTO products (
  name, description, price, original_price, image, category, 
  stock, sales, status, is_new, is_hot, is_flash_sale, 
  flash_sale_start, flash_sale_end, created_at, updated_at
) VALUES (
  '宠物便携背包 透气款',
  '户外出行必备，透气网眼设计，舒适承重，适合小型犬和猫咪。',
  88.00,
  118.00,
  'https://picsum.photos/seed/supply3/300/300.jpg',
  'supply',
  30,
  60,
  'active',
  0,
  0,
  1,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 6 DAY),
  NOW(),
  NOW()
);

-- 检查并添加宠物湿巾 除菌除臭
INSERT IGNORE INTO products (
  name, description, price, original_price, image, category, 
  stock, sales, status, is_new, is_hot, is_flash_sale, 
  flash_sale_start, flash_sale_end, created_at, updated_at
) VALUES (
  '宠物湿巾 除菌除臭',
  '温和无刺激配方，有效除菌除臭，适合宠物日常清洁使用。',
  19.90,
  29.90,
  'https://picsum.photos/seed/clean1/300/300.jpg',
  'clean',
  80,
  180,
  'active',
  0,
  1,
  0,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- 检查并添加宠物香波 柔顺护毛
INSERT IGNORE INTO products (
  name, description, price, original_price, image, category, 
  stock, sales, status, is_new, is_hot, is_flash_sale, 
  flash_sale_start, flash_sale_end, created_at, updated_at
) VALUES (
  '宠物香波 柔顺护毛',
  '温和清洁配方，含天然植物精华，使宠物毛发柔顺有光泽。',
  38.00,
  48.00,
  'https://picsum.photos/seed/clean2/300/300.jpg',
  'clean',
  45,
  130,
  'active',
  0,
  0,
  0,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- 检查并添加宠物除臭喷雾 室内专用
INSERT IGNORE INTO products (
  name, description, price, original_price, image, category, 
  stock, sales, status, is_new, is_hot, is_flash_sale, 
  flash_sale_start, flash_sale_end, created_at, updated_at
) VALUES (
  '宠物除臭喷雾 室内专用',
  '长效除臭配方，快速分解异味分子，适合室内宠物环境使用。',
  25.00,
  35.00,
  'https://picsum.photos/seed/clean3/300/300.jpg',
  'clean',
  55,
  90,
  'active',
  1,
  0,
  1,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 4 DAY),
  NOW(),
  NOW()
);

-- 检查并添加狗狗磨牙绳结玩具
INSERT IGNORE INTO products (
  name, description, price, original_price, image, category, 
  stock, sales, status, is_new, is_hot, is_flash_sale, 
  flash_sale_start, flash_sale_end, created_at, updated_at
) VALUES (
  '狗狗磨牙绳结玩具',
  '天然棉绳制作，帮助狗狗清洁牙齿，缓解磨牙期不适，增强咬合力。',
  35.00,
  45.00,
  'https://picsum.photos/seed/supply3/300/300.jpg',
  'toy',
  50,
  120,
  'active',
  0,
  0,
  1,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 3 DAY),
  NOW(),
  NOW()
);

-- 查看添加结果
SELECT COUNT(*) AS total_products FROM products;