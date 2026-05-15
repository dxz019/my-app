import bcrypt from 'bcryptjs';
import db from '../database.js';
import { runMigrations } from './migrate.js';

const topics = [
    {
        slug: 'food',
        titles: [
            'Neighborhood Flavor Notes',
            'Weekend Kitchen Experiment',
            'Secret Ingredient Discovery',
            'Comfort Food Revival',
            'Street Food Adventures'
        ],
        thoughts: [
            'Spent the evening testing slow-roasted tomatoes, basil oil, and fresh bread. Tiny changes in timing make the whole plate feel brighter.',
            'A good comfort meal can reset an entire week. I keep coming back to simple ingredients done really well.',
            'Found the perfect balance of sweet and savory in this unexpected combination.',
            'Nothing beats the aroma of freshly baked bread on a Sunday morning.',
            'Exploring the vibrant flavors of street food markets has been eye-opening.'
        ]
    },
    {
        slug: 'ai',
        titles: [
            'Model Notes From Today',
            'Agents In Practice',
            'Breaking Down Neural Networks',
            'AI Ethics in Daily Applications',
            'Machine Learning for Beginners'
        ],
        thoughts: [
            'The most interesting part of AI right now is not bigger demos, it is smaller workflows that actually help people finish work faster.',
            'I trust automation more when the system shows its reasoning path, boundaries, and where humans still need to verify outcomes.',
            'Understanding the mathematics behind neural networks opens up new possibilities for optimization.',
            'As AI becomes more prevalent, we must consider the ethical implications of its deployment.',
            'Starting with machine learning doesn\'t require a PhD - just curiosity and persistence.'
        ]
    },
    {
        slug: 'travel',
        titles: [
            'City Walk Highlights',
            'Sunrise Route',
            'Hidden Gems Off the Beaten Path',
            'Cultural Immersion Experiences',
            'Budget Travel Tips and Tricks'
        ],
        thoughts: [
            'The best travel moments are usually the unplanned ones: finding a quiet cafe, a side street mural, or a perfect lookout with no crowd.',
            'I like places that slow you down enough to notice sound, texture, and local routines instead of only landmarks.',
            'Some of the most memorable experiences come from wandering without a strict itinerary.',
            'Immersing myself in local culture has transformed my perspective on travel.',
            'Traveling on a budget doesn\'t mean sacrificing quality experiences.'
        ]
    },
    {
        slug: 'code',
        titles: [
            'Backend Build Notes',
            'Fixing The Weird Bug',
            'Database Optimization Strategies',
            'API Design Best Practices',
            'Testing Methodologies That Work'
        ],
        thoughts: [
            'Today was a reminder that the cleanest fix is usually in the data flow, not in adding more conditionals around the symptom.',
            'A good backend feels calm: predictable responses, simple queries, and logs that tell the story before production does.',
            'Proper indexing can transform query performance from seconds to milliseconds.',
            'Well-designed APIs are intuitive, consistent, and easy to consume.',
            'Comprehensive testing catches issues before they reach production.'
        ]
    },
    {
        slug: 'design',
        titles: [
            'Interface Balance',
            'Typography Observations',
            'Color Theory in Digital Design',
            'User-Centered Design Principles',
            'Design Systems and Component Libraries'
        ],
        thoughts: [
            'Spacing is doing more work than people give it credit for. A calmer layout often starts with what you remove, not what you add.',
            'When a visual system feels polished, it is usually because the rhythm is consistent across small details users barely notice consciously.',
            'Color choices can dramatically affect user emotion and behavior.',
            'Putting users at the center of the design process leads to better outcomes.',
            'Design systems create consistency and efficiency across large teams.'
        ]
    },
    {
        slug: 'music',
        titles: [
            'Melody Construction Techniques',
            'Production Workflow Insights',
            'Exploring Different Genres',
            'Instrumentation and Arrangement',
            'Mixing and Mastering Fundamentals'
        ],
        thoughts: [
            'A strong melody can make or break a song, regardless of production quality.',
            'Having a consistent workflow helps maintain creativity and productivity.',
            'Stepping outside my comfort zone with genres has expanded my musical palette.',
            'The choice of instruments can completely transform the feel of a track.',
            'The final stages of production are where good tracks become great.'
        ]
    },
    {
        slug: 'fitness',
        titles: [
            'Workout Routine Updates',
            'Nutrition for Optimal Performance',
            'Recovery and Injury Prevention',
            'Mind-Body Connection in Fitness',
            'Setting and Achieving Fitness Goals'
        ],
        thoughts: [
            'Regularly updating my routine prevents plateaus and keeps things interesting.',
            'Proper nutrition is just as important as the workout itself.',
            'Recovery is where the real growth happens - don\'t neglect it.',
            'Fitness is as much mental as it is physical.',
            'Setting SMART goals has been crucial for my fitness journey.'
        ]
    },
    {
        slug: 'photography',
        titles: [
            'Composition Techniques That Work',
            'Lighting Fundamentals',
            'Post-Processing Workflow',
            'Gear Recommendations for Different Budgets',
            'Developing Your Photographic Eye'
        ],
        thoughts: [
            'The rule of thirds is just the beginning of effective composition.',
            'Understanding light is perhaps the most crucial skill in photography.',
            'Post-processing should enhance, not completely alter, the original image.',
            'Great photography is possible at any budget level.',
            'Training your eye to see potential shots takes practice and patience.'
        ]
    }
];

const usersToCreate = [
    ['ava_bites', 'Ava Bennett', 'Food writer collecting small-city flavors and kitchen rituals.', 'food'],
    ['noah_tensor', 'Noah Carter', 'Shipping AI experiments that are actually useful on Monday morning.', 'ai'],
    ['mia_paths', 'Mia Patel', 'Travel journals, local coffee, and patient wandering.', 'travel'],
    ['liam_stack', 'Liam Brooks', 'Backend builder with a soft spot for boring reliable systems.', 'code'],
    ['zoe_canvas', 'Zoe Kim', 'Product designer chasing clarity, contrast, and rhythm.', 'design'],
    ['ethan_spice', 'Ethan Morales', 'Street food scout and home cook with too many spice jars.', 'food'],
    ['aria_neural', 'Aria Singh', 'Research notes from the edge of applied machine learning.', 'ai'],
    ['leo_trails', 'Leo Rivera', 'Mountains, trains, and notebooks full of directions.', 'travel'],
    ['ivy_queries', 'Ivy Chen', 'Node.js, SQL, and debugging with a detective mindset.', 'code'],
    ['mason_grid', 'Mason Park', 'Design systems, type scales, and layout discipline.', 'design'],
    ['nina_oven', 'Nina Foster', 'Comfort food experiments and dinner-table storytelling.', 'food'],
    ['ryan_agents', 'Ryan Hall', 'Thinking about tools, agents, and trustworthy automation.', 'ai'],
    ['ella_stamps', 'Ella Diaz', 'Collecting skylines, station signs, and sunrise walks.', 'travel'],
    ['jack_runtime', 'Jack Reed', 'Performance tuning and API ergonomics for the long haul.', 'code'],
    ['luna_pixels', 'Luna Shah', 'UI polish, microcopy, and visual restraint.', 'design'],
    ['owen_fork', 'Owen Price', 'Recipe drafts, market trips, and generous portions.', 'food'],
    ['isla_matrix', 'Isla Turner', 'Applied AI notes without the hype language.', 'ai'],
    ['kai_miles', 'Kai Howard', 'Road trips, coastal weather, and camera-roll maps.', 'travel'],
    ['ruby_routes', 'Ruby James', 'Express apps, SQLite, and practical architecture.', 'code'],
    ['adam_forms', 'Adam Lee', 'Accessible interfaces and honest product critique.', 'design'],
    ['sofia_melody', 'Sofia Rodriguez', 'Music producer exploring sound design and composition.', 'music'],
    ['max_fit', 'Maxwell Turner', 'Fitness enthusiast sharing workout routines and nutrition tips.', 'fitness'],
    ['lens_leo', 'Leo Kim', 'Photographer capturing urban landscapes and street scenes.', 'photography'],
    ['zara_zen', 'Zara Gupta', 'Yoga instructor and mindfulness coach.', 'fitness'],
    ['octavia_beats', 'Octavia Davis', 'DJ and electronic music artist experimenting with new sounds.', 'music'],
    ['sol_lens', 'Solomon Adeyemi', 'Travel photographer documenting cultures around the world.', 'photography']
];

const commentPhrases = [
    'This is a really solid perspective. I have been thinking about this too.',
    'You captured exactly what I wanted to say but could not put into words.',
    'Had a similar experience last week. The small details matter most.',
    'This makes a lot of sense. Thanks for sharing your process.',
    'Saved this post to refer back later. Bookmarked.',
    'The point about consistency is so true. It is the unseen work.',
    'I read every word of this. Please write more like this.',
    'This is practical advice I can actually use tomorrow.',
    'Great breakdown. Would love to hear more about your setup.',
    'The world needs more posts like this. Thank you.'
];

function avatarUrl(username) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`;
}

function postImageUrl(username, index) {
    return `https://picsum.photos/seed/${encodeURIComponent(`${username}-${index}`)}/900/600`;
}

function buildPostContent(user, topic, postIndex) {
    const lead = topic.thoughts[postIndex % topic.thoughts.length];
    return `${lead}`;
}

async function seed() {
    console.log('[SEED] Populating database with real content...');

    runMigrations();

    db.exec('DELETE FROM comment_likes');
    db.exec('DELETE FROM likes');
    db.exec('DELETE FROM comments');
    db.exec('DELETE FROM posts');
    db.exec('DELETE FROM users');
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'posts', 'comments', 'likes', 'comment_likes')");

    const passwordHash = await bcrypt.hash('password123', 10);

    const insertUser = db.prepare(`
        INSERT INTO users (email, username, password, full_name, biography, avatar_url, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPost = db.prepare(`
        INSERT INTO posts (title, content, image_url, author_id)
        VALUES (?, ?, ?, ?)
    `);

    const insertComment = db.prepare(`
        INSERT INTO comments (post_id, author_id, content)
        VALUES (?, ?, ?)
    `);

    const insertLike = db.prepare(`
        INSERT OR IGNORE INTO likes (user_id, post_id)
        VALUES (?, ?)
    `);

    const insertCommentLike = db.prepare(`
        INSERT OR IGNORE INTO comment_likes (user_id, comment_id)
        VALUES (?, ?)
    `);

    const insertFollow = db.prepare(`
        INSERT OR IGNORE INTO follows (follower_id, followed_id)
        VALUES (?, ?)
    `);

    // Create exactly 15 users
    const selectedUsersToCreate = usersToCreate.slice(0, 15);
    for (const [index, user] of selectedUsersToCreate.entries()) {
        const [username, fullName, biography, topicSlug] = user;
        insertUser.run(
            `${username}@example.com`,
            username,
            passwordHash,
            fullName,
            biography,
            avatarUrl(username),
            index < 3 ? 1 : 0
        );
    }

    const users = db.prepare('SELECT id, username, full_name, avatar_url FROM users ORDER BY id ASC').all();
    const userByUsername = Object.fromEntries(users.map((user) => [user.username, user]));

    // Create random follows
    for (const follower of users) {
        const numToFollow = 5 + Math.floor(Math.random() * 6);
        const potentialFollows = users.filter(u => u.id !== follower.id);
        const shuffled = [...potentialFollows].sort(() => Math.random() - 0.5);
        const usersToFollow = shuffled.slice(0, Math.min(numToFollow, shuffled.length));
        
        for (const followed of usersToFollow) {
            insertFollow.run(follower.id, followed.id);
        }
    }

    const createdPosts = [];

    // Each of the 15 users creates exactly 4 posts (total 60 posts)
    for (const [index, [username, , , topicSlug]] of selectedUsersToCreate.entries()) {
        const user = userByUsername[username];
        const topic = topics.find((entry) => entry.slug === topicSlug);
        
        // Hashtag mapping for trending topics
        const trendingHashtags = {
            food: '#DeliciousThoughts',
            ai: '#FutureAI',
            travel: '#Wanderlust',
            code: '#CodeLife',
            design: '#Minimalist',
            music: '#Beats',
            fitness: '#Workout',
            photography: '#Capture'
        };
        const hashtag = trendingHashtags[topicSlug] || `#${topicSlug}`;

        for (let postIndex = 0; postIndex < 4; postIndex += 1) {
            const content = buildPostContent(user, topic, postIndex) + `\n\nLoving this! ${hashtag}`;
            
            const result = insertPost.run(
                topic.titles[postIndex % topic.titles.length],
                content,
                postImageUrl(username, postIndex + 1),
                user.id
            );

            createdPosts.push({
                id: Number(result.lastInsertRowid),
                authorId: user.id,
                authorUsername: user.username,
                topicSlug
            });
        }
    }

    // Distribute exactly 40 comments across the 60 posts
    let commentsCreated = 0;
    while (commentsCreated < 40) {
        // Random post
        const post = createdPosts[Math.floor(Math.random() * createdPosts.length)];
        
        // Random commenter (not the author)
        const potentialCommenters = users.filter(u => u.id !== post.authorId);
        const commenter = potentialCommenters[Math.floor(Math.random() * potentialCommenters.length)];
        
        // Check how many comments this user already has on this post
        const existingCommentsCount = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND author_id = ?')
            .get(post.id, commenter.id).count;
            
        if (existingCommentsCount < 2) { // Max 2 comments per user per post
            const commentText = commentPhrases[Math.floor(Math.random() * commentPhrases.length)];
            insertComment.run(post.id, commenter.id, commentText);
            commentsCreated++;
        }
    }

    // Distribute some random likes across posts
    for (const post of createdPosts) {
        // Not every post needs likes, let's say 0-4 likes per post
        const numLikes = Math.floor(Math.random() * 5);
        const likers = new Set();
        while (likers.size < numLikes) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            if (randomUser.id !== post.authorId) {
                likers.add(randomUser);
            }
        }
        for (const liker of likers) {
            insertLike.run(liker.id, post.id);
        }
    }

    const stats = {
        users: db.prepare('SELECT COUNT(*) AS count FROM users').get().count,
        posts: db.prepare('SELECT COUNT(*) AS count FROM posts').get().count,
        comments: db.prepare('SELECT COUNT(*) AS count FROM comments').get().count,
        likes: db.prepare('SELECT COUNT(*) AS count FROM likes').get().count,
        commentLikes: db.prepare('SELECT COUNT(*) AS count FROM comment_likes').get().count
    };

    console.log(`[SEED] Users created: ${stats.users}`);
    console.log(`[SEED] Posts created: ${stats.posts}`);
    console.log(`[SEED] Comments created: ${stats.comments}`);
    console.log(`[SEED] Post likes created: ${stats.likes}`);
    console.log(`[SEED] Comment likes created: ${stats.commentLikes}`);
    console.log('[SEED] Database population completed.');
}

seed().catch((error) => {
    console.error('[SEED] Error during seeding:', error);
    process.exit(1);
});
