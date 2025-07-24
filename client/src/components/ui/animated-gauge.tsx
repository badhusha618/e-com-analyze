import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface AnimatedGaugeProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  label?: string;
  className?: string;
}

export function AnimatedGauge({ 
  value, 
  min = 0, 
  max = 100, 
  size = 200, 
  label = "Score",
  className = ""
}: AnimatedGaugeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 - 20;
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create scales
    const angleScale = d3.scaleLinear()
      .domain([min, max])
      .range([-Math.PI / 2, Math.PI / 2]);

    // Background arc
    const backgroundArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", backgroundArc as any)
      .attr("fill", "currentColor")
      .attr("class", "text-muted-foreground/20");

    // Value arc
    const valueArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2);

    const arcPath = g.append("path")
      .attr("fill", getColorForValue(value))
      .attr("class", "transition-all duration-500");

    // Animate the arc
    arcPath
      .transition()
      .duration(1000)
      .ease(d3.easeElastic.period(0.4))
      .attrTween("d", () => {
        const interpolate = d3.interpolate(prevValueRef.current, value);
        return (t: number) => {
          const currentValue = interpolate(t);
          const endAngle = angleScale(currentValue);
          return (valueArc.endAngle(endAngle) as any)() as string;
        };
      });

    // Needle
    const needleLength = radius - 30;
    const needleAngle = angleScale(value);
    
    const needle = g.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", -needleLength)
      .attr("stroke", "currentColor")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("class", "text-foreground");

    needle
      .transition()
      .duration(1000)
      .ease(d3.easeElastic.period(0.4))
      .attr("transform", `rotate(${(needleAngle * 180) / Math.PI})`);

    // Center circle
    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 8)
      .attr("fill", "currentColor")
      .attr("class", "text-foreground");

    // Value text
    g.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("class", "text-2xl font-bold text-foreground")
      .text(Math.round(value));

    // Label text
    g.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("class", "text-sm text-muted-foreground")
      .text(label);

    // Scale marks
    const ticks = angleScale.ticks(5);
    const tickGroup = g.append("g").attr("class", "ticks");
    
    ticks.forEach((tick: number) => {
      const angle = angleScale(tick);
      const x1 = Math.sin(angle) * (radius - 25);
      const y1 = -Math.cos(angle) * (radius - 25);
      const x2 = Math.sin(angle) * (radius - 15);
      const y2 = -Math.cos(angle) * (radius - 15);
      
      tickGroup.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "currentColor")
        .attr("stroke-width", 1)
        .attr("class", "text-muted-foreground");
        
      tickGroup.append("text")
        .attr("x", Math.sin(angle) * (radius - 5))
        .attr("y", -Math.cos(angle) * (radius - 5))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("class", "text-xs text-muted-foreground")
        .text(tick);
    });

    prevValueRef.current = value;
  }, [value, min, max, size, label]);

  function getColorForValue(val: number): string {
    if (val >= 70) return "hsl(142, 76%, 36%)"; // green
    if (val >= 50) return "hsl(48, 96%, 53%)"; // yellow
    return "hsl(0, 84%, 60%)"; // red
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg ref={svgRef} className="drop-shadow-sm" />
    </div>
  );
}