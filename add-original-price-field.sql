-- 添加original_price字段到products表
-- 这个脚本用于解决"Unknown column 'original_price' in 'field list'"错误

-- 检查并添加original_price字段（如果不存在）
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) AFTER price;