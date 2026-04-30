import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const databaseDir = path.join(process.cwd(), 'database');
fs.mkdirSync(databaseDir, { recursive: true });

const db = new Database(path.join(databaseDir, 'thoughts_app.db'));

// First ensure we have a user to post as
let user = db.prepare('SELECT id FROM users ORDER BY RANDOM() LIMIT 1').get();

if (!user) {
    db.prepare(`
        INSERT INTO users (username, email, password, full_name)
        VALUES (?, ?, ?, ?)
    `).run('seeduser', 'seed@example.com', 'hashedpassword', 'Seed User');
    user = db.prepare('SELECT id FROM users WHERE username = ?').get('seeduser');
}

const posts = [
    { content: "Just deployed the latest update to the backend architecture! 🚀 Feeling really good about the performance improvements.", tag: "#TechUpdate" },
    { content: "What's everyone's favorite way to brew coffee? ☕ I'm trying out a new pour-over method but still figuring out the right grind size.", tag: "#CoffeeLovers" },
    { content: "Caught an incredible sunset this evening by the coast. Sometimes you just have to stop and appreciate the little things. 🌅", image_url: "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=600&q=80", tag: "#Photography" },
    { content: "Currently diving deep into the nuances of database query optimization. The difference a well-placed index makes is staggering! 💻", tag: "#Coding" },
    { content: "Has anyone tried the new vegan bakery downtown? The croissants are supposed to be out of this world! 🥐🌿", tag: "#Foodie" },
    { content: "Finally finished reading 'Dune'. What a masterpiece of world-building and political intrigue. Highly recommend it! 📚", tag: "#BookClub" },
    { content: "Morning run completed! 🏃‍♂️ 5 miles pushed, and I finally beat my previous time. Consistency is absolutely the key.", tag: "#Fitness" },
    { content: "Working on a side project using Rust. The borrow checker is tough to get used to, but I appreciate the safety guarantees. 🦀", tag: "#RustProgramming" },
    { content: "Can we talk about how good the cinematography was in that new sci-fi movie? Absolutely stunning visual sequences! 🎬", tag: "#Cinema" },
    { content: "Spent the weekend hiking in the mountains. The air up there just feels different. So refreshing! ⛰️", image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", tag: "#Nature" },
    { content: "Just tried making homemade pasta for the first time. It was messy, but totally worth the effort! 🍝", tag: "#Cooking" },
    { content: "I keep seeing debates about remote vs. office work. Honestly, a hybrid model feels like the perfect balance for most teams. 🏢🏠", tag: "#WorkLife" },
    { content: "Learning to play the guitar has been incredibly humbling. Calluses are building up, but the chords are starting to sound crisp! 🎸", tag: "#Music" },
    { content: "Does anyone else have that one playlist they exclusively listen to when they need to zone in and get work done? 🎧", tag: "#Productivity" },
    { content: "Just watched the James Webb Space Telescope's latest deep field image. The scale of the universe is just mind-bending. 🌌", image_url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80", tag: "#Space" },
    { content: "Procrastinated on this task for two weeks, finally sat down, and it took 20 minutes. Why do we do this to ourselves? 😂", tag: "#LifeThoughts" },
    { content: "I firmly believe that breakfast food is good at any time of the day. Pancakes for dinner? Sign me up! 🥞", tag: "#FoodOpinions" },
    { content: "It's amazing how much a good night's sleep can completely change your perspective on an issue you were stuck on. 💤", tag: "#Health" },
    { content: "Slowly replacing all my smart home devices. It's a fun hobby until the Wi-Fi acts up and the lights won't turn off. 💡", tag: "#TechLife" },
    { content: "Who else gets irrationally excited when finding a completely empty, perfectly clean notebook to start filling up? 📓✏️", tag: "#Stationery" }
];

console.log('Seeding 20 posts...');

const insertPost = db.prepare(`
    INSERT INTO posts (title, content, image_url, author_id)
    VALUES (?, ?, ?, ?)
`);

posts.forEach(post => {
    insertPost.run('Thoughts on ' + post.tag, post.content, post.image_url || null, user.id);
});

console.log('Successfully added 20 posts to the database!');
