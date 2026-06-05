const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.json({ message: '最简单的服务器测试' });
});

app.get('/api/pets', (req, res) => {
    // 返回完整的宠物对象数组
    const pets = [
        {
            id: 1,
            name: '旺财',
            species: 'dog',
            breed: '金毛寻回犬',
            color: '金色',
            age: 12,
            gender: 'male',
            size: 'large',
            location: '北京',
            story: '旺财是一只在小区里发现的流浪狗，性格温顺，喜欢和人玩耍，特别聪明。',
            vaccinated: true,
            sterilized: true,
            status: 'available',
            image: 'https://placedog.net/400/300?id=201'
        },
        {
            id: 2,
            name: '咪咪',
            species: 'cat',
            breed: '中华田园猫',
            color: '橘色',
            age: 8,
            gender: 'female',
            size: 'small',
            location: '西安',
            story: '咪咪是在公园救助的小猫，现在很健康，等待一个有爱的家。',
            vaccinated: true,
            sterilized: true,
            status: 'available',
            image: 'https://placekitten.com/400/300'
        },
        {
            id: 3,
            name: '大黄',
            species: 'dog',
            breed: '中华田园犬',
            color: '黄色',
            age: 18,
            gender: 'male',
            size: 'medium',
            location: '上海',
            story: '大黄是只忠诚的看门狗，对主人非常忠诚，需要一个有院子的家。',
            vaccinated: true,
            sterilized: true,
            status: 'available',
            image: 'https://placedog.net/400/300?id=202'
        },
        {
            id: 4,
            name: '小白',
            species: 'cat',
            breed: '波斯猫',
            color: '白色',
            age: 4,
            gender: 'female',
            size: 'small',
            location: '浙江',
            story: '小白性格温和，喜欢安静的环境，需要定期梳理毛发。',
            vaccinated: true,
            sterilized: true,
            status: 'available',
            image: 'https://placekitten.com/401/300'
        },
        {
            id: 5,
            name: '小黑',
            species: 'dog',
            breed: '拉布拉多',
            color: '黑色',
            age: 8,
            gender: 'male',
            size: 'large',
            location: '成都',
            story: '小黑性格活泼，喜欢游泳和接飞盘，是家庭的好伴侣。',
            vaccinated: true,
            sterilized: true,
            status: 'available',
            image: 'https://placedog.net/400/300?id=203'
        }
    ];
    
    res.json({
        success: true,
        count: pets.length,
        data: pets
    });
});

const PORT = 3000
app.listen(PORT, () => {
    console.log(`✅ 最简单的服务器启动在端口 ${PORT}`);
});
