const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pet_platform',
  multipleStatements: true
};

async function updateAllPetImages() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 获取所有宠物数据
    const [pets] = await connection.execute('SELECT id, name, species FROM pets');
    console.log(`找到 ${pets.length} 只宠物`);
    
    let updatedCount = 0;
    
    for (const pet of pets) {
      // 为每只宠物生成新的图片URL
      let newImageUrl;
      if (pet.species === 'dog') {
        newImageUrl = `https://placedog.net/400/300?id=${pet.id + 100}`;
      } else if (pet.species === 'cat') {
        newImageUrl = `https://picsum.photos/seed/cat${pet.id}/400/300.jpg`;
      }
      
      // 更新数据库中的图片URL
      await connection.execute(
        'UPDATE pets SET image = ? WHERE id = ?',
        [newImageUrl, pet.id]
      );
      
      console.log(`✅ 已更新${pet.species === 'dog' ? '狗狗' : '猫咪'} ${pet.name}(ID: ${pet.id}) 的图片URL为: ${newImageUrl}`);
      updatedCount++;
    }
    
    console.log(`\n🎉 成功更新 ${updatedCount} 只宠物的图片URL`);
    
  } catch (error) {
    console.error('❌ 更新宠物图片URL失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 执行更新
updateAllPetImages();