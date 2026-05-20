import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Intro.css';
const IntroOverlay = ({ onFinish }) => {
    const [phase, setPhase] = useState('intro'); // 'intro' | 'hold' | 'outro'
    const navigate = useNavigate();
    useEffect(() => {
        // Phase 1: Cinematic intro (0–1.5s) - logo appears with scale/blur
        const introTimer = setTimeout(() => {
            setPhase('hold');
        }, 1600);
        // Phase 2: Hold (1.5–4.5s) - logo sits elegantly (total 4.5s)
        const holdTimer = setTimeout(() => {
            setPhase('outro');
        }, 4500);
        // Phase 3: Fade out and navigate (4.5–6s)
        const outroTimer = setTimeout(() => {
            if (onFinish) {
                onFinish();
            }
            else {
                navigate('/home');
            }
        }, 6000);
        return () => {
            clearTimeout(introTimer);
            clearTimeout(holdTimer);
            clearTimeout(outroTimer);
        };
    }, [navigate, onFinish]);
    return (<div className={`intro-overlay ${phase}`}>
            {/* Ambient background gradient */}
            <div className="intro-bg-gradient"></div>

             {/* Large Floating Particles */}
             <div className="intro-particles">
                 {[...Array(40)].map((_, i) => (<div key={i} className="intro-particle" style={{
                '--tx': `${(Math.random() - 0.5) * 200}px`,
                '--ty': `${(Math.random() - 0.5) * 200}px`,
                'animationDelay': `${Math.random() * 3}s`
            }}/>))}
             </div>

            {/* Center logo */}
            <div className="intro-logo-wrapper">
                <div className="intro-logo">
                    <span className="intro-logo-text">THOUGHTS</span>
                    <div className="intro-logo-glow"></div>
                </div>
            </div>

             {/* Tagline */}
             <div className="intro-tagline">
                 <p>Visualise • Share • Inspire</p>
             </div>
        </div>);
};
export default IntroOverlay;
