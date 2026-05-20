import { useCallback, useEffect, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { gsap } from 'gsap';
import VideoNode from './VideoNode';
import ChoiceNode from './ChoiceNode';
import AnimationNode from './AnimationNode';
import './StoryCanvas.css';
const nodeTypes = {
    video: VideoNode,
    choice: ChoiceNode,
    animation: AnimationNode
};
export default function StoryCanvas({ story, onSave, onNodeSelect }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(story?.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(story?.edges || []);
    const saveTimer = useRef(null);
    useEffect(() => {
        if (story?.nodes)
            setNodes(story.nodes);
        if (story?.edges)
            setEdges(story.edges);
    }, [story]);
    const triggerSave = useCallback((ns, es) => {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            onSave?.(ns, es);
        }, 1200);
    }, [onSave]);
    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);
        setNodes(ns => {
            triggerSave(ns, edges);
            return ns;
        });
    }, [onNodesChange, edges, triggerSave]);
    const handleEdgesChange = useCallback((changes) => {
        onEdgesChange(changes);
        setEdges(es => {
            triggerSave(nodes, es);
            return es;
        });
    }, [onEdgesChange, nodes, triggerSave]);
    const onConnect = useCallback((params) => {
        setEdges(es => {
            const newEdges = addEdge({ ...params, animated: true }, es);
            triggerSave(nodes, newEdges);
            return newEdges;
        });
    }, [nodes, triggerSave]);
    const addNode = useCallback((type) => {
        const id = `node_${Date.now()}`;
        const defaults = {
            video: { label: 'New Scene', thumbnailUrl: null, duration: null },
            choice: { prompt: 'What happens next?', choices: [{ id: 'c0', text: 'Option A' }, { id: 'c1', text: 'Option B' }] },
            animation: { animationType: 'fade', animationDuration: 1.2 }
        };
        const newNode = {
            id,
            type,
            position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 100 },
            data: { label: type === 'video' ? 'New Scene' : '', ...defaults[type] }
        };
        setNodes(ns => {
            const updated = [...ns, newNode];
            triggerSave(updated, edges);
            return updated;
        });
        requestAnimationFrame(() => {
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el)
                gsap.fromTo(el, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(1.6)' });
        });
    }, [edges, triggerSave]);
    const proOptions = { hideAttribution: true };
    return (<div className="story-canvas">
      <div className="story-canvas__toolbar">
        <span className="story-canvas__toolbar-label">Add node</span>
        <button className="canvas-btn canvas-btn--video" onClick={() => addNode('video')}>
          ▶ Video
        </button>
        <button className="canvas-btn canvas-btn--choice" onClick={() => addNode('choice')}>
          ⊕ Choice
        </button>
        <button className="canvas-btn canvas-btn--anim" onClick={() => addNode('animation')}>
          ✦ FX
        </button>
      </div>

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={handleNodesChange} onEdgesChange={handleEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} onNodeClick={(_, node) => onNodeSelect?.(node)} onPaneClick={() => onNodeSelect?.(null)} fitView proOptions={proOptions} defaultEdgeOptions={{
            animated: true,
            style: { stroke: 'var(--border2)', strokeWidth: 2 }
        }}>
        <Background color="var(--border)" gap={24} size={1}/>
        <Controls className="flow-controls"/>
        <MiniMap nodeColor={(n) => {
            if (n.type === 'video')
                return '#F5A623';
            if (n.type === 'choice')
                return '#7C6AF7';
            if (n.type === 'animation')
                return '#22D9A0';
            return '#2A2A38';
        }} style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}/>
      </ReactFlow>
    </div>);
}
