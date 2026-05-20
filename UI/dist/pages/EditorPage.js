import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { useStoryStore } from '../stores/storyStore';
import StoryCanvas from '../components/story/StoryCanvas';
import NodePanel from '../components/story/NodePanel';
export default function EditorPage({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchStory, currentStory, updateGraph, loading } = useStoryStore();
    const [selectedNode, setSelectedNode] = useState(null);
    const [panelVisible, setPanelVisible] = useState(false);
    const isNew = id === 'new';
    useEffect(() => {
        if (isNew) {
            // Set up a blank story
            useStoryStore.setState({ currentStory: {
                    _id: null,
                    title: 'Untitled Story',
                    nodes: [],
                    edges: [],
                    startNodeId: null
                } });
        }
        else if (id) {
            fetchStory(id);
        }
    }, [id, isNew, fetchStory]);
    const handleSave = async (nodes, edges) => {
        if (!currentStory?._id)
            return;
        await updateGraph(currentStory._id, nodes, edges);
    };
    const handleNodeSelect = useCallback((node) => {
        setSelectedNode(node);
        setPanelVisible(!!node);
    }, []);
    const handleNodeUpdate = (nodeId, updates) => {
        if (!currentStory)
            return;
        const updatedNodes = currentStory.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n);
        useStoryStore.setState({
            currentStory: { ...currentStory, nodes: updatedNodes }
        });
        handleSave(updatedNodes, currentStory.edges);
    };
    const handleNodeDelete = (nodeId) => {
        if (!currentStory)
            return;
        const updatedNodes = currentStory.nodes.filter(n => n.id !== nodeId);
        const updatedEdges = currentStory.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        useStoryStore.setState({
            currentStory: { ...currentStory, nodes: updatedNodes, edges: updatedEdges }
        });
        handleSave(updatedNodes, updatedEdges);
        setPanelVisible(false);
    };
    if (!token) {
        return (<div className="flex flex-column align-items-center justify-content-center py-6">
        <h2 className="mb-3">Please log in to access the editor</h2>
        <Button label="Go to Login" icon="pi pi-sign-in" onClick={() => navigate('/login')}/>
      </div>);
    }
    if (loading && !isNew) {
        return (<div className="flex justify-content-center py-6">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
      </div>);
    }
    return (<div className="editor-page flex flex-column" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="flex justify-content-between align-items-center p-3 border-bottom-1 surface-border">
        <h2 className="m-0">{currentStory?.title || 'Untitled Story'}</h2>
        <div className="flex gap-2">
          <Button label="Save" icon="pi pi-save"/>
          <Button label="Publish" icon="pi pi-upload" className="p-button-success"/>
        </div>
      </div>

      <div className="flex-grow-1">
        {currentStory && (<StoryCanvas story={currentStory} onSave={handleSave} onNodeSelect={handleNodeSelect}/>)}
      </div>

      <Sidebar visible={panelVisible} onHide={() => setPanelVisible(false)} position="right" style={{ width: '320px' }}>
        <NodePanel node={selectedNode} onUpdate={handleNodeUpdate} onDelete={handleNodeDelete}/>
      </Sidebar>
    </div>);
}
