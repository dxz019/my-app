import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useStoryStore } from '../stores/storyStore';
import './Player.css';
export default function PlayerPage({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchStory, currentStory, loading } = useStoryStore();
    const videoRef = useRef(null);
    const [currentNode, setCurrentNode] = useState(null);
    const [showChoice, setShowChoice] = useState(false);
    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (id) {
            fetchStory(id);
        }
    }, [id, fetchStory]);
    const getNode = useCallback((nodeId) => {
        return currentStory?.nodes?.find(n => n.id === nodeId);
    }, [currentStory]);
    const getTargets = useCallback((nodeId) => {
        return (currentStory?.edges || []).filter(e => e.source === nodeId);
    }, [currentStory]);
    useEffect(() => {
        if (!currentNode)
            return;
        if (currentNode.type === 'video' && currentNode.data?.hlsUrl) {
            const video = videoRef.current;
            if (video) {
                video.src = currentNode.data.hlsUrl;
                video.play().then(() => setIsPlaying(true)).catch(() => { });
            }
        }
        if (currentNode.type === 'end') {
            setEnded(true);
        }
    }, [currentNode]);
    const handleVideoEnd = useCallback(() => {
        const edges = getTargets(currentNode?.id);
        if (!edges.length) {
            setEnded(true);
            return;
        }
        const nextEdge = edges[0];
        const nextNode = getNode(nextEdge.target);
        if (!nextNode) {
            setEnded(true);
            return;
        }
        if (nextNode.type === 'choice') {
            setCurrentNode(nextNode);
            setShowChoice(true);
        }
        else {
            setCurrentNode(nextNode);
        }
    }, [currentNode, getTargets, getNode]);
    const handleChoose = useCallback((targetNodeId) => {
        setShowChoice(false);
        const targetNode = getNode(targetNodeId);
        if (targetNode) {
            setCurrentNode(targetNode);
        }
    }, [getNode]);
    const startStory = () => {
        const startNode = getNode(currentStory.startNodeId) || currentStory.nodes?.[0];
        if (!startNode)
            return;
        setStarted(true);
        setCurrentNode(startNode);
    };
    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current?.play();
            setIsPlaying(true);
        }
        else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video && video.duration) {
            setProgress((video.currentTime / video.duration) * 100);
        }
    };
    if (loading) {
        return (<div className="flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
      </div>);
    }
    if (!currentStory) {
        return (<div className="flex flex-column align-items-center justify-content-center py-6">
        <h2>Story not found</h2>
        <Button label="Go Back" onClick={() => navigate('/dashboard')}/>
      </div>);
    }
    if (!started) {
        return (<div className="player-preroll flex flex-column align-items-center justify-content-center">
        <h1 className="mb-3">{currentStory.title}</h1>
        {currentStory.description && (<p className="mb-4 text-secondary">{currentStory.description}</p>)}
        <Button label="Begin Story" icon="pi pi-play" size="large" onClick={startStory}/>
      </div>);
    }
    if (ended) {
        return (<div className="flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
        <h2>Story Complete</h2>
        <p className="mb-4">Thanks for watching <em>{currentStory.title}</em></p>
        <Button label="Watch Again" icon="pi pi-refresh" onClick={() => {
                setEnded(false);
                setStarted(false);
                setCurrentNode(null);
            }}/>
      </div>);
    }
    return (<div className="cine-player">
      <video ref={videoRef} className="cine-player__video" onEnded={handleVideoEnd} onTimeUpdate={handleTimeUpdate} playsInline crossOrigin="anonymous"/>

      {showChoice && currentNode && (<div className="choice-overlay">
          <h3 className="mb-3">{currentNode.data?.prompt || 'What happens next?'}</h3>
          <div className="flex flex-column gap-2">
            {(currentNode.data?.choices || []).map(choice => (<Button key={choice.id} label={choice.text} onClick={() => handleChoose(choice.targetNodeId)} className="p-button-lg"/>))}
          </div>
        </div>)}

      <div className="cine-player__controls">
        <div className="cine-player__progress">
          <div className="cine-player__progress-fill" style={{ width: `${progress}%` }}/>
        </div>
        <div className="flex align-items-center gap-2">
          <Button icon={isPlaying ? 'pi pi-pause' : 'pi pi-play'} onClick={togglePlay} className="p-button-rounded"/>
          <span className="text-sm text-secondary">{currentNode?.data?.label}</span>
        </div>
      </div>
    </div>);
}
