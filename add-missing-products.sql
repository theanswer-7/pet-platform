-- 完整的商品数据初始化脚本
-- 首先添加缺失的字段，然后清空商品表，最后插入所有商品数据

-- 检查并添加original_price字段（如果不存在）
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) AFTER price;

-- 清空商品表
DELETE FROM products;

-- 重置自增ID
ALTER TABLE products AUTO_INCREMENT = 1;

-- 插入所有商品数据
INSERT INTO products (
  id, name, description, price, original_price, image_url, category, 
  stock, sales_count, status, is_new, is_hot, is_flash_sale, 
  flash_sale_end_time
) VALUES 
-- 宠物食品类
(
  1,
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
SELECT COUNT(*) as total_products FROM products WHERE status = 'active';