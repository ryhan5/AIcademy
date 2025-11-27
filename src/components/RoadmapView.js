'use client';
import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { markModuleComplete, isModuleComplete, XP_REWARDS } from '../utils/UserProgress';
import XPNotification from './XPNotification';
import Link from 'next/link';

// Custom Node Styles
const nodeStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    padding: '10px',
    minWidth: '150px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
};

const rootNodeStyle = {
    ...nodeStyle,
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    border: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    minWidth: '200px',
    padding: '20px',
};

const weekNodeStyle = {
    ...nodeStyle,
    borderColor: 'var(--primary)',
    borderWidth: '2px',
    fontWeight: 'bold',
};

const topicNodeStyle = {
    ...nodeStyle,
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
};

export default function RoadmapView({ goal, experience = 'beginner', timeline = 4 }) {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [xpNotification, setXpNotification] = useState(null);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const response = await fetch('/api/generate-roadmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        goal,
                        experience,
                        timeline,
                        assessment: null
                    }),
                });

                if (!response.ok) throw new Error('Failed to generate roadmap');

                const data = await response.json();
                setRoadmap(data);
                generateGraph(data, goal);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [goal, experience, timeline]);

    const generateGraph = (data, goalTitle) => {
        const newNodes = [];
        const newEdges = [];
        let nodeId = 1;

        // Root Node
        const rootId = 'root';
        newNodes.push({
            id: rootId,
            data: { label: goalTitle },
            position: { x: 0, y: 0 },
            style: rootNodeStyle,
            type: 'input',
        });

        // Calculate layout
        const weekSpacingX = 300;
        const topicSpacingY = 100;
        const startX = -((data.weeks.length - 1) * weekSpacingX) / 2;

        data.weeks.forEach((week, i) => {
            const weekId = `week-${week.week}`;
            const isComplete = isModuleComplete(weekId, goalTitle);
            const xPos = startX + (i * weekSpacingX);
            const yPos = 200;

            // Week Node
            newNodes.push({
                id: weekId,
                data: {
                    label: `Week ${week.week}: ${week.title}`,
                    isComplete
                },
                position: { x: xPos, y: yPos },
                style: {
                    ...weekNodeStyle,
                    borderColor: isComplete ? '#22c55e' : 'var(--primary)',
                    boxShadow: isComplete ? '0 0 15px rgba(34,197,94,0.4)' : 'none',
                },
            });

            newEdges.push({
                id: `e-root-${weekId}`,
                source: rootId,
                target: weekId,
                animated: true,
                style: { stroke: 'rgba(255,255,255,0.2)' },
            });

            // Topic Nodes
            week.topics.forEach((topic, j) => {
                const topicId = `${weekId}-topic-${j}`;
                newNodes.push({
                    id: topicId,
                    data: { label: topic },
                    position: { x: xPos, y: yPos + 100 + (j * topicSpacingY) },
                    style: topicNodeStyle,
                });

                newEdges.push({
                    id: `e-${weekId}-${topicId}`,
                    source: weekId,
                    target: topicId,
                    type: 'smoothstep',
                    style: { stroke: 'rgba(255,255,255,0.1)' },
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    };

    const onNodeClick = useCallback((event, node) => {
        if (node.id.startsWith('week-')) {
            // Handle completion logic
            const weekNum = node.id.split('-')[1];
            const moduleId = node.id;

            // Toggle completion (simplified for UI, real logic in utils)
            // For now, let's just trigger the XP reward if not complete
            if (!isModuleComplete(moduleId, goal)) {
                const reward = markModuleComplete(moduleId, goal);
                if (reward) {
                    setXpNotification({ xp: reward.xpGained, reason: reward.reason });

                    // Update node style locally to reflect completion immediately
                    setNodes((nds) =>
                        nds.map((n) => {
                            if (n.id === node.id) {
                                return {
                                    ...n,
                                    style: {
                                        ...n.style,
                                        borderColor: '#22c55e',
                                        boxShadow: '0 0 15px rgba(34,197,94,0.4)',
                                    },
                                    data: { ...n.data, isComplete: true },
                                };
                            }
                            return n;
                        })
                    );
                }
            }
        }
    }, [goal, setNodes]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 animate-fade-in min-h-[50vh]">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-[var(--primary)]/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Mapping Your Mind...</h3>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 text-red-400">
                <p>Failed to generate mindmap: {error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-white underline">Try Again</button>
            </div>
        );
    }

    return (
        <>
            {xpNotification && (
                <XPNotification
                    xp={xpNotification.xp}
                    reason={xpNotification.reason}
                    onClose={() => setXpNotification(null)}
                />
            )}

            <div className="w-full h-[80vh] glass-panel rounded-3xl border border-white/10 overflow-hidden relative animate-fade-in">
                <div className="absolute top-4 left-4 z-10">
                    <Link href="/dashboard" className="px-4 py-2 bg-black/50 rounded-lg text-white text-sm hover:bg-black/70 transition-colors">
                        ← Back
                    </Link>
                </div>

                <div className="absolute top-4 right-4 z-10 bg-black/50 p-4 rounded-xl backdrop-blur-md border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-1">{goal}</h2>
                    <p className="text-xs text-[var(--text-muted)]">Interactive Mindmap • Click weeks to complete</p>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    fitView
                    attributionPosition="bottom-right"
                    panOnScroll={true}
                    selectionOnDrag={false}
                    panOnDrag={true}
                    minZoom={0.1}
                    maxZoom={1.5}
                >
                    <Background color="#aaa" gap={16} size={1} style={{ opacity: 0.1 }} />
                    <Controls style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white' }} />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.style?.background) return n.style.background;
                            if (n.type === 'input') return 'var(--primary)';
                            return '#eee';
                        }}
                        nodeColor={(n) => {
                            if (n.style?.background) return n.style.background;
                            return '#fff';
                        }}
                        nodeBorderRadius={2}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                        maskColor="rgba(0,0,0,0.6)"
                    />
                </ReactFlow>
            </div>
        </>
    );
}
