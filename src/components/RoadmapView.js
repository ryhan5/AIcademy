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
import { useRouter } from 'next/navigation';

// Custom Node Styles
const nodeStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    color: 'white',
    padding: '12px 20px',
    minWidth: '180px',
    textAlign: 'center',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
};

const rootNodeStyle = {
    ...nodeStyle,
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.8), rgba(79, 70, 229, 0.8))',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '1.4rem',
    fontWeight: '900',
    minWidth: '240px',
    padding: '24px',
    boxShadow: '0 0 40px rgba(124, 58, 237, 0.3)',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
};

const weekNodeStyle = {
    ...nodeStyle,
    borderColor: 'var(--primary)',
    borderWidth: '1px',
    fontWeight: '700',
    fontSize: '1.1rem',
};

const topicNodeStyle = {
    ...nodeStyle,
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
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
        const weekSpacingX = 350;
        const topicSpacingY = 120;
        const startX = -((data.weeks.length - 1) * weekSpacingX) / 2;

        data.weeks.forEach((week, i) => {
            const weekId = `week-${week.week}`;
            const isComplete = isModuleComplete(weekId, goalTitle);
            const xPos = startX + (i * weekSpacingX);
            const yPos = 250;

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
                    borderColor: isComplete ? '#22c55e' : 'rgba(124, 58, 237, 0.5)',
                    background: isComplete ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    boxShadow: isComplete ? '0 0 20px rgba(34,197,94,0.2)' : 'none',
                },
            });

            newEdges.push({
                id: `e-root-${weekId}`,
                source: rootId,
                target: weekId,
                animated: true,
                style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 },
            });

            // Topic Nodes
            week.topics.forEach((topic, j) => {
                const topicId = `${weekId}-topic-${j}`;
                newNodes.push({
                    id: topicId,
                    data: { label: topic },
                    position: { x: xPos, y: yPos + 120 + (j * topicSpacingY) },
                    style: topicNodeStyle,
                });

                newEdges.push({
                    id: `e-${weekId}-${topicId}`,
                    source: weekId,
                    target: topicId,
                    type: 'smoothstep',
                    style: { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 },
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    };

    const router = useRouter();

    const onNodeClick = useCallback((event, node) => {
        // Handle Topic Nodes - Generate Course
        if (node.id.includes('topic')) {
            const topic = node.data.label;
            if (confirm(`🎓 Want to generate a full course for "${topic}"?`)) {
                router.push(`/course?topic=${encodeURIComponent(topic)}`);
            }
            return;
        }

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
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        boxShadow: '0 0 20px rgba(34,197,94,0.2)',
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
    }, [goal, setNodes, router]);

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

            <div className="w-full h-[85vh] glass-panel rounded-3xl border border-white/10 overflow-hidden relative animate-fade-in shadow-2xl">
                {/* Ambient Background */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="absolute top-6 left-6 z-10">
                    <Link href="/dashboard" className="px-5 py-2.5 bg-black/40 backdrop-blur-md rounded-xl text-white text-sm font-medium hover:bg-black/60 transition-all border border-white/10 flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
                    </Link>
                </div>

                <div className="absolute top-6 right-6 z-10 bg-black/40 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg max-w-xs">
                    <h2 className="text-xl font-bold text-white mb-1">{goal}</h2>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Interactive Roadmap • Click weeks to complete • Click topics to generate courses
                    </p>
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
                    <Background color="#666" gap={20} size={1} style={{ opacity: 0.05 }} />
                    <Controls style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.style?.borderColor) return n.style.borderColor;
                            return 'rgba(255,255,255,0.2)';
                        }}
                        nodeColor={(n) => {
                            if (n.style?.background && !n.style.background.includes('gradient')) return n.style.background;
                            return 'rgba(255,255,255,0.1)';
                        }}
                        nodeBorderRadius={8}
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        maskColor="rgba(0,0,0,0.4)"
                    />
                </ReactFlow>
            </div>
        </>
    );
}
