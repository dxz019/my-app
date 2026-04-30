import React from 'react';
import { useNavigate } from 'react-router-dom';
import IntroOverlay from '../components/IntroOverlay';

const LandingPage = () => {
    const navigate = useNavigate();

const handleIntroFinish = () => {
    // Always navigate to home after intro
    navigate('/home');
};

    return <IntroOverlay onFinish={handleIntroFinish} />;
};

export default LandingPage;
