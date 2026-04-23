import React, { useEffect, useRef } from "react";
import { X, MessageCircle, Map, Share2, ZoomIn, ZoomOut, Download } from "lucide-react";
import * as d3 from "d3";
import { MindMap, MindMapNode } from "../../types";

interface MindMapViewProps {
  mindMap: MindMap;
  onClose: () => void;
  onAskTutor: (q: string) => void;
  onDelete: (id: string) => void;
}

export function MindMapView({ mindMap, onClose, onAskTutor, onDelete }: MindMapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !mindMap.root) return;

    const width = 1000;
    const height = 800;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<MindMapNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const root = d3.hierarchy(mindMap.root);
    tree(root);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#e4e4e7")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 6)
      .attr("fill", (d: any) => d.children ? "#10b981" : "#fff")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.children ? -12 : 12)
      .attr("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.label)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#18181b")
      .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    // Zoom behavior
    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom as any);

  }, [mindMap]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 text-left">
             <div className="p-3 rounded-2xl bg-violet-50 text-violet-600"><Map size={20} /></div>
             <div>
                <h3 className="text-xl font-bold text-zinc-900">{mindMap.title}</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Mind Map Interactive (D3.js)</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-zinc-50 relative">
           <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
           <div className="absolute bottom-8 right-8 flex gap-2">
              <button className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-all text-zinc-400 hover:text-zinc-900"><ZoomIn size={20}/></button>
              <button className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-all text-zinc-400 hover:text-zinc-900"><ZoomOut size={20}/></button>
              <button className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-all text-zinc-400 hover:text-zinc-900"><Download size={20}/></button>
           </div>
        </div>

        <div className="p-8 bg-white border-t border-zinc-100 flex justify-between items-center">
           <p className="text-xs text-zinc-400 font-medium italic">Utilisez la molette pour zoomer et glissez pour déplacer.</p>
           <button 
            onClick={() => onAskTutor(`Explique moi les concepts clés de cette mindmap : "${mindMap.title}"`)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
           >
             <MessageCircle size={18} /> Approfondir avec l'IA
           </button>
        </div>
      </div>
    </div>
  );
}
