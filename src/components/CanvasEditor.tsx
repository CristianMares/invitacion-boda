'use client';
import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';

export default function CanvasEditor({ tables, decorations, setTables, setDecorations }: any) {
  const [selectedId, selectShape] = useState<string | null>(null);
  const trRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (selectedId && trRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) selectShape(null);
  };

  const handleDragEnd = (e: any, id: string, type: 'table' | 'decor') => {
    const { x, y } = e.target.position();
    const px = (x / 1200) * 100;
    const py = (y / 800) * 100;
    
    if (type === 'decor') {
      setDecorations((prev: any) => prev.map((d: any) => d.id === id ? { ...d, pos_x: px, pos_y: py } : d));
    } else {
      setTables((prev: any) => prev.map((t: any) => t.id === id ? { ...t, pos_x: px, pos_y: py } : t));
    }
  };

  const handleTransformEnd = (e: any, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newWidth = (Math.max(5, node.width() * scaleX) / 1200) * 100;
    const newHeight = (Math.max(5, node.height() * scaleY) / 800) * 100;
    const newRotation = node.rotation();

    setDecorations((prev: any) => prev.map((d: any) => d.id === id ? { 
      ...d, width: newWidth, height: newHeight, rotation: newRotation 
    } : d));
  };

  return (
    <Stage width={1200} height={800} onMouseDown={checkDeselect} onTouchStart={checkDeselect} ref={stageRef} className="bg-[#FAF7F2] cursor-crosshair">
      <Layer>
        {decorations.map((d: any) => (
          <Rect
            key={d.id}
            id={d.id}
            x={(d.pos_x / 100) * 1200}
            y={(d.pos_y / 100) * 800}
            width={(d.width / 100) * 1200}
            height={(d.height / 100) * 800}
            fill={d.bg_color || '#E8A881'}
            rotation={d.rotation || 0}
            draggable
            onClick={() => selectShape(d.id)}
            onTap={() => selectShape(d.id)}
            onDragEnd={(e) => handleDragEnd(e, d.id, 'decor')}
            onTransformEnd={(e) => handleTransformEnd(e, d.id)}
            shadowColor="black"
            shadowBlur={5}
            shadowOpacity={0.1}
            cornerRadius={4}
          />
        ))}

        {decorations.map((d: any) => (
          <Text
            key={`txt-${d.id}`}
            x={(d.pos_x / 100) * 1200 + 10}
            y={(d.pos_y / 100) * 800 + 10}
            text={d.label}
            fontSize={14}
            fontFamily="monospace"
            fill="#4A3320"
            listening={false}
          />
        ))}

        {tables.map((t: any) => (
          <Circle
            key={t.id}
            id={t.id}
            x={(t.pos_x / 100) * 1200}
            y={(t.pos_y / 100) * 800}
            radius={30}
            fill="#165A72"
            stroke="#0E3D4D"
            strokeWidth={3}
            draggable
            onClick={() => selectShape(t.id)}
            onTap={() => selectShape(t.id)}
            onDragEnd={(e) => handleDragEnd(e, t.id, 'table')}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.2}
          />
        ))}

        {tables.map((t: any) => (
          <Text
            key={`txt-${t.id}`}
            x={(t.pos_x / 100) * 1200 - 10}
            y={(t.pos_y / 100) * 800 - 10}
            text={t.table_number.toString()}
            fontSize={24}
            fontFamily="serif"
            fill="white"
            fontStyle="bold"
            listening={false}
          />
        ))}

        {selectedId && (
          <Transformer 
            ref={trRef} 
            boundBoxFunc={(oldBox, newBox) => newBox.width < 10 || newBox.height < 10 ? oldBox : newBox} 
            borderStroke="#F59E0B"
            anchorStroke="#F59E0B"
            anchorFill="#000"
            anchorSize={10}
          />
        )}
      </Layer>
    </Stage>
  );
}