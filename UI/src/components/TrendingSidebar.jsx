import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrendingSidebar = () => {
    const navigate = useNavigate();
    const trends = [
        { id: 1, topic: 'Food & Cuisine', posts: '2.4K', sub: '#DeliciousThoughts' },
        { id: 2, topic: 'Artificial Intelligence', posts: '1.8K', sub: '#FutureAI' },
        { id: 3, topic: 'Travel Adventures', posts: '1.2K', sub: '#Wanderlust' },
        { id: 4, topic: 'Web Development', posts: '950', sub: '#CodeLife' },
        { id: 5, topic: 'Design Trends', posts: '820', sub: '#Minimalist' }
    ];

    return (
        <div 
            className="surface-elevated p-4 sticky border-round-xl"
            style={{ maxWidth: '320px', marginTop: '100px' }}
        >
            <h2 className="text-heading font-bold mb-4 px-1" style={{ letterSpacing: '-0.5px' }}>
                Trending Thoughts
            </h2>

            <div className="flex flex-column gap-3">
                {trends.map((trend) => (
                    <div 
                        key={trend.id}
                        className="flex flex-column gap-2 p-3 border-round-lg cursor-pointer hover:bg-primary-light transition-all transition-duration-200 border-1 border-transparent hover:border-primary-light"
                        onClick={() => {
                             const tag = trend.sub.replace('#', '');
                             window.location.href = `/explore?tag=${tag}`;
                        }}
                    >
                        <div className="flex align-items-center justify-content-between">
                            <span className="text-primary font-bold text-sm">{trend.sub}</span>
                            <div className="w-6 h-6 rounded-full bg-primary-light flex align-items-center justify-content-center">
                                <i className="pi pi-chart-line text-xs text-primary"></i>
                            </div>
                        </div>
                        <span className="font-bold text-color text-base hover:underline cursor-pointer">{trend.topic}</span>
                        <span className="text-xs text-500">{trend.posts} discussions</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingSidebar;