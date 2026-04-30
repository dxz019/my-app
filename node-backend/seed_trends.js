import db from './src/database.js';

console.log('Seeding fake data to trending topics...');

const users = [
    { username: 'chef_mario', full_name: 'Chef Mario', email: 'mario@test.com', avatar: 'https://i.pravatar.cc/150?u=chef_mario' },
    { username: 'tech_guru', full_name: 'Tech Guru AI', email: 'tech@test.com', avatar: 'https://i.pravatar.cc/150?u=tech_guru' },
    { username: 'travel_bug', full_name: 'Wanderlust Explorer', email: 'travel@test.com', avatar: 'https://i.pravatar.cc/150?u=travel_bug' },
    { username: 'coder_ninja', full_name: 'Code Ninja', email: 'code@test.com', avatar: 'https://i.pravatar.cc/150?u=coder_ninja' },
    { username: 'design_pro', full_name: 'Design Pro', email: 'design@test.com', avatar: 'https://i.pravatar.cc/150?u=design_pro' }
];

const userIds = [];

// Insert Users
for (const u of users) {
    try {
        const stmt = db.prepare('INSERT INTO users (username, full_name, email, password, avatar_url) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(u.username, u.full_name, u.email, 'password123', u.avatar);
        userIds.push(result.lastInsertRowid);
    } catch(e) {
        // user exists, just grab id
        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
        userIds.push(user.id);
    }
}

const posts = [
    { title: 'Local Bakery', content: 'Just found the absolute best croissant in the city. The butter layers are absolutely insane! 🥐 #DeliciousThoughts', author_id: userIds[0] },
    { title: 'Dinner Recipe', content: 'Cooking up some homemade pasta from scratch tonight! #DeliciousThoughts #Foodie', author_id: userIds[0] },
    
    { title: 'AGI Timelines', content: 'The pace of AI development is staggering. What do you think the timeline for AGI is? #FutureAI', author_id: userIds[1] },
    { title: 'Machine Learning', content: 'Just trained my first neural network model from scratch using PyTorch! Learning so much. #FutureAI #Coding', author_id: userIds[1] },
    
    { title: 'Tulum Trip', content: 'The beaches in Tulum are out of this world. Highly recommend taking a week off to disconnect here. 🌴 #Wanderlust', author_id: userIds[2] },
    { title: 'Backpacking Europe', content: 'Planning a 3-month backpacking trip through Europe. Anyone have hostel recommendations in Berlin? #Wanderlust #Travel Adventures', author_id: userIds[2] },
    
    { title: 'React Performance', content: 'Just shaved 200ms off our initial load time by aggressively code-splitting routes. Felt so satisfying. #CodeLife', author_id: userIds[3] },
    { title: 'Node.js Backend', content: 'Setting up a new SQLite backend using Express and Node.js. Sometimes simple is best! #CodeLife #WebDevelopment', author_id: userIds[3] },
    
    { title: 'Glassmorphism', content: 'Glassmorphism is still trending hard in 2026. The key is subtle background blurs and strong borders. #Minimalist #DesignTrends', author_id: userIds[4] },
    { title: 'Typography', content: 'Never underestimate the power of good typography. A clean sans-serif like Inter or Fredoka goes a long way. ✍️ #Minimalist', author_id: userIds[4] },
];

for (const p of posts) {
    db.prepare('INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)').run(p.title, p.content, p.author_id);
}

// Randomly generate some likes and comments
const createdPosts = db.prepare('SELECT id FROM posts ORDER BY id DESC LIMIT 10').all();

for (const post of createdPosts) {
    // Add 2 random comments
    db.prepare('INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)').run(post.id, userIds[0], 'Totally agree with this! Amazing.');
    db.prepare('INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)').run(post.id, userIds[1], 'Great perspective.');
    
    // Add some random likes
    try { db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(post.id, userIds[0]); } catch(e){}
    try { db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(post.id, userIds[1]); } catch(e){}
    try { db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(post.id, userIds[2]); } catch(e){}
}

console.log('Seeding complete! Added 10 trending posts, 5 loaded users, and generated random likes & comments.');
