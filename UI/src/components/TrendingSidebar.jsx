import React from 'react';

const TrendingSidebar = () => {
    const trends = [
        { id: 1, topic: 'Food & Cuisine', posts: '2.4K', sub: '#DeliciousThoughts' },
        { id: 2, topic: 'Artificial Intelligence', posts: '1.8K', sub: '#FutureAI' },
        { id: 3, topic: 'Travel Adventures', posts: '1.2K', sub: '#Wanderlust' },
        { id: 4, topic: 'Web Development', posts: '950', sub: '#CodeLife' },
        { id: 5, topic: 'Design Trends', posts: '820', sub: '#Minimalist' }
    ];

    return (
        <div 
            className="surface-card p-4 h-fit sticky top-0 z-1 shadow-3 border-round-2xl border-1 surface-border" 
            style={{ top: '100px' }}
        >
            <h2 className="text-xl font-bold mb-4 px-2 text-color" style={{ letterSpacing: '-0.5px' }}>
                Trending Thoughts
            </h2>

            <div className="flex flex-column gap-2">
                {trends.map((trend) => (
                    <div 
                        key={trend.id}
                        className="flex flex-column gap-1 p-3 border-round-xl cursor-pointer hover:bg-black-alpha-10 transition-all transition-duration-200"
                        onClick={() => {
                             const tag = trend.sub.replace('#', '');
                             window.location.href = `/explore?tag=${tag}`;
                        }}
                    >
                        <div className="flex align-items-center justify-content-between">
                            <span className="text-sm font-semibold text-primary">{trend.sub}</span>
                            <i className="pi pi-chart-line text-xs text-primary"></i>
                        </div>
                        <span className="text-base font-bold text-color">{trend.topic}</span>
                        <span className="text-xs text-color-secondary">{trend.posts} Thoughts today</span>
                    </div>
                ))}
            </div>
        </div>
    );


};

export default TrendingSidebar;

